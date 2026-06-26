#!/bin/bash
set -e

# フォントインストール
apt-get update -qq
apt-get install -y fonts-noto-cjk poppler-utils

# フォントキャッシュ更新
fc-cache -fv

# インストール確認
echo "=== 日本語フォント一覧 ==="
fc-list :lang=ja

# Pythonパッケージ
pip install -r requirements.txt
