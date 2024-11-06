#!/bin/bash

if [ ! -d "model" ]; then
    echo "Error: 'model' directory is missing. Please place the model.pt file inside the 'model' directory."
    exit 1
fi

if [ ! -f "model/model.pt" ]; then
    echo "Error: 'model.pt' file is missing in the 'model' directory. Please place it there."
    exit 1
fi

if [ ! -d "yolov5" ]; then
    echo "yolov5 directory not found. Cloning the YOLOv5 repository..."
    git clone https://github.com/ultralytics/yolov5.git
fi

cd yolov5 || exit
echo "Installing YOLOv5 dependencies..."
pip install -r requirements.txt

cd ..
echo "Installing other dependencies..."
pip install -r requirements.txt

# Run the prediction Python script
echo "Running the Prediction script..."
python predict.py
