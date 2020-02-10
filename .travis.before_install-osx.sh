#!/bin/bash
set -e
brew update
brew install ffmpeg imagemagick unzip
pip install virtualenv 
brew cask install microsoft-edge
wget https://msedgedriver.azureedge.net/79.0.309.65/edgedriver_mac64.zip
unzip edgedriver_mac64.zip
/Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge --version
sudo safaridriver --enable