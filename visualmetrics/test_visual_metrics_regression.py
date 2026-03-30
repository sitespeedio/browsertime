#!/usr/bin/env python3
"""
Regression tests for the visual metrics Python script used by browsertime.

Ensures that changes to visualmetrics-portable.py do not accidentally
alter the calculated metrics (Speed Index, Perceptual Speed Index, etc.).
Each test runs the script on a pre-recorded browser video and asserts
that every metric exactly matches a known golden value.

The test videos are recorded from real websites using browsertime across
different configurations:
  - Desktop Chrome and Firefox (macOS screen recording)
  - Desktop with cable-throttled network (5/1 Mbps, 28ms RTT)
  - Android device (Samsung A51, screen recording via adb)

Golden values are stored in test_videos/expected_metrics.json and should
be regenerated with --generate whenever metrics change intentionally.

Usage:
    python test_visual_metrics_regression.py          # Run all tests
    python test_visual_metrics_regression.py -v       # Verbose output

To regenerate expected metrics after intentional changes:
    python test_visual_metrics_regression.py --generate
"""
import json
import os
import subprocess
import sys
import time
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(HERE, "test_videos")
SCRIPT = os.path.join(HERE, "visualmetrics-portable.py")
EXPECTED_FILE = os.path.join(VIDEO_DIR, "expected_metrics.json")
PYTHON = os.environ.get("PYTHON", sys.executable)

# Same arguments that browsertime passes to the script in production
# (see lib/video/postprocessing/visualmetrics/visualMetrics.js)
SCRIPT_ARGS = [
    "--orange",
    "--force",
    "--renderignore", "5",
    "--json",
    "--viewport",
    "--viewportretries", "60",
    "--viewportminheight", "100",
    "--viewportminwidth", "100",
    "--perceptual",
    "--contentful",
    "-vvv",
]

# Every metric the script outputs that we verify
ALL_METRICS = [
    "FirstVisualChange",
    "LastVisualChange",
    "SpeedIndex",
    "PerceptualSpeedIndex",
    "PerceptualSpeedIndexProgress",
    "ContentfulSpeedIndex",
    "ContentfulSpeedIndexProgress",
    "VisualProgress",
    "videoRecordingStart",
]


def run_script(video_path):
    """Run the visual metrics script on a video and return parsed JSON metrics."""
    logfile = video_path + ".test.log"
    args = [PYTHON, SCRIPT, "--video", video_path, "--logfile", logfile] + SCRIPT_ARGS

    result = subprocess.run(args, capture_output=True, text=True, timeout=300)

    if result.returncode != 0:
        raise RuntimeError(
            f"Script failed on {os.path.basename(video_path)} "
            f"(exit {result.returncode}):\n{result.stderr[-500:]}"
        )

    # JSON is the last line of stdout (ffmpeg output may precede it)
    lines = result.stdout.strip().split("\n")
    return json.loads(lines[-1])


def load_expected():
    """Load expected metrics from the golden values file."""
    with open(EXPECTED_FILE) as f:
        return json.load(f)


def generate_expected():
    """Re-generate expected metrics by running the script on all videos."""
    import glob

    videos = sorted(glob.glob(os.path.join(VIDEO_DIR, "*.mp4")))
    expected = {}

    for video in videos:
        name = os.path.basename(video).replace(".mp4", "")
        print(f"  Generating {name}...", end=" ", flush=True)
        start = time.perf_counter()
        try:
            metrics = run_script(video)
            if metrics.get("SpeedIndex", 0) == 0:
                print(f"SKIPPED (zero metrics)")
                continue
            expected[name] = metrics
            elapsed = time.perf_counter() - start
            print(f"SI={metrics['SpeedIndex']} ({elapsed:.1f}s)")
        except Exception as e:
            print(f"FAILED: {e}")

    with open(EXPECTED_FILE, "w") as f:
        json.dump(expected, f, indent=2)

    print(f"\nSaved {len(expected)} entries to {EXPECTED_FILE}")


def make_test(video_name):
    """Create a test method for a given video."""
    video_path = os.path.join(VIDEO_DIR, video_name + ".mp4")

    def test_method(self):
        if not os.path.isfile(video_path):
            self.skipTest(f"Video not found: {video_name}.mp4")

        expected = self._expected.get(video_name)
        if expected is None:
            self.skipTest(f"No expected metrics for {video_name}")

        start = time.perf_counter()
        actual = run_script(video_path)
        elapsed = time.perf_counter() - start

        print(f"\n  {video_name}: SI={actual.get('SpeedIndex')} ({elapsed:.1f}s)")

        # Assert every expected metric matches
        for metric in ALL_METRICS:
            if metric in expected:
                self.assertEqual(
                    actual.get(metric),
                    expected[metric],
                    f"{video_name}: {metric} mismatch\n"
                    f"  expected: {expected[metric]}\n"
                    f"  actual:   {actual.get(metric)}",
                )

        # No unexpected missing metrics
        for key in expected:
            self.assertIn(
                key, actual,
                f"{video_name}: metric '{key}' missing from output",
            )

    test_method.__doc__ = f"Regression test: {video_name}"
    return test_method


class TestVisualMetricsRegression(unittest.TestCase):
    """Run the visual metrics script on each video and compare against golden values."""

    _expected = None

    @classmethod
    def setUpClass(cls):
        if not os.path.isfile(SCRIPT):
            raise FileNotFoundError(f"Script not found: {SCRIPT}")
        if not os.path.isfile(EXPECTED_FILE):
            raise FileNotFoundError(
                f"Expected metrics not found: {EXPECTED_FILE}\n"
                f"Run with --generate to create them."
            )
        cls._expected = load_expected()


# Each video is named {site}_{browser}[_{variant}].mp4
# Recorded with: browsertime -n 1 --video --visualMetrics false <url>
VIDEOS = [
    # Desktop Chrome (macOS)
    "google_chrome",
    "youtube_chrome",
    "wikipedia_chrome",
    "amazon_chrome",
    "reddit_chrome",
    "aftonbladet_chrome",
    "dn_chrome",
    # Desktop Firefox (macOS)
    "github_firefox",
    "apple_firefox",
    "bing_firefox",
    "duckduckgo_firefox",
    "bbc_firefox",
    "cnet_firefox",
    # Desktop with cable throttle (5/1 Mbps, 28ms RTT)
    "aftonbladet_chrome_cable",
    "dn_chrome_cable",
    "cnet_firefox_cable",
    # Android Chrome (Samsung A51)
    "wikipedia_android",
    "aftonbladet_android",
    "sitespeed_android",
]

# One test method per video — each runs the script and asserts all metrics match
for _video in VIDEOS:
    setattr(TestVisualMetricsRegression, f"test_{_video}", make_test(_video))


if __name__ == "__main__":
    if "--generate" in sys.argv:
        sys.argv.remove("--generate")
        print("Generating expected metrics...")
        generate_expected()
    else:
        unittest.main(verbosity=2)
