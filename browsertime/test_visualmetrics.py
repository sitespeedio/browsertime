import unittest
import os

from browsertime.visualmetrics import (
    calculate_contentful_speed_index,
    calculate_perceptual_speed_index,
)

HERE = os.path.dirname(__file__)


class TestVisualMetrics(unittest.TestCase):
    def test_calculate_contentful_speed_index(self):
        directory = "test_data"
        images = os.listdir(os.path.join(HERE, directory))

        def _p(image):
            p = {}
            p["time"] = int(image.split(".")[0].split("ms_")[-1])
            return p

        progress = [_p(image) for image in images if image.startswith("ms_")]
        res = calculate_contentful_speed_index(sorted(progress,
                                                      key = lambda image: image['time']),
                                               directory)
        self.assertEqual(res[0], 5080)

    def test_calculate_perceptual_speed_index(self):
        directory = "test_data"
        images = os.listdir(os.path.join(HERE, directory))

        def _p(image):
            p = {}
            p["time"] = int(image.split(".")[0].split("ms_")[-1])
            return p

        progress = [_p(image) for image in images if image.startswith("ms_")]
        res = calculate_perceptual_speed_index(sorted(progress,
                                                      key = lambda image: image['time']),
                                               directory)
        self.assertEqual(res[0], 946)
