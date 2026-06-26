#!/bin/bash
# Noto CJK フォントのインストール
apt-get update -qq
apt-get install -y -qq fonts-noto-cjk poppler-utils

# Pythonパッケージのインストール
pip install -r requirements.txt
