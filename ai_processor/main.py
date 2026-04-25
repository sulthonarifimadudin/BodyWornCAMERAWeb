import cv2
from ultralytics import YOLO
import subprocess
import os
import time
import threading
from queue import Queue

# Configuration
# Note: Using 'mediamtx' as hostname because they are in the same docker network
input_url = "rtsp://mediamtx:1485/live/stream"
output_url = "rtmp://mediamtx:1484/live/output"
model_path = "/app/model.pt" # Path inside container pointing to the single .pt file

# Load Model
print(f"Loading model from {model_path}...")
model = YOLO(model_path)

# FFmpeg command optimized for low latency and speed
command = [
    'ffmpeg',
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-pix_fmt', 'bgr24',
    '-s', '640x480',
    '-r', '20', 
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-f', 'flv',
    output_url
]

frame_queue = Queue(maxsize=2)

def frame_reader():
    cap = cv2.VideoCapture(input_url)
    while not cap.isOpened():
        print("Waiting for input stream...")
        time.sleep(2)
        cap = cv2.VideoCapture(input_url)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.release()
            cap = cv2.VideoCapture(input_url)
            continue
        
        if not frame_queue.full():
            frame_queue.put(frame)
        else:
            # Drop old frame to keep it fresh
            try:
                frame_queue.get_nowait()
                frame_queue.put(frame)
            except:
                pass

def run_detection():
    # Start reader thread
    reader_thread = threading.Thread(target=frame_reader, daemon=True)
    reader_thread.start()

    # Start ffmpeg process
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)

    frame_count = 0
    last_results = None
    
    print("Starting optimized detection loop...")
    while True:
        if frame_queue.empty():
            time.sleep(0.01)
            continue
            
        frame = frame_queue.get()
        frame = cv2.resize(frame, (640, 480))
        
        # Process only every 5th frame to save CPU
        if frame_count % 5 == 0:
            # Reduce inference size to 320 for speed
            results = model.predict(frame, imgsz=320, verbose=False, conf=0.25)
            last_results = results
        
        # Overlay the last results on every frame (smooth bounding boxes)
        if last_results:
            for r in last_results:
                # Use a custom draw if r.plot() is too slow, but r.plot() is usually okay
                frame = r.plot() 
        
        # Write to ffmpeg
        try:
            proc.stdin.write(frame.tobytes())
        except Exception as e:
            print(f"Error writing to ffmpeg: {e}")
            break
            
        frame_count += 1

if __name__ == "__main__":
    run_detection()
