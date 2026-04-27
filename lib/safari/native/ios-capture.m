/*
 * iOS screen capture server for Browsertime.
 *
 * Enables CoreMediaIO screen capture devices, finds the connected iOS device,
 * and accepts commands via stdin to start/stop recording.
 *
 * Commands (via stdin):
 *   START <filepath>   - Start recording to the given file path
 *   STOP               - Stop recording
 *   QUIT               - Stop recording and exit
 *
 * Responses (via stdout):
 *   READY              - Device found, ready to accept commands
 *   RECORDING          - Recording started
 *   STOPPED            - Recording stopped, file written
 *   ERROR <message>    - An error occurred
 *
 * Compile:
 *   clang -framework CoreMediaIO -framework AVFoundation -framework CoreVideo \
 *         -framework CoreMedia -framework Foundation ios-capture.m -o ios-capture
 */

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMediaIO/CMIOHardwareSystem.h>
#import <CoreMediaIO/CMIOHardwareDevice.h>
#import <CoreVideo/CoreVideo.h>
#import <CoreMedia/CoreMedia.h>
#import <signal.h>
#import <unistd.h>

static volatile sig_atomic_t shouldQuit = 0;

/*
 * Signal handler: set the quit flag and close stdin so the main loop's
 * blocking fgets() returns immediately. We can't safely call AVFoundation
 * teardown from a signal handler, so we just unblock the loop and let
 * main() do the [session stopRunning] / pclose on its way out.
 * close() is async-signal-safe per POSIX.
 */
void handleSignal(int sig) {
    shouldQuit = 1;
    close(STDIN_FILENO);
}

/*
 * Enumerate all CoreMediaIO devices directly (bypasses AVFoundation filtering)
 * and return their unique IDs. On modern macOS, AVCaptureDeviceDiscoverySession
 * sometimes hides iOS devices that CMIO has registered; iterating CMIO directly
 * is the most reliable way to discover them.
 */
static NSArray<NSString *> *enumerateCMIODeviceUIDs(void) {
    NSMutableArray<NSString *> *uids = [NSMutableArray array];

    CMIOObjectPropertyAddress addr = {
        kCMIOHardwarePropertyDevices,
        kCMIOObjectPropertyScopeGlobal,
        kCMIOObjectPropertyElementMain
    };

    UInt32 dataSize = 0;
    if (CMIOObjectGetPropertyDataSize(kCMIOObjectSystemObject, &addr, 0, NULL, &dataSize) != 0) {
        return uids;
    }
    UInt32 count = dataSize / sizeof(CMIOObjectID);
    if (count == 0) return uids;

    CMIOObjectID *deviceIDs = (CMIOObjectID *)malloc(dataSize);
    if (CMIOObjectGetPropertyData(kCMIOObjectSystemObject, &addr, 0, NULL, dataSize, &dataSize, deviceIDs) != 0) {
        free(deviceIDs);
        return uids;
    }

    for (UInt32 i = 0; i < count; i++) {
        CFStringRef uid = NULL;
        UInt32 propSize = sizeof(uid);
        CMIOObjectPropertyAddress uidAddr = {
            kCMIODevicePropertyDeviceUID,
            kCMIOObjectPropertyScopeGlobal,
            kCMIOObjectPropertyElementMain
        };
        if (CMIOObjectGetPropertyData(deviceIDs[i], &uidAddr, 0, NULL, propSize, &propSize, &uid) == 0 && uid) {
            [uids addObject:(__bridge NSString *)uid];
            CFRelease(uid);
        }
    }
    free(deviceIDs);
    return uids;
}

/*
 * Try to find an iOS device by checking every plausible AVCaptureDeviceType
 * AND every UID reported by CMIO directly. Returns the first device whose
 * media type includes muxed (audio+video) — the signature of an iOS device.
 */
static AVCaptureDevice *findIOSCaptureDevice(void) {
    NSArray<AVCaptureDeviceType> *types = @[
        AVCaptureDeviceTypeExternal,
        AVCaptureDeviceTypeContinuityCamera,
        AVCaptureDeviceTypeBuiltInWideAngleCamera,
        AVCaptureDeviceTypeDeskViewCamera
    ];
    NSArray<AVMediaType> *medias = @[AVMediaTypeMuxed, AVMediaTypeVideo];

    for (AVCaptureDeviceType t in types) {
        for (AVMediaType m in medias) {
            AVCaptureDeviceDiscoverySession *ds = [AVCaptureDeviceDiscoverySession
                discoverySessionWithDeviceTypes:@[t]
                mediaType:m
                position:AVCaptureDevicePositionUnspecified];
            for (AVCaptureDevice *d in ds.devices) {
                if ([d hasMediaType:AVMediaTypeMuxed]) {
                    return d;
                }
            }
        }
    }

    /* Fallback: bridge each CMIO UID to AVCaptureDevice and pick a muxed one */
    for (NSString *uid in enumerateCMIODeviceUIDs()) {
        AVCaptureDevice *d = [AVCaptureDevice deviceWithUniqueID:uid];
        if (d && [d hasMediaType:AVMediaTypeMuxed]) {
            fprintf(stderr, "Found iOS device via CMIO bridge: %s (uid=%s)\n",
                    [[d localizedName] UTF8String], [uid UTF8String]);
            return d;
        }
    }

    return nil;
}

@interface Recorder : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate>
@property (nonatomic, strong) AVCaptureSession *session;
@property (nonatomic, assign) int frameCount;
@property (nonatomic, assign) int width;
@property (nonatomic, assign) int height;
@property (nonatomic, assign) BOOL isRecording;
@property (nonatomic, assign) FILE *ffmpegPipe;
@property (nonatomic, assign) int framerate;
@end

@implementation Recorder

- (void)captureOutput:(AVCaptureOutput *)output
    didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
    fromConnection:(AVCaptureConnection *)connection {

    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    if (!imageBuffer) return;

    CVPixelBufferLockBaseAddress(imageBuffer, kCVPixelBufferLock_ReadOnly);

    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);

    /* Always update dimensions from incoming frames */
    if (self.width == 0) {
        self.width = (int)width;
        self.height = (int)height;
        fprintf(stderr, "Device resolution: %dx%d\n", self.width, self.height);
    }

    /* Only write frames when recording */
    if (self.isRecording && self.ffmpegPipe) {
        size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);
        void *baseAddress = CVPixelBufferGetBaseAddress(imageBuffer);
        if (baseAddress) {
            for (size_t row = 0; row < height; row++) {
                fwrite((uint8_t *)baseAddress + row * bytesPerRow, 1, width * 4, self.ffmpegPipe);
            }
            self.frameCount++;
        }
    }

    CVPixelBufferUnlockBaseAddress(imageBuffer, kCVPixelBufferLock_ReadOnly);
}

- (BOOL)startRecordingToFile:(NSString *)path {
    if (self.isRecording) {
        [self stopRecording];
    }

    self.frameCount = 0;

    /* Wait for dimensions if we haven't seen a frame yet */
    if (self.width == 0) {
        fprintf(stderr, "Waiting for first frame...\n");
        for (int i = 0; i < 100 && self.width == 0; i++) {
            [NSThread sleepForTimeInterval:0.1];
        }
        if (self.width == 0) {
            fprintf(stderr, "Could not determine video dimensions\n");
            return NO;
        }
    }

    int evenWidth = (self.width / 2) * 2;
    int evenHeight = (self.height / 2) * 2;

    NSString *cmd = [NSString stringWithFormat:
        @"ffmpeg -f rawvideo -pix_fmt bgra -s %dx%d -r %d -i - "
        @"-vf 'scale=%d:%d' "
        @"-c:v libx264 -preset ultrafast -pix_fmt yuv420p -y '%@' 2>/dev/null",
        self.width, self.height, self.framerate,
        evenWidth, evenHeight,
        path];

    self.ffmpegPipe = popen([cmd UTF8String], "w");
    if (!self.ffmpegPipe) {
        fprintf(stderr, "Failed to start ffmpeg\n");
        return NO;
    }

    self.isRecording = YES;
    self.frameCount = 0;
    return YES;
}

- (void)stopRecording {
    self.isRecording = NO;

    if (self.ffmpegPipe) {
        pclose(self.ffmpegPipe);
        self.ffmpegPipe = NULL;
    }

    fprintf(stderr, "Recorded %d frames\n", self.frameCount);
}

@end

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        signal(SIGINT, handleSignal);
        signal(SIGTERM, handleSignal);

        int framerate = 30;
        for (int i = 1; i < argc; i++) {
            if (strcmp(argv[i], "-r") == 0 && i + 1 < argc) {
                framerate = atoi(argv[++i]);
            }
        }

        /* Step 1: Enable screen capture devices */
        CMIOObjectPropertyAddress prop = {
            kCMIOHardwarePropertyAllowScreenCaptureDevices,
            kCMIOObjectPropertyScopeGlobal,
            kCMIOObjectPropertyElementMain
        };
        UInt32 allow = 1;
        CMIOObjectSetPropertyData(kCMIOObjectSystemObject, &prop, 0, NULL, sizeof(allow), &allow);

        /* Step 2: Warm up AVCaptureDevice */
        #pragma clang diagnostic push
        #pragma clang diagnostic ignored "-Wdeprecated-declarations"
        [AVCaptureDevice devices];
        #pragma clang diagnostic pop
        [NSThread sleepForTimeInterval:1.0];

        /* Log what CMIO sees directly — useful when discovery fails */
        NSArray<NSString *> *cmioUIDs = enumerateCMIODeviceUIDs();
        fprintf(stderr, "CMIO reports %lu device(s)\n", (unsigned long)cmioUIDs.count);
        for (NSString *uid in cmioUIDs) {
            fprintf(stderr, "  CMIO UID: %s\n", [uid UTF8String]);
        }

        /* Step 3: Find iOS device — multi-type filter + CMIO bridge fallback */
        AVCaptureDevice *device = nil;
        for (int attempt = 0; attempt < 20 && !device; attempt++) {
            device = findIOSCaptureDevice();
            if (!device) [NSThread sleepForTimeInterval:0.5];
        }

        if (!device) {
            fprintf(stdout, "ERROR No iOS device found\n");
            fflush(stdout);
            return 1;
        }

        fprintf(stderr, "Found device: %s\n", [[device localizedName] UTF8String]);

        /* Step 4: Set up capture session */
        AVCaptureSession *session = [[AVCaptureSession alloc] init];
        NSError *error = nil;
        AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:device error:&error];
        if (!input) {
            fprintf(stdout, "ERROR Failed to create capture input\n");
            fflush(stdout);
            return 1;
        }
        [session addInput:input];

        AVCaptureVideoDataOutput *videoOutput = [[AVCaptureVideoDataOutput alloc] init];
        videoOutput.videoSettings = @{
            (NSString *)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA)
        };

        Recorder *recorder = [[Recorder alloc] init];
        recorder.framerate = framerate;

        dispatch_queue_t queue = dispatch_queue_create("capture", DISPATCH_QUEUE_SERIAL);
        [videoOutput setSampleBufferDelegate:recorder queue:queue];
        [session addOutput:videoOutput];

        [session startRunning];

        /* Signal ready */
        fprintf(stdout, "READY\n");
        fflush(stdout);

        /* Step 5: Read commands from stdin */
        char line[4096];
        while (!shouldQuit && fgets(line, sizeof(line), stdin)) {
            /* Remove newline */
            size_t len = strlen(line);
            if (len > 0 && line[len-1] == '\n') line[len-1] = '\0';

            if (strncmp(line, "START ", 6) == 0) {
                NSString *path = [NSString stringWithUTF8String:line + 6];
                if ([recorder startRecordingToFile:path]) {
                    fprintf(stdout, "RECORDING\n");
                } else {
                    fprintf(stdout, "ERROR Failed to start recording\n");
                }
                fflush(stdout);
            } else if (strcmp(line, "STOP") == 0) {
                [recorder stopRecording];
                fprintf(stdout, "STOPPED\n");
                fflush(stdout);
            } else if (strcmp(line, "QUIT") == 0) {
                [recorder stopRecording];
                shouldQuit = YES;
            }
        }

        [recorder stopRecording];
        [session stopRunning];
        return 0;
    }
}
