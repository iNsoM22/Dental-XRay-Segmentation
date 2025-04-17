#!/bin/bash

set -e

command -v pip >/dev/null 2>&1 || { echo >&2 "pip is not installed. Aborting."; exit 1; }

# Check for model directory and file
if [ ! -d "backend/model" ]; then
    echo "Error: 'model' directory is missing. Please place the model.pt file inside the 'model' directory."
    exit 1
fi

if [ ! -f "backend/model/model.pt" ]; then
    echo "Error: 'model.pt' file is missing in the 'model' directory. Please place it there."
    exit 1
fi

# Build Frontend
pushd dentai
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is not installed. Aborting."; exit 1; }

npm run build
popd

# Backend Setup
pushd backend

# Clone YOLOv5 if not present
if [ ! -d "yolov5" ]; then
    echo "yolov5 directory not found. Cloning the YOLOv5 repository..."
    git clone https://github.com/ultralytics/yolov5.git
fi

# Install YOLOv5 requirements
pushd yolov5
echo "Installing YOLOv5 dependencies..."
pip install -r requirements.txt
popd

# Install backend requirements
echo "Installing other backend dependencies..."
pip install -r requirements.txt


echo "Application Dependencies has been Installed Successfully"
