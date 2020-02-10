#!/bin/bash
set -e
brew update
brew install ffmpeg imagemagick unzip
pip install virtualenv 
brew cask install microsoft-edge
wget https://msedgedriver.azureedge.net/80.0.361.48/edgedriver_mac64.zip
unzip edgedriver_mac64.zip
sudo safaridriver --enable