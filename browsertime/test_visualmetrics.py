import unittest
import os

from browsertime.visualmetrics import (
    calculate_contentful_speed_index,
    calculate_perceptual_speed_index,
)

HERE = os.path.dirname(__file__)


class TestVisualMetrics(unittest.TestCase):
    def setUp(self):
        self.directory = "test_data"
        images = os.listdir(os.path.join(HERE, self.directory))

        def _p(image):
            p = {}
            p["time"] = int(image.split(".")[0].split("ms_")[-1])
            return p

        progress = [_p(image) for image in images if image.startswith("ms_")]
        self.sorted_progress = sorted(progress,
                                      key = lambda image: image['time'])

    def test_calculate_contentful_speed_index(self):
        res = calculate_contentful_speed_index(self.sorted_progress,
                                               self.directory)
        self.assertEqual(res[0], 1188)

    def test_calculate_perceptual_speed_index(self):
        res = calculate_perceptual_speed_index(self.sorted_progress,
                                               self.directory)
        self.assertEqual(res[0], 946)
