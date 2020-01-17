import unittest
import os

from visualmetrics import calculate_contentful_speed_index

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
        res = calculate_contentful_speed_index(progress, directory)
        self.assertTrue(res[0], 5080)
