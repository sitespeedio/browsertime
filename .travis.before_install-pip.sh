#!/bin/bash
set -e
python -m pip install --upgrade --user pip
python -m pip install --upgrade --user setuptools
python -m pip install --user pyssim
python -m pip --version
python -m pip show Pillow
python -m pip show pyssim