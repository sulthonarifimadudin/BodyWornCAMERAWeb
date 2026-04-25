import cv2
from ultralytics import YOLO
import subprocess
import os
import time

# Configuration
# Note: Using 'mediamtx' as hostname because they are in the same docker network
input_url = "rtsp://mediamtx:1485/live/stream"
output_url = "rtmp://mediamtx:1484/live/output"
model_path = "/app/model/best" # Path inside container pointing to the 'best' folder if it is a directory

# Load Model
print(f"Loading model from {model_path}...")
try:
    model = YOLO(model_path)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    # Fallback to general yolov8n if custom fails
    model = YOLO("yolov8n.pt")

# FFmpeg command for pushing the annotated stream
# We use a standard preset for speed on CPU
command = [
    'ffmpeg',
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-pix_fmt', 'bgr24',
    '-s', '640x480',
    '-r', '15', # Reduced framerate to save CPU
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'ultrafast',
    '-f', 'flv',
    output_url
]

def run_detection():
    cap = cv2.VideoCapture(input_url)
    
    # Wait for stream to be available
    while not cap.isOpened():
        print("Waiting for input stream...")
        time.sleep(2)
        cap = cv2.VideoCapture(input_url)

    # Start ffmpeg process
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)

    print("Starting detection loop...")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to read frame, retrying...")
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(input_url)
            continue

        # Resize to 640x480 for consistency and speed
        frame = cv2.resize(frame, (640, 480))

        # Perform Detection
        # classes: 0=person, 2=car, 3=motorcycle (COCO defaults, adjust if custom classes differ)
        # Assuming user's custom model might have different IDs, but we'll use defaults for now 
        # or just detect all if it's custom.
        results = model(frame, stream=True, verbose=False)

        for r in results:
            annotated_frame = r.plot() # Draws bounding boxes

        # Write to ffmpeg
        try:
            proc.stdin.write(annotated_frame.tobytes())
        except Exception as e:
            print(f"Error writing to ffmpeg: {e}")
            break

    cap.release()
    proc.terminate()

if __name__ == "__main__":
    run_detection()
