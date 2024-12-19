#!/usr/bin/env python3
"""
Copyright (c) 2014, Google Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of the company nor the names of its contributors may be
      used to endorse or promote products derived from this software without
      specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."""
#
# The original script from Google was heavily modified for the Browsertime
# project.
#
import gc
import glob
import gzip
import json
import logging
import math
import os
import re
import sys
import shutil
import subprocess
import tempfile


GZIP_TEXT = "wt"
GZIP_READ_TEXT = "rt"

# Globals
options = None
client_viewport = None
frame_cache = {}


# #################################################################################################
# Replacement methods for ImageMagick to Python conversion
# #################################################################################################


def compare(img1, img2, fuzz=0.10):
    """Calculate the Absolute Error count between given images."""
    try:
        import numpy as np

        img1_data = np.array(img1)
        img2_data = np.array(img2)

        inds = np.argwhere(
            np.isclose(img1_data[:, :, 0], img2_data[:, :, 0], atol=fuzz * 255)
            & np.isclose(img1_data[:, :, 1], img2_data[:, :, 1], atol=fuzz * 255)
            & np.isclose(img1_data[:, :, 2], img2_data[:, :, 2], atol=fuzz * 255)
        )

        return (img1_data.shape[0] * img1_data.shape[1]) - len(inds)
    except BaseException as e:
        logging.exception(e)
        return None


def crop_im(img, crop_x, crop_y, crop_x_offset, crop_y_offset, gravity=None):
    """Crop an image.

    If gravity is equal to "center", the crop region will
    first be centered before applying the crop.
    """
    try:
        import numpy as np
        from PIL import Image

        img = np.array(img)

        base_x = 0
        base_y = 0

        height, width, _ = img.shape
        if gravity == "center":
            base_x = width // 2
            base_y = height // 2

            base_x -= crop_x // 2
            base_y -= crop_y // 2

        # Handle the boundaries of the crop using max to prevent
        # negatives, and min to prevent going over the othersde of
        # the image
        start_x = min(width - 1, max(base_x + crop_x_offset, 0))
        start_y = min(height - 1, max(base_y + crop_y_offset, 0))

        end_x = min(width - 1, max(start_x + crop_x, 0))
        end_y = min(height - 1, max(start_y + crop_y, 0))

        if len(img[start_y:end_y, start_x:end_x, :]) == 0:
            raise Exception(
                f"Cropped image is empty. Image dimensions: {img.shape}, "
                f"Crop Region: {crop_x}, {crop_y}, {crop_x_offset}, {crop_y_offset}"
            )

        return Image.fromarray(img[start_y:end_y, start_x:end_x, :])
    except BaseException as e:
        logging.exception(e)
        return None


def resize(img, width, height):
    """Resize an image to the given width, and height."""

    try:
        from PIL import Image

        try:
            # If it's a numpy array, convert it first
            img = Image.fromarray(img)
        except:
            pass

        return img.resize((width, height), resample=Image.LANCZOS)
    except BaseException as e:
        logging.exception(e)
        return None


def scale(img, maxsize):
    """Scale an image to the given max size."""
    width, height = img.size
    ratio = min(float(maxsize) / width, float(maxsize) / height)
    return resize(img, int(width * ratio), int(height * ratio))


def mask(
    img, x_mask, y_mask, x_offset, y_offset, color=(255, 255, 255), insert_img=None
):
    """Mask an image.

    If insert_img is provided, the image given will mask the region
    specified. Otherwise, by default, the region specified will be covered
    in white - change color to change the mask color.
    """
    try:
        import numpy as np
        from PIL import Image

        img_data = np.array(img)
        if insert_img is not None:
            insert_img_data = np.array(insert_img)
            img_data[
                y_offset : y_offset + y_mask, x_offset : x_offset + x_mask, :
            ] = insert_img
        else:
            img_data[
                y_offset : y_offset + y_mask, x_offset : x_offset + x_mask, :
            ] = color

        return Image.fromarray(img_data)
    except BaseException as e:
        logging.exception(e)
        return None


def blank_frame(file, color="white"):
    """Return a new blank frame that has the same dimensions as file."""
    try:
        from PIL import Image

        with Image.open(file) as im:
            width, height = im.size
        return Image.new("RGB", (width, height), color=color)
    except BaseException as e:
        logging.exception(e)
        return None


def edges_im(img):
    """Find the edges of the given image.

    First, we apply a gaussian filter using a kernal of radius=13,
    and sigma=1 to a grayscale version of the image. Then we apply
    CED to find the edges.

    We calculate the hysterisis thresholds for the CED using the min and max
    vaues of the blurred image. We use 10% as the lower threshold,
    and 30% as the upper threshold.
    """
    try:
        import cv2
        import numpy as np
        from PIL import Image, ImageOps

        gs_img = np.array(ImageOps.grayscale(img))
        blurred_img = cv2.GaussianBlur(gs_img, (13, 13), 1)

        # Calculate the threshold values for double-thresholding
        min_g = np.min(blurred_img[:])
        max_g = np.max(blurred_img[:])
        edge_img = cv2.Canny(
            blurred_img, 0.10 * (max_g - min_g) + min_g, 0.30 * (max_g - min_g) + min_g
        )

        return Image.fromarray(edge_img)
    except BaseException as e:
        logging.exception(e)
        return None


def contentful_value(img):
    """
    Get the contentful value by counting the number of
    defined pixels in the image of the edges.
    """
    try:
        import numpy as np

        edge_img = np.array(edges_im(img))
        white_pixels = np.where(edge_img != 0)

        return len(white_pixels[0])
    except BaseException as e:
        logging.exception(e)
        return None


def build_edge_video(video_path, viewport):
    """Compute, and highlight the edges of a given video.

    Makes use of the same technique as the contentful value
    calculation. However, it crops, and scales the image using
    our own method rather than FFMPEG. This creates two videos
    suffixed with `-edges` and `-edges-overlay` that contain
    the raw edges, and a video with the edges overlaid. They will
    be found in the same location as the original video.

    These videos will only be produced when --contentful-video is
    used.
    """
    logging.debug("Creating edge video for {0}".format(video_path))

    output_dir, video_name = os.path.split(video_path)
    video_name, _ = os.path.splitext(video_name)

    try:
        import cv2
        import numpy as np
        from PIL import Image, ImageOps

        # Get the edges of all frames
        edge_video = []
        resized_video = []
        video = cv2.VideoCapture(video_path)
        frame_count = video.get(cv2.CAP_PROP_FPS)
        while video.isOpened():
            ret, frame = video.read()
            if ret:
                cropped_im = frame
                if viewport:
                    cropped_im = crop_im(
                        frame,
                        viewport["width"],
                        viewport["height"],
                        viewport["x"],
                        viewport["y"],
                    )
                resized_video.append(scale(cropped_im, options.thumbsize))
                edge_video.append(np.array(edges_im(resized_video[-1])))
            else:
                video.release()
                break

        out_size = edge_video[-1].shape
        out_edges = cv2.VideoWriter(
            os.path.join(output_dir, video_name + "-edges.mp4"),
            cv2.VideoWriter_fourcc(*"MP4V"),
            frame_count,
            (out_size[1], out_size[0]),
            1,
        )
        out_edges_overlay = cv2.VideoWriter(
            os.path.join(output_dir, video_name + "-edges-overlay.mp4"),
            cv2.VideoWriter_fourcc(*"MP4V"),
            frame_count,
            (out_size[1], out_size[0]),
            1,
        )
        for i, frame in enumerate(edge_video):
            cframe = np.zeros((out_size[0], out_size[1], 3))
            overlayframe = np.array(resized_video[i])
            for x in range(cframe.shape[0]):
                for y in range(cframe.shape[1]):
                    if frame[x, y] != 0:
                        cframe[x, y, :] = (0, 0, 255)
                        overlayframe[x, y, :] = (0, 0, 255)
            out_edges.write(np.uint8(cframe))
            out_edges_overlay.write(np.uint8(overlayframe))

        out_edges.release()
        out_edges_overlay.release()

        logging.debug("Finished creating edge videos for {0}".format(video_path))
    except BaseException as e:
        logging.exception(e)
        return


def convert_to_srgb(img):
    """Convert PIL image to sRGB color space (if possible)"""
    try:
        import io
        from PIL import Image, ImageCms

        icc = img.info.get("icc_profile", "")

        if icc:
            return ImageCms.profileToProfile(
                img,
                ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                ImageCms.createProfile("sRGB"),
            )

        logging.debug(
            "Unable to convert image to sRGB as there is no color "
            "profile to transform from."
        )
        return img
    except BaseException as e:
        logging.exception(e)
        return None


def convert_img_to_jpeg(src, dest, quality=30):
    """Convert an image to a JPEG with the given quality."""
    try:
        from PIL import Image

        with Image.open(src) as img:
            img = convert_to_srgb(img)
            img.save(dest, quality=quality)
    except BaseException as e:
        logging.exception(e)
        return


# #################################################################################################
# Frame Extraction and de-duplication
# #################################################################################################


def video_to_frames(
    video,
    directory,
    force,
    orange_file,
    find_viewport,
    viewport_retries,
    viewport_min_height,
    viewport_min_width,
    full_resolution,
):
    """Extract the video frames"""
    global client_viewport
    first_frame = os.path.join(directory, "ms_000000")
    if (
        not os.path.isfile(first_frame + ".png")
        and not os.path.isfile(first_frame + ".jpg")
    ) or force:
        if os.path.isfile(video):
            video = os.path.realpath(video)
            logging.info("Processing frames from video " + video + " to " + directory)
            is_mobile = find_recording_platform(video)
            if os.path.isdir(directory):
                shutil.rmtree(directory, True)
            if not os.path.isdir(directory):
                os.mkdir(directory, 0o755)
            if os.path.isdir(directory):
                directory = os.path.realpath(directory)
                viewport, cropped = find_video_viewport(
                    video,
                    directory,
                    find_viewport,
                    viewport_retries,
                    viewport_min_height,
                    viewport_min_width,
                    is_mobile,
                )

                if options.contentful_video:
                    # Create some videos with the edges
                    build_edge_video(video, viewport)

                gc.collect()
                if extract_frames(video, directory, full_resolution, viewport):
                    client_viewport = None
                    directories = [directory]
                    for dir in directories:
                        if orange_file is not None:
                            remove_frames_before_orange(dir, orange_file)
                            remove_orange_frames(dir, orange_file)
                        find_render_start(dir, orange_file, cropped, is_mobile)
                        adjust_frame_times(dir)
                        eliminate_duplicate_frames(dir, cropped, is_mobile)
                        crop_viewport(dir)
                        gc.collect()
                else:
                    logging.critical("Error extracting the video frames from %s", video)
            else:
                logging.critical("Error creating output directory: %s", directory)
        else:
            logging.critical("Input video file %s does not exist", video)
    else:
        logging.info("Extracted video already exists in %s", directory)


def extract_frames(video, directory, full_resolution, viewport):
    """Extract and number the video frames"""
    ret = False
    logging.info("Extracting frames from " + video + " to " + directory)
    decimate = get_decimate_filter()
    if decimate is not None:
        crop = ""
        if viewport is not None:
            crop = "crop={0}:{1}:{2}:{3},".format(
                viewport["width"], viewport["height"], viewport["x"], viewport["y"]
            )
        scale = "scale=iw*min({0:d}/iw\\,{0:d}/ih):ih*min({0:d}/iw\\,{0:d}/ih),".format(
            options.thumbsize
        )
        if full_resolution:
            scale = ""
        # escape directory name
        # see https://en.wikibooks.org/wiki/FFMPEG_An_Intermediate_Guide/image_sequence#Percent_in_filename
        dir_escaped = directory.replace("%", "%%")
        command = [
            "ffmpeg",
            "-v",
            "debug",
            "-i",
            video,
            "-vsync",
            "0",
            "-vf",
            crop + scale + decimate + "=0:64:640:0.001",
            os.path.join(dir_escaped, "img-%d.png"),
        ]
        logging.debug(" ".join(command))
        lines = []

        proc = subprocess.Popen(command, stderr=subprocess.PIPE, encoding="UTF-8")
        while proc.poll() is None:
            lines.extend(iter(proc.stderr.readline, ""))

        pattern = re.compile(r"keep pts:[0-9]+ pts_time:(?P<timecode>[0-9\.]+)")
        frame_count = 0
        for line in lines:
            match = re.search(pattern, line)
            if match:
                frame_count += 1
                frame_time = int(
                    math.floor(float(match.groupdict().get("timecode")) * 1000)
                )
                src = os.path.join(directory, "img-{0:d}.png".format(frame_count))
                dest = os.path.join(directory, "video-{0:06d}.png".format(frame_time))
                logging.debug("Renaming " + src + " to " + dest)
                os.rename(src, dest)
                ret = True
    return ret


def find_recording_platform(video):
    """Find the platform that this video was recorded on.

    We can make use of a field called `com.android.version` to
    determine if we've recorded on mobile or not.
    """
    command = ["ffprobe", video]
    logging.debug(command)

    lines = []
    proc = subprocess.Popen(command, stderr=subprocess.PIPE, encoding="UTF-8")

    while proc.poll() is None:
        lines.extend(iter(proc.stderr.readline, ""))

    is_mobile = False
    matcher = re.compile(".*com\.android\.version.*")
    for line in lines:
        if matcher.search(line):
            is_mobile = True

    return is_mobile


def remove_frames_before_orange(directory, orange_file):
    """Remove stray frames from the start of the video"""
    frames = sorted(glob.glob(os.path.join(directory, "video-*.png")))
    if len(frames):
        # go through the first 20 frames and remove any that come before the first orange frame.
        # iOS video capture starts with a blank white frame and then flips to
        # orange before starting.
        logging.debug("Scanning for non-orange frames...")
        found_orange = False
        remove_frames = []
        frame_count = 0
        for frame in frames:
            frame_count += 1
            if is_color_frame(frame, orange_file):
                found_orange = True
                break
            if frame_count > 20:
                break
            remove_frames.append(frame)

        if found_orange and len(remove_frames):
            for frame in remove_frames:
                logging.debug("Removing pre-orange frame %s", frame)
                os.remove(frame)


def remove_orange_frames(directory, orange_file):
    """Remove orange frames from the beginning of the video"""
    frames = sorted(glob.glob(os.path.join(directory, "video-*.png")))
    if len(frames):
        logging.debug("Scanning for orange frames...")
        for frame in frames:
            if is_color_frame(frame, orange_file):
                logging.debug("Removing Orange frame: %s", frame)
                os.remove(frame)
            else:
                break
        for frame in reversed(frames):
            if is_color_frame(frame, orange_file):
                logging.debug("Removing orange frame %s from the end", frame)
                os.remove(frame)
            else:
                break


def find_image_viewport(file, is_mobile):
    logging.debug("Finding the viewport for %s", file)
    try:
        from PIL import Image

        im = Image.open(file)
        width, height = im.size
        x = int(math.floor(width / 2))
        y = int(math.floor(height / 2))
        pixels = im.load()
        background = pixels[x, y]

        # Find the left edge
        left = None
        while left is None and x >= 0:
            if not colors_are_similar(background, pixels[x, y]):
                left = x + 1
            else:
                x -= 1
        if left is None:
            left = 0
        logging.debug("Viewport left edge is %d", left)

        # Find the right edge
        x = int(math.floor(width / 2))
        right = None
        while right is None and x < width:
            if not colors_are_similar(background, pixels[x, y]):
                right = x - 1
            else:
                x += 1
        if right is None:
            right = width
        logging.debug("Viewport right edge is {0:d}".format(right))

        # Find the top edge
        x = int(math.floor(width / 2))
        top = None
        while top is None and y >= 0:
            if not colors_are_similar(background, pixels[x, y]):
                top = y + 1
            else:
                y -= 1
        if top is None:
            top = 0
        logging.debug("Viewport top edge is {0:d}".format(top))

        # Find the bottom edge
        y = int(math.floor(height / 2))
        bottom = None
        while bottom is None and y < height:
            if not colors_are_similar(background, pixels[x, y]):
                bottom = y - 1
            else:
                y += 1
        if bottom is None:
            bottom = height
        logging.debug("Viewport bottom edge is {0:d}".format(bottom))

        viewport = {
            "x": left,
            "y": top,
            "width": (right - left),
            "height": (bottom - top),
        }

        if is_mobile:
            # On mobile we need to ignore the top ~10 pixels because
            # there is a visible progress bar there on some browsers.
            viewport["y"] += 10
            viewport["height"] -= 14

    except Exception:
        viewport = None

    return viewport


def find_video_viewport(
    video,
    directory,
    find_viewport,
    viewport_retries,
    viewport_min_height,
    viewport_min_width,
    is_mobile,
):
    logging.debug("Finding Video Viewport...")
    viewport = None

    # cropped will be True if the viewport setting changes
    # the original frame
    cropped = False

    try:
        from PIL import Image

        retries = -1

        while (
            viewport is None
            or viewport["height"] <= viewport_min_height
            or viewport["width"] <= viewport_min_width
        ):
            retries += 1
            if retries >= 1:
                # In some cases, the first frame is not an orange screen or a screen
                # with a solid color. In this case, we need to try finding the viewport
                # using the next frame. The `viewport_retries` dictates the maximum number
                # of frames to check.
                if retries >= viewport_retries:
                    logging.exception(
                        "Could not calculate a viewport after %s tries.",
                        viewport_retries,
                    )
                    break
                logging.info("Failed to find a good viewport. Retrying...")

            logging.debug("Using frame " + str(retries))

            frame = os.path.join(directory, "viewport.png")
            if os.path.isfile(frame):
                os.remove(frame)

            command = ["ffmpeg", "-i", video]

            # Pull one frame from the video starting with the frame at
            # the `retries` index
            command.extend(["-vf", "select=gte(n\\,%s)" % retries])
            command.extend(["-frames:v", "1", frame])
            subprocess.check_output(command)

            if os.path.isfile(frame):
                with Image.open(frame) as im:
                    width, height = im.size
                    logging.debug("%s is %dx%d", frame, width, height)
                if find_viewport:
                    viewport = find_image_viewport(frame, is_mobile)
                else:
                    viewport = {"x": 0, "y": 0, "width": width, "height": height}

                os.remove(frame)

        if viewport is not None and viewport != {
            "x": 0,
            "y": 0,
            "width": width,
            "height": height,
        }:
            cropped = True

    except Exception as e:
        viewport = None

    return viewport, cropped


def adjust_frame_times(directory):
    offset = None
    frames = sorted(glob.glob(os.path.join(directory, "video-*.png")))
    # Special hack to the the video start
    # Let us tune this in the future to skip using a global
    global videoRecordingStart
    match = re.compile(r"video-(?P<ms>[0-9]+)\.png")
    if len(frames):
        for frame in frames:
            m = re.search(match, frame)
            if m is not None:
                frame_time = int(m.groupdict().get("ms"))
                if offset is None:
                    # This is the first frame.
                    videoRecordingStart = frame_time
                    offset = frame_time
                new_time = frame_time - offset
                dest = os.path.join(directory, "ms_{0:06d}.png".format(new_time))
                os.rename(frame, dest)


def find_render_start(directory, orange_file, cropped, is_mobile):
    logging.debug("Finding Render Start...")
    try:
        if (
            client_viewport is not None
            or options.viewport is not None
            or (options.renderignore > 0 and options.renderignore <= 100)
        ):
            files = sorted(glob.glob(os.path.join(directory, "video-*.png")))
            count = len(files)
            if count > 1:
                from PIL import Image

                first = files[0]
                with Image.open(first) as im:
                    width, height = im.size
                if options.renderignore > 0 and options.renderignore <= 100:
                    mask = {}
                    mask["width"] = int(math.floor(width * options.renderignore / 100))
                    mask["height"] = int(
                        math.floor(height * options.renderignore / 100)
                    )
                    mask["x"] = int(math.floor(width / 2 - mask["width"] / 2))
                    mask["y"] = int(math.floor(height / 2 - mask["height"] / 2))
                else:
                    mask = None

                im_width = width
                im_height = height

                top = 10
                right_margin = 10
                bottom_margin = 24
                if height > 400 or width > 400:
                    top = max(top, int(math.ceil(float(height) * 0.03)))
                    right_margin = max(
                        right_margin, int(math.ceil(float(width) * 0.04))
                    )
                    bottom_margin = max(
                        bottom_margin, int(math.ceil(float(width) * 0.04))
                    )
                height = max(height - top - bottom_margin, 1)
                left = 0
                width = max(width - right_margin, 1)
                if client_viewport is not None:
                    height = max(client_viewport["height"] - top - bottom_margin, 1)
                    width = max(client_viewport["width"] - right_margin, 1)
                    left += client_viewport["x"]
                    top += client_viewport["y"]
                elif cropped:
                    # The image was already cropped, so only cutout the bottom
                    # to get rid of the network request/etc. information for
                    # desktop videos, and nothing extra on mobile.
                    top = 0
                    left = 0
                    width = im_width

                    if is_mobile:
                        height = im_height
                    else:
                        height = im_height - bottom_margin

                crop = (width, height, left, top)

                for i in range(1, count):
                    if frames_match(first, files[i], 10, 0, crop, mask):
                        logging.debug("Removing pre-render frame %s", files[i])
                        os.remove(files[i])
                    elif orange_file is not None and is_color_frame(
                        files[i], orange_file
                    ):
                        logging.debug("Removing orange frame %s", files[i])
                        os.remove(files[i])
                    else:
                        break
    except BaseException:
        logging.exception("Error getting render start")


def eliminate_duplicate_frames(directory, cropped, is_mobile):
    logging.debug("Eliminating Duplicate Frames...")
    global client_viewport
    try:
        files = sorted(glob.glob(os.path.join(directory, "ms_*.png")))
        if len(files) > 1:
            from PIL import Image

            blank = files[0]
            with Image.open(blank) as im:
                width, height = im.size
            im_width = width
            im_height = height

            # Figure out the region of the image that we care about
            top = 40
            right_margin = 10
            bottom_margin = 10
            if height > 400 or width > 400:
                top = int(math.ceil(float(height) * 0.04))
                right_margin = int(math.ceil(float(width) * 0.04))
                bottom_margin = int(math.ceil(float(width) * 0.06))
            height = max(height - top - bottom_margin, 1)
            left = 0
            width = max(width - right_margin, 1)

            if client_viewport is not None:
                height = max(client_viewport["height"] - top - bottom_margin, 1)
                width = max(client_viewport["width"] - right_margin, 1)
                left += client_viewport["x"]
                top += client_viewport["y"]
            elif cropped:
                # The image was already cropped, so only cutout the bottom
                # to get rid of the network request/etc. information for
                # desktop videos, and nothing extra on mobile.
                top = 0
                left = 0
                width = im_width

                if is_mobile:
                    height = im_height
                else:
                    height = im_height - bottom_margin

            crop = (width, height, left, top)
            logging.debug("Viewport cropping set to (W, H, L, T): " + str(crop))

            # Do a pass looking for the first non-blank frame with an allowance
            # for up to a 10% per-pixel difference for noise in the white
            # field.
            count = len(files)
            for i in range(1, count):
                if frames_match(blank, files[i], 10, 0, crop, None):
                    logging.debug(
                        "Removing duplicate frame {0} from the beginning".format(
                            files[i]
                        )
                    )
                    os.remove(files[i])
                else:
                    break

            # Do another pass looking for the last frame but with an allowance for up
            # to a 15% difference in individual pixels to deal with noise
            # around text.
            files = sorted(glob.glob(os.path.join(directory, "ms_*.png")))
            count = len(files)
            duplicates = []
            if count > 2:
                files.reverse()
                baseline = files[0]
                previous_frame = baseline
                for i in range(1, count):
                    if frames_match(baseline, files[i], 15, 5, crop, None):
                        if previous_frame is baseline:
                            duplicates.append(previous_frame)
                        else:
                            logging.debug(
                                "Removing duplicate frame {0} from the end".format(
                                    previous_frame
                                )
                            )
                            os.remove(previous_frame)
                        previous_frame = files[i]
                    else:
                        break
            for duplicate in duplicates:
                logging.debug(
                    "Removing duplicate frame {0} from the end".format(duplicate)
                )
                os.remove(duplicate)

    except BaseException:
        logging.exception("Error processing frames for duplicates")


def crop_viewport(directory):
    if client_viewport is not None:
        try:
            from PIL import Image

            files = sorted(glob.glob(os.path.join(directory, "ms_*.png")))
            count = len(files)
            if count > 0:
                for i in range(count):
                    with Image.open(files[i]) as im:
                        new_img = crop_im(
                            im,
                            client_viewport["width"],
                            client_viewport["height"],
                            client_viewport["x"],
                            client_viewport["y"],
                        )
                        new_img.save(files[i])

        except BaseException:
            logging.exception("Error cropping to viewport")


def get_decimate_filter():
    decimate = None
    try:
        filters = subprocess.check_output(
            ["ffmpeg", "-filters"], stderr=subprocess.STDOUT, encoding="UTF-8"
        )
        lines = filters.split("\n")
        match = re.compile(
            r"(?P<filter>[\w]*decimate).*V->V.*Remove near-duplicate frames"
        )
        for line in lines:
            m = re.search(match, line)
            if m is not None:
                decimate = m.groupdict().get("filter")
                break
    except BaseException:
        logging.critical("Error checking ffmpeg filters for decimate")
        decimate = None
    return decimate


def clean_directory(directory):
    files = glob.glob(os.path.join(directory, "*.png"))
    for file in files:
        os.remove(file)
    files = glob.glob(os.path.join(directory, "*.jpg"))
    for file in files:
        os.remove(file)
    files = glob.glob(os.path.join(directory, "*.json"))
    for file in files:
        os.remove(file)


def is_color_frame(file, color_file):
    """Check a section from the middle, top and bottom of the viewport to see if it matches"""
    global frame_cache
    if file in frame_cache and color_file in frame_cache[file]:
        return bool(frame_cache[file][color_file])
    match = False
    if os.path.isfile(color_file):
        try:
            from PIL import Image

            with Image.open(file) as img:
                width, height = img.size
            crops = []

            # Middle
            crops.append(
                (int(width / 2), int(height / 3), int(width / 4), int(height / 3))
            )
            # Top
            crops.append((int(width / 2), int(height / 5), int(width / 4), 50))
            # Bottom
            crops.append(
                (
                    int(width / 2),
                    int(height / 5),
                    int(width / 4),
                    height - int(height / 5),
                )
            )

            for crop in crops:
                with Image.open(file) as im:
                    crop_i = crop_im(im, crop[0], crop[1], crop[2], crop[3])
                    resized_im = resize(crop_i, 200, 200)

                    with Image.open(color_file) as color_im:
                        different_pixels = compare(resized_im, color_im, fuzz=0.15)

                if different_pixels < 10000:
                    match = True
                    break
        except Exception as e:
            logging.debug(e)
            pass
    if file not in frame_cache:
        frame_cache[file] = {}
    frame_cache[file][color_file] = bool(match)
    return match


def colors_are_similar(a, b, threshold=15):
    similar = True
    sum = 0
    for x in range(3):
        delta = abs(a[x] - b[x])
        sum += delta
        if delta > threshold:
            similar = False
    if sum > threshold:
        similar = False

    return similar


def frames_match(image1, image2, fuzz_percent, max_differences, crop_region, mask_rect):
    match = False

    try:
        from PIL import Image

        with Image.open(image1) as i1, Image.open(image2) as i2:
            if mask_rect:
                i1 = mask(
                    i1,
                    mask_rect["width"],
                    mask_rect["height"],
                    mask_rect["x"],
                    mask_rect["y"],
                )
                i2 = mask(
                    i2,
                    mask_rect["width"],
                    mask_rect["height"],
                    mask_rect["x"],
                    mask_rect["y"],
                )

            if crop_region:
                i1 = crop_im(
                    i1, crop_region[0], crop_region[1], crop_region[2], crop_region[3]
                )
                i2 = crop_im(
                    i2, crop_region[0], crop_region[1], crop_region[2], crop_region[3]
                )

            different_pixels = compare(i1, i2, fuzz=fuzz_percent / 100)
            if different_pixels <= max_differences:
                match = True

    except BaseException as e:
        logging.exception(e)
        return None

    return match


def generate_orange_png(orange_file):
    try:
        from PIL import Image, ImageDraw

        im = Image.new("RGB", (200, 200))
        draw = ImageDraw.Draw(im)
        draw.rectangle([0, 0, 200, 200], fill=(222, 100, 13))
        del draw
        im.save(orange_file, "PNG")
    except BaseException:
        logging.exception("Error generating orange png " + orange_file)


##########################################################################
#   Histogram calculations
##########################################################################


def calculate_histograms(directory, histograms_file, force):
    logging.debug("Calculating image histograms")
    if not os.path.isfile(histograms_file) or force:
        try:
            extension = None
            directory = os.path.realpath(directory)
            first_frame = os.path.join(directory, "ms_000000")
            if os.path.isfile(first_frame + ".png"):
                extension = ".png"
            elif os.path.isfile(first_frame + ".jpg"):
                extension = ".jpg"
            if extension is not None:
                histograms = []
                frames = sorted(glob.glob(os.path.join(directory, "ms_*" + extension)))
                match = re.compile(r"ms_(?P<ms>[0-9]+)\.")
                for frame in frames:
                    m = re.search(match, frame)
                    if m is not None:
                        frame_time = int(m.groupdict().get("ms"))
                        histogram, total, dropped = calculate_image_histogram(frame)
                        gc.collect()
                        if histogram is not None:
                            histograms.append(
                                {
                                    "time": frame_time,
                                    "file": os.path.basename(frame),
                                    "histogram": histogram,
                                    "total_pixels": total,
                                    "dropped_pixels": dropped,
                                }
                            )
                if os.path.isfile(histograms_file):
                    os.remove(histograms_file)
                f = gzip.open(histograms_file, GZIP_TEXT)
                json.dump(histograms, f)
                f.close()
            else:
                logging.critical("No video frames found in " + directory)
        except BaseException:
            logging.exception("Error calculating histograms")
    else:
        logging.debug("Histograms file {0} already exists".format(histograms_file))
    logging.debug("Done calculating histograms")


def calculate_image_histogram(file):
    logging.debug("Calculating histogram for " + file)
    dropped = 0
    try:
        from PIL import Image

        im = Image.open(file)
        width, height = im.size
        total = width * height
        colors = im.getcolors(total)
        histogram = {
            "r": [0 for i in range(256)],
            "g": [0 for i in range(256)],
            "b": [0 for i in range(256)],
        }
        for entry in colors:
            try:
                count = entry[0]
                pixel = entry[1]
                # Don't include White pixels (with a tiny bit of slop for
                # compression artifacts)
                if pixel[0] < 250 or pixel[1] < 250 or pixel[2] < 250:
                    histogram["r"][pixel[0]] += count
                    histogram["g"][pixel[1]] += count
                    histogram["b"][pixel[2]] += count
                else:
                    dropped += 1
            except Exception:
                pass
        colors = None
    except Exception:
        total = 0
        histogram = None
        logging.exception("Error calculating histogram for " + file)
    return histogram, total, dropped


##########################################################################
#   Screen Shots
##########################################################################


def save_screenshot(directory, dest, quality):
    directory = os.path.realpath(directory)
    files = sorted(glob.glob(os.path.join(directory, "ms_*.png")))
    if files is not None and len(files) >= 1:
        src = files[-1]
        if dest[-4:] == ".jpg":
            convert_img_to_jpeg(src, dest, quality=quality)
        else:
            shutil.copy(src, dest)


##########################################################################
#   JPEG conversion
##########################################################################


def convert_to_jpeg(directory, quality):
    logging.debug("Converting video frames to JPEG")
    directory = os.path.realpath(directory)
    pattern = os.path.join(directory, "ms_*.png")

    files = sorted(glob.glob(pattern))
    for file in files:
        _, filename = os.path.split(file)
        filen, ext = os.path.splitext(filename)
        convert_img_to_jpeg(
            file, os.path.join(directory, filen + ".jpg"), quality=quality
        )
        os.remove(file)

    logging.debug("Done converting video frames to JPEG")


##########################################################################
#   Visual Metrics
##########################################################################


def calculate_visual_metrics(
    histograms_file,
    start,
    end,
    perceptual,
    contentful,
    dirs,
    progress_file,
    hero_elements_file,
    key_colors,
):
    metrics = None
    histograms = load_histograms(histograms_file, start, end)
    if histograms is not None and len(histograms) > 0:
        progress = calculate_visual_progress(histograms)
        if progress and progress_file is not None:
            file_name, ext = os.path.splitext(progress_file)
            if ext.lower() == ".gz":
                f = gzip.open(progress_file, GZIP_TEXT, 7)
            else:
                f = open(progress_file, "w")
            json.dump(progress, f)
            f.close()
        key_color_frames = calculate_key_color_frames(histograms, key_colors)
        if len(histograms) > 1:
            metrics = [
                {"name": "First Visual Change", "value": histograms[1]["time"]},
                {"name": "Last Visual Change", "value": histograms[-1]["time"]},
                {"name": "Speed Index", "value": calculate_speed_index(progress)},
            ]
            if perceptual:
                value, value_progress = calculate_perceptual_speed_index(progress, dirs)
                metrics.extend(
                    (
                        {"name": "Perceptual Speed Index", "value": value},
                        {
                            "name": "Perceptual Speed Index Progress",
                            "value": value_progress,
                        },
                    )
                )
            if contentful:
                value, value_progress = calculate_contentful_speed_index(progress, dirs)

                metrics.extend(
                    (
                        {"name": "Contentful Speed Index", "value": value},
                        {
                            "name": "Contentful Speed Index Progress",
                            "value": value_progress,
                        },
                    )
                )
            if hero_elements_file is not None and os.path.isfile(hero_elements_file):
                logging.debug("Calculating hero element times")
                hero_data = None
                hero_f_in = gzip.open(hero_elements_file, GZIP_READ_TEXT)
                try:
                    hero_data = json.load(hero_f_in)
                except Exception as e:
                    logging.exception("Could not load hero elements data")
                    logging.exception(e)
                hero_f_in.close()

                if (
                    hero_data is not None
                    and hero_data["heroes"] is not None
                    and hero_data["viewport"] is not None
                    and len(hero_data["heroes"]) > 0
                ):
                    viewport = hero_data["viewport"]
                    hero_timings = []
                    for hero in hero_data["heroes"]:
                        hero_time = calculate_hero_time(progress, dirs, hero, viewport)
                        if hero_time is not None:
                            hero_timings.append(
                                {
                                    "name": hero["name"],
                                    "value": hero_time,
                                }
                            )
                    hero_timings_sorted = sorted(
                        hero_timings, key=lambda timing: timing["value"]
                    )
                    # hero_timings.append({'name': 'FirstPaintedHero',
                    #                     'value': hero_timings_sorted[0]['value']})
                    if (len(hero_timings_sorted) > 0):
                        hero_timings.append(
                            {
                                "name": "LastMeaningfulPaint",
                                "value": hero_timings_sorted[-1]["value"],
                            }
                        )
                    hero_data["timings"] = hero_timings
                    metrics += hero_timings

                    hero_f_out = gzip.open(hero_elements_file, GZIP_TEXT, 7)
                    json.dump(hero_data, hero_f_out)
                    hero_f_out.close()
            else:
                logging.warn(
                    "Hero elements file is not valid: " + str(hero_elements_file)
                )
        else:
            metrics = [
                {"name": "First Visual Change", "value": histograms[0]["time"]},
                {"name": "Last Visual Change", "value": histograms[0]["time"]},
                {"name": "Visually Complete", "value": histograms[0]["time"]},
                {"name": "Speed Index", "value": 0},
            ]
            if perceptual:
                metrics.append({"name": "Perceptual Speed Index", "value": 0})
            if contentful:
                metrics.append({"name": "Contentful Speed Index", "value": 0})
        if key_color_frames:
            keysum = ""
            for key in key_color_frames:
                if len(keysum):
                    keysum += ", "
                framesum = ""
                for frame in key_color_frames[key]:
                    if len(framesum):
                        framesum += " "
                    framesum += "{0:d}-{1:d}".format(
                        frame["start_time"], frame["end_time"]
                    )
                keysum += "{0}=[{1}]".format(key, framesum)
            metrics.append({"name": "Key Color Frames", "value": keysum})
        prog = ""
        for p in progress:
            if len(prog):
                prog += ", "
            prog += "{0:d}={1:d}".format(p["time"], int(p["progress"]))
        metrics.append({"name": "Visual Progress", "value": prog})

    return metrics


def load_histograms(histograms_file, start, end):
    histograms = None
    if os.path.isfile(histograms_file):
        f = gzip.open(histograms_file)
        original = json.load(f)
        f.close()
        if start != 0 or end != 0:
            histograms = []
            for histogram in original:
                if histogram["time"] <= start:
                    histogram["time"] = start
                    histograms = [histogram]
                elif histogram["time"] <= end:
                    histograms.append(histogram)
                else:
                    break
        else:
            histograms = original
    return histograms


def is_key_color_frame(histogram, key_color):
    # The fraction is measured against the entire image, not just the sampled
    # pixels. This helps avoid matching frames with only a few pixels that
    # happen to be in the acceptable range.
    total_fraction = histogram["total_pixels"] * key_color["fraction"]
    if total_fraction < histogram["total_pixels"] - histogram["dropped_pixels"]:
        for channel in ["r", "g", "b"]:
            # Find the acceptable range around the target channel value
            max_channel = len(histogram["histogram"][channel])
            low = min(max_channel - 1, max(0, key_color[channel + "_low"]))
            high = min(max_channel, max(1, key_color[channel + "_high"] + 1))
            target_total = 0
            for i in histogram["histogram"][channel][low:high]:
                target_total += i
            if target_total < total_fraction:
                return False
    return True


def calculate_key_color_frames(histograms, key_colors):
    if not key_colors:
        return {}

    key_color_frames = {}
    for key in key_colors:
        key_color_frames[key] = []

    current = None
    current_key = None
    total = 0
    matched = 0
    buckets = 256
    channels = ["r", "g", "b"]
    histograms = histograms.copy()

    while len(histograms) > 0:
        histogram = histograms.pop(0)
        matching_key = None
        for key in key_colors:
            if is_key_color_frame(histogram, key_colors[key]):
                matching_key = key
                break

        if matching_key is None:
            continue

        last_histogram = histogram
        frame_count = 1
        while len(histograms) > 0:
            last_histogram = histograms[0]
            if is_key_color_frame(last_histogram, key_colors[matching_key]):
                frame_count += 1
                histograms.pop(0)
            else:
                break

        logging.debug(
            "{0:d}ms to {1:d}ms - Matched key color frame {2}".format(
                histogram["time"], last_histogram["time"], matching_key
            )
        )

        key_color_frames[matching_key].append(
            {
                "frame_count": frame_count,
                "start_time": histogram["time"],
                "end_time": last_histogram["time"],
            }
        )

    return key_color_frames


def calculate_visual_progress(histograms):
    progress = []
    first = histograms[0]["histogram"]
    last = histograms[-1]["histogram"]
    for index, histogram in enumerate(histograms):
        p = calculate_frame_progress(histogram["histogram"], first, last)
        file_name, ext = os.path.splitext(histogram["file"])
        progress.append({"time": histogram["time"], "file": file_name, "progress": p})
        logging.debug("{0:d}ms - {1:d}% Complete".format(histogram["time"], int(p)))
    return progress


def calculate_frame_progress(histogram, start, final):
    """Calculate the progress percentage of a given frame histogram.

    This method finds the visually-complete progress by taking a sum of
    all the differences in the histogram between the current frame, and the
    final frame. The initial/first frame is used to remove values that are
    consitent between the first, and final frame (i.e. it's a baseline).

    Note that this method should not be using a slop/fuzz because we aren't
    looking at individual pixel intensities which is where the fuzz can be
    found. Within individual channels, we hit an issue where we cannot tell
    if a value in the red channel is purely from a red colour in the image, or
    if it's mixed with other colours such as grey (e.g. red with rbg(240,0,0),
    and light grey with rgb(245,245,245)).
    """
    total = 0
    matched = 0
    for channel in ("r", "g", "b"):
        for pixel_ind in range(256):
            curr = histogram[channel][pixel_ind]
            init = start[channel][pixel_ind]
            target = final[channel][pixel_ind]

            curr_diff = abs(curr - init)
            target_diff = abs(target - init)

            matched += min(curr_diff, target_diff)
            total += target_diff

    progress = (float(matched) / float(total)) if total else 1
    return math.floor(progress * 100)


def find_visually_complete(progress):
    time = 0
    for p in progress:
        if int(p["progress"]) == 100:
            time = p["time"]
            break
        elif time == 0:
            time = p["time"]
    return time


def calculate_speed_index(progress):
    si = 0
    last_ms = progress[0]["time"]
    last_progress = progress[0]["progress"]
    for p in progress:
        elapsed = p["time"] - last_ms
        si += elapsed * (1.0 - last_progress)
        last_ms = p["time"]
        last_progress = p["progress"] / 100.0
    return int(si)


def calculate_contentful_speed_index(progress, directory):
    # convert output comes out with lines that have this format:
    # <pixel count>: <rgb color> #<hex color> <gray color>
    # This is CLI dependant and very fragile
    matcher = re.compile(r"(\d+?):")

    try:
        from PIL import Image

        dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), directory)
        content = []
        maxContent = 0
        for p in progress[1:]:
            # Full Path of the Current Frame
            current_frame = os.path.join(dir, "ms_{0:06d}.png".format(p["time"]))
            logging.debug("contentfulSpeedIndex: Current frame is %s" % current_frame)

            value = 0
            with Image.open(current_frame) as current_frame_img:
                value = contentful_value(current_frame_img)

            logging.debug("contentfulSpeedIndex: Contentful value {0}".format(value))

            if value > maxContent:
                maxContent = value
            content.append(value)

        for i, value in enumerate(content):
            if maxContent > 0:
                content[i] = float(content[i]) / float(maxContent)
            else:
                content[i] = 0.0

        # Assume 0 content for first frame
        cont_si = 1 * (progress[1]["time"] - progress[0]["time"])
        completeness_value = [(progress[1]["time"], int(cont_si))]
        for i in range(1, len(progress) - 1):
            elapsed = progress[i + 1]["time"] - progress[i]["time"]
            # print i,' time =',p['time'],'elapsed =',elapsed,'content = ',content[i]
            cont_si += elapsed * (1.0 - content[i])
            completeness_value.append((progress[i + 1]["time"], int(cont_si)))

        cont_si = int(cont_si)
        raw_progress_value = ["0=0"]
        for timestamp, percent in completeness_value:
            p = int(100 * float(percent) / float(cont_si))
            raw_progress_value.append("%d=%d" % (timestamp, p))

        return cont_si, ", ".join(raw_progress_value)
    except Exception as e:
        logging.exception(e)
        return None, None


def calculate_perceptual_speed_index(progress, directory):
    from ssim import compute_ssim

    x = len(progress)
    dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), directory)
    first_paint_frame = os.path.join(dir, "ms_{0:06d}.png".format(progress[1]["time"]))
    target_frame = os.path.join(dir, "ms_{0:06d}.png".format(progress[x - 1]["time"]))
    ssim_1 = compute_ssim(first_paint_frame, target_frame)
    per_si = float(progress[1]["time"])
    last_ms = progress[1]["time"]
    # Full Path of the Target Frame
    logging.debug("Target image for perSI is %s" % target_frame)
    ssim = ssim_1
    completeness_value = []
    for p in progress[1:]:
        elapsed = p["time"] - last_ms
        # print '*******elapsed %f'%elapsed
        # Full Path of the Current Frame
        current_frame = os.path.join(dir, "ms_{0:06d}.png".format(p["time"]))
        logging.debug("Current Image is %s" % current_frame)
        # Takes full path of PNG frames to compute SSIM value
        per_si += elapsed * (1.0 - ssim)
        ssim = compute_ssim(current_frame, target_frame)
        gc.collect()
        last_ms = p["time"]
        completeness_value.append((p["time"], int(per_si)))

    per_si = int(per_si)
    raw_progress_value = ["0=0"]
    for timestamp, percent in completeness_value:
        p = int(100 * float(percent) / float(per_si))
        raw_progress_value.append("%d=%d" % (timestamp, p))

    return per_si, ", ".join(raw_progress_value)


def calculate_hero_time(progress, directory, hero, viewport):
    try:
        dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), directory)
        n = len(progress)
        target_frame = os.path.join(dir, "ms_{0:06d}".format(progress[n - 1]["time"]))

        extension = None
        if os.path.isfile(target_frame + ".png"):
            extension = ".png"
        elif os.path.isfile(target_frame + ".jpg"):
            extension = ".jpg"
        if extension is not None:
            hero_width = int(hero["width"])
            hero_height = int(hero["height"])
            hero_x = int(hero["x"])
            hero_y = int(hero["y"])
            target_frame = target_frame + extension
            logging.debug(
                "Target image for hero %s is %s" % (hero["name"], target_frame)
            )

            from PIL import Image

            with Image.open(target_frame) as im:
                width, height = im.size
            if width != viewport["width"]:
                scale = float(width) / float(viewport["width"])
                logging.debug(
                    "Frames are %dpx wide but viewport was %dpx. Scaling by %f"
                    % (width, viewport["width"], scale)
                )
                hero_width = int(hero["width"] * scale)
                hero_height = int(hero["height"] * scale)
                hero_x = int(hero["x"] * scale)
                hero_y = int(hero["y"] * scale)

            logging.debug(
                'Calculating render time for hero element "%s" at position [%d, %d, %d, %d]'
                % (hero["name"], hero_x, hero_y, hero_width, hero_height)
            )

            # Apply the mask to the target frame to create the reference frame
            target_mask_path = os.path.join(
                dir,
                "hero_{0}_ms_{1:06d}.png".format(hero["name"], progress[n - 1]["time"]),
            )

            def __apply_hero_mask(cur_frame):
                """Helper method for re-applying the same mask."""
                cropped_frame = None
                with Image.open(cur_frame) as im:
                    cropped_frame = crop_im(im, hero_width, hero_height, hero_x, hero_y)
                return cropped_frame

            target_mask = __apply_hero_mask(target_frame)
            target_mask.save(target_mask_path)

            def cleanup():
                if os.path.isfile(target_mask_path):
                    os.remove(target_mask_path)

            # Allow for small differences like scrollbars and overlaid UI elements
            # by applying a 10% fuzz and allowing for up to 2% of the pixels to be
            # different.
            fuzz = 10
            max_pixel_diff = math.ceil(hero_width * hero_height * 0.02)

            for p in progress:
                current_frame = os.path.join(dir, "ms_{0:06d}".format(p["time"]))
                extension = None
                if os.path.isfile(current_frame + ".png"):
                    extension = ".png"
                elif os.path.isfile(current_frame + ".jpg"):
                    extension = ".jpg"
                if extension is not None:
                    current_mask_path = os.path.join(
                        dir, "hero_{0}_ms_{1:06d}.png".format(hero["name"], p["time"])
                    )

                    current_mask = __apply_hero_mask(current_frame + extension)
                    current_mask.save(current_mask_path)

                    match = frames_match(
                        target_mask_path,
                        current_mask_path,
                        fuzz,
                        max_pixel_diff,
                        None,
                        None,
                    )

                    # Remove each mask after using it
                    os.remove(current_mask_path)

                    if match:
                        # Clean up masks as soon as a match is found
                        cleanup()
                        return p["time"]

            # No matches found; clean up masks
            cleanup()

        return None
    except Exception as e:
        logging.exception(e)
        return None


##########################################################################
#   Check any dependencies
##########################################################################


def check_config():
    ok = True

    if get_decimate_filter() is not None:
        logging.debug("FFMPEG found")
    else:
        print("ffmpeg: FAIL")
        ok = False

    if sys.version_info >= (3, 6):
        logging.debug("Python 3.6+ found")
    else:
        print("Python 3.6+: FAIL")
        ok = False

    try:
        import numpy as np

        logging.debug("Numpy found")
    except BaseException:
        print("Numpy: FAIL")
        ok = False

    try:
        import cv2

        logging.debug("OpenCV-Python found")
    except BaseException:
        print("OpenCV-Python: FAIL")
        ok = False

    try:
        from PIL import Image, ImageCms, ImageDraw, ImageOps  # noqa

        logging.debug("Pillow found")
    except BaseException:
        print("Pillow: FAIL")
        ok = False

    try:
        from ssim import compute_ssim  # noqa

        logging.debug("SSIM found")
    except BaseException:
        print("SSIM: FAIL")
        ok = False

    return ok


def check_process(command, output):
    ok = False
    try:
        out = subprocess.check_output(
            command, stderr=subprocess.STDOUT, shell=True, encoding="UTF-8"
        )
        if out.find(output) > -1:
            ok = True
    except BaseException:
        ok = False
    return ok


##########################################################################
#   Main Entry Point
##########################################################################


def main():
    import argparse

    global options

    parser = argparse.ArgumentParser(
        description="Calculate visual performance metrics from a video.",
        prog="visualmetrics",
    )
    parser.add_argument("--version", action="version", version="%(prog)s 0.1")
    parser.add_argument(
        "-c",
        "--check",
        action="store_true",
        default=False,
        help="Check dependencies (ffmpeg, Numpy, OpenCV-Python, PIL, SSIM).",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="count",
        help="Increase verbosity (specify multiple times for more).",
    )
    parser.add_argument(
        "--logfile", help="Write log messages to given file instead of stdout"
    )
    parser.add_argument(
        "--logformat",
        help="Formatting for the log messages",
        default="%(asctime)s.%(msecs)03d - %(message)s",
    )
    parser.add_argument("-i", "--video", help="Input video file.")
    parser.add_argument(
        "-d",
        "--dir",
        help="Directory of video frames "
        "(as input if exists or as output if a video file is specified).",
    )
    parser.add_argument(
        "--render", help="Render the video frames to the given mp4 video file."
    )
    parser.add_argument(
        "--screenshot",
        help="Save the last frame of video as an image to the path provided.",
    )
    parser.add_argument(
        "-q",
        "--quality",
        type=int,
        help="JPEG Quality " "(if specified, frames will be converted to JPEG).",
    )
    parser.add_argument(
        "-l",
        "--full",
        action="store_true",
        default=False,
        help="Keep full-resolution images instead of resizing to 400x400 pixels",
    )
    parser.add_argument(
        "--thumbsize", type=int, default=400, help="Thumbnail size (defaults to 400)."
    )
    parser.add_argument(
        "-f",
        "--force",
        action="store_true",
        default=False,
        help="Force processing of a video file (overwrite existing directory).",
    )
    parser.add_argument(
        "-o",
        "--orange",
        action="store_true",
        default=False,
        help="Remove orange-colored frames from the beginning of the video.",
    )
    parser.add_argument(
        "--keycolor",
        action="append",
        nargs=8,
        metavar=(
            "key",
            "red_low",
            "red_high",
            "green_low",
            "green_high",
            "blue_low",
            "blue_high",
            "fraction",
        ),
        help="Identify frames that match the given channel (0-255) low and "
        "high. Fraction is the percentage of the pixels per channel that "
        "must be in the given range (0-1).",
    )
    parser.add_argument(
        "-p",
        "--viewport",
        action="store_true",
        default=False,
        help="Locate and use the viewport from the first video frame.",
    )
    parser.add_argument(
        "--viewportretries",
        type=int,
        default=5,
        help="Number of times to attempt to obtain a viewport. Analagous to the "
        "number of frames to try to find a viewport with. By default, up to the "
        "first 5 frames are used.",
    )
    parser.add_argument(
        "--viewportminheight",
        type=int,
        default=0,
        help="The minimum possible height (in pixels) for the viewport. Used when "
        "attempting to find the viewport size. Defaults to 0.",
    )
    parser.add_argument(
        "--viewportminwidth",
        type=int,
        default=0,
        help="The minimum possible width (in pixels) for the viewport. Used when "
        "attempting to find the viewport size. Defaults to 0.",
    )
    parser.add_argument(
        "-s",
        "--start",
        type=int,
        default=0,
        help="Start time (in milliseconds) for calculating visual metrics.",
    )
    parser.add_argument(
        "-e",
        "--end",
        type=int,
        default=0,
        help="End time (in milliseconds) for calculating visual metrics.",
    )
    parser.add_argument(
        "--renderignore",
        type=int,
        default=0,
        help="Ignore the center X%% of the frame when looking for "
        "the first rendered frame (useful for Opera mini).",
    )
    parser.add_argument(
        "-k",
        "--perceptual",
        action="store_true",
        default=False,
        help="Calculate perceptual Speed Index",
    )
    parser.add_argument(
        "--contentful",
        action="store_true",
        default=False,
        help="Calculate contentful Speed Index",
    )
    parser.add_argument(
        "--contentful-video",
        action="store_true",
        default=False,
        help="Produce a video of the edges used in the ContentfulSpeedIndex "
        "calculation. The resulting videos are suffixed with -edge and "
        "-edge-overlay.",
    )
    parser.add_argument(
        "-j",
        "--json",
        action="store_true",
        default=False,
        help="Set output format to JSON",
    )
    parser.add_argument("--progress", help="Visual progress output file.")
    parser.add_argument("--herodata", help="Hero elements data file.")

    options = parser.parse_args()

    if not options.check and not options.dir and not options.video:
        parser.error(
            "A video, Directory of images or histograms file needs to be provided.\n\n"
            "Use -h to see available options"
        )

    if options.perceptual or options.contentful:
        if not options.video:
            parser.error(
                "A video file needs to be provided.\n\n"
                "Use -h to see available options"
            )

    temp_dir = tempfile.mkdtemp(prefix="vis-")
    colors_temp_dir = tempfile.mkdtemp(prefix="vis-color-")
    directory = temp_dir
    if options.dir is not None:
        directory = options.dir
    histogram_file = os.path.join(temp_dir, "histograms.json.gz")

    # Set up logging
    log_level = logging.CRITICAL
    if options.verbose == 1:
        log_level = logging.ERROR
    elif options.verbose == 2:
        log_level = logging.WARNING
    elif options.verbose == 3:
        log_level = logging.INFO
    elif options.verbose == 4:
        log_level = logging.DEBUG
    if options.logfile is not None:
        logging.basicConfig(
            filename=options.logfile,
            level=log_level,
            format=options.logformat,
            datefmt="%H:%M:%S",
        )
    else:
        logging.basicConfig(
            level=log_level, format=options.logformat, datefmt="%H:%M:%S"
        )

    ok = False
    try:
        if not options.check:
            # Run a quick check to make sure all requirements exist,
            # otherwise failures might be silent due to how this code is
            # structured.
            ok = check_config()
            if not ok:
                raise Exception("Please install requirements before running.")

            if options.video:
                orange_file = None
                if options.orange:
                    orange_file = os.path.join(
                        os.path.dirname(os.path.realpath(__file__)), "orange.png"
                    )
                    if not os.path.isfile(orange_file):
                        orange_file = os.path.join(colors_temp_dir, "orange.png")
                        generate_orange_png(orange_file)
                video_to_frames(
                    options.video,
                    directory,
                    options.force,
                    orange_file,
                    options.viewport,
                    options.viewportretries,
                    options.viewportminheight,
                    options.viewportminwidth,
                    options.full,
                )

            key_colors = {}
            if options.keycolor:
                for key_params in options.keycolor:
                    key_colors[key_params[0]] = {
                        "r_low": int(key_params[1]),
                        "r_high": int(key_params[2]),
                        "g_low": int(key_params[3]),
                        "g_high": int(key_params[4]),
                        "b_low": int(key_params[5]),
                        "b_high": int(key_params[6]),
                        "fraction": float(key_params[7]),
                    }

            # Calculate the histograms and visual metrics
            calculate_histograms(directory, histogram_file, options.force)
            metrics = calculate_visual_metrics(
                histogram_file,
                options.start,
                options.end,
                options.perceptual,
                options.contentful,
                directory,
                options.progress,
                options.herodata,
                key_colors,
            )

            if options.screenshot is not None:
                quality = 30
                if options.quality is not None:
                    quality = options.quality
                save_screenshot(directory, options.screenshot, quality)
            # JPEG conversion
            if options.dir is not None and options.quality is not None:
                convert_to_jpeg(directory, options.quality)

            if metrics is not None:
                ok = True
                if options.json:
                    data = dict()
                    for metric in metrics:
                        data[metric["name"].replace(" ", "")] = metric["value"]
                    if "videoRecordingStart" in globals():
                        data["videoRecordingStart"] = videoRecordingStart
                    print(json.dumps(data))
                else:
                    for metric in metrics:
                        print("{0}: {1}".format(metric["name"], metric["value"]))
        else:
            ok = check_config()
    except Exception as e:
        logging.exception(e)
        ok = False

    # Clean up
    shutil.rmtree(temp_dir)
    shutil.rmtree(colors_temp_dir)
    if ok:
        exit(0)
    else:
        exit(1)


if "__main__" == __name__:
    main()
