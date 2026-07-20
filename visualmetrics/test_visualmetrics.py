"""Unit tests for visualmetrics-portable.py.

The frames in test_data/ are real filmstrip frames from a browsertime
run. The expected values are what the portable script computes from
them, pinned so that any change to the metric math shows up as a
failing test instead of silently shifting metrics for every user.

The script file name has a hyphen in it, so it is loaded via importlib
instead of a plain import.

Run with: python -m unittest discover -s visualmetrics -v
"""

import importlib.util
import logging
import shutil
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent

_spec = importlib.util.spec_from_file_location(
    "visualmetrics_portable", HERE / "visualmetrics-portable.py"
)
vm = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(vm)

# The script logs a warning when no hero elements file is given; keep
# the test output clean.
logging.disable(logging.CRITICAL)

EXPECTED_VISUAL_PROGRESS = (
    "0=0, 920=69, 1000=69, 1080=69, 1200=72, 1240=73, 1280=88, "
    "1360=90, 1400=91, 1520=98, 2040=98, 2600=98, 3160=98, 3720=98, "
    "4280=99, 4880=99, 5440=99, 6000=100"
)


def _importable(module):
    try:
        __import__(module)
        return True
    except ImportError:
        return False


class TestVisualMetrics(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp(prefix="vmtest-")
        cls.histograms_file = str(Path(cls.tmp) / "histograms.json.gz")
        vm.calculate_histograms(str(HERE / "test_data"), cls.histograms_file, True)
        histograms = vm.load_histograms(cls.histograms_file, 0, 0)
        cls.progress = vm.calculate_visual_progress(histograms)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp, True)

    def _metrics(self):
        metrics = vm.calculate_visual_metrics(
            self.histograms_file, 0, 0, False, False, "test_data", None, None, {}
        )
        return {metric["name"]: metric["value"] for metric in metrics}

    def test_first_and_last_visual_change(self):
        metrics = self._metrics()
        self.assertEqual(metrics["First Visual Change"], 920)
        self.assertEqual(metrics["Last Visual Change"], 6000)

    def test_speed_index(self):
        self.assertEqual(self._metrics()["Speed Index"], 1125)

    def test_visual_progress(self):
        self.assertEqual(self._metrics()["Visual Progress"], EXPECTED_VISUAL_PROGRESS)

    def test_speed_index_math(self):
        progress = [
            {"time": 0, "progress": 0},
            {"time": 1000, "progress": 50},
            {"time": 2000, "progress": 100},
        ]
        self.assertEqual(vm.calculate_speed_index(progress), 1500)

    @unittest.skipUnless(_importable("cv2"), "OpenCV is not installed")
    def test_contentful_speed_index(self):
        value, _ = vm.calculate_contentful_speed_index(self.progress, "test_data")
        self.assertEqual(value, 1079)

    @unittest.skipUnless(_importable("ssim"), "pyssim is not installed")
    def test_perceptual_speed_index(self):
        value, _ = vm.calculate_perceptual_speed_index(self.progress, "test_data")
        self.assertEqual(value, 947)

    def test_create_frame_diffs(self):
        frames_dir = Path(self.tmp) / "framediffs"
        frames_dir.mkdir()
        frames = sorted((HERE / "test_data").glob("ms_*.png"))
        for frame in frames:
            shutil.copy(frame, frames_dir)

        diffs, instability = vm.create_frame_diffs(str(frames_dir))

        self.assertEqual(len(diffs), len(frames) - 1)
        expected_times = [int(frame.stem[3:]) for frame in frames[1:]]
        self.assertEqual([diff["time"] for diff in diffs], expected_times)
        for diff in diffs:
            diff_file = frames_dir / "diff_{0:06d}.png".format(diff["time"])
            self.assertTrue(diff_file.is_file())
            self.assertGreaterEqual(diff["changedPixels"], 0)
            self.assertGreaterEqual(diff["changedShare"], 0)
            self.assertLessEqual(diff["changedShare"], 100)
        # The first frame has no predecessor, so no diff for it.
        self.assertFalse((frames_dir / "diff_000000.png").is_file())

        self.assertTrue((frames_dir / "instability.png").is_file())
        self.assertGreater(instability["changedPixels"], 0)
        self.assertGreater(instability["changedShare"], 0)
        self.assertLessEqual(instability["changedShare"], 100)
        self.assertGreaterEqual(
            instability["changedPixels"], instability["repeatedlyChangedPixels"]
        )
        self.assertGreaterEqual(instability["maxChanges"], 1)
        self.assertLessEqual(instability["maxChanges"], len(frames) - 1)


if __name__ == "__main__":
    unittest.main()
