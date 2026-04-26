import cv2
from ultralytics import YOLO
import subprocess
import os
import time
import threading
import requests

# Configuration
input_url = "rtsp://mediamtx:1485/live/stream"
output_url = "rtmp://mediamtx:1484/live/output"
backend_url = "http://api-server:3000/api/ai/detections"
model_path = "/app/model.pt"

# Load Model
print(f"Loading model from {model_path}...")
model = YOLO(model_path)

# Shared state between threads
latest_frame = None
latest_annotated_results = None
state_lock = threading.Lock()

# FFmpeg command optimized for 30fps smooth output
command = [
    'ffmpeg',
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-pix_fmt', 'bgr24',
    '-s', '640x480',
    '-r', '30', 
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-f', 'flv',
    output_url
]

def report_thread_func():
    """Thread to report counts to backend every 2 seconds"""
    print("Report thread started.")
    while True:
        with state_lock:
            results = latest_annotated_results
        
        if results:
            for r in results:
                # Count classes (assuming custom model classes: orang, mobil, motor)
                counts = r.boxes.cls.unique().tolist()
                person_count = 0
                car_count = 0
                motor_count = 0
                
                for c in r.boxes.cls:
                    label = model.names[int(c)].lower()
                    if 'orang' in label or 'person' in label:
                        person_count += 1
                    elif 'mobil' in label or 'car' in label:
                        car_count += 1
                    elif 'motor' in label or 'motorcycle' in label:
                        motor_count += 1
                
                try:
                    requests.post(backend_url, json={
                        "person_count": person_count,
                        "car_count": car_count,
                        "motorcycle_count": motor_count
                    }, timeout=1)
                except Exception as e:
                    # Silently fail if backend is down
                    pass
        
        time.sleep(2)

def detector_thread_func():
    global latest_annotated_results
    print("Detector thread started.")
    while True:
        with state_lock:
            if latest_frame is None:
                frame_to_process = None
            else:
                frame_to_process = latest_frame.copy()
        
        if frame_to_process is not None:
            results = model.predict(frame_to_process, imgsz=320, verbose=False, conf=0.25)
            with state_lock:
                latest_annotated_results = results
        
        time.sleep(0.01)

def run_system():
    global latest_frame
    
    cap = cv2.VideoCapture(input_url)
    while not cap.isOpened():
        print("Waiting for input stream...")
        time.sleep(2)
        cap = cv2.VideoCapture(input_url)

    # Start AI Detector and Reporter in background
    threading.Thread(target=detector_thread_func, daemon=True).start()
    threading.Thread(target=report_thread_func, daemon=True).start()

    # Start ffmpeg process
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)

    print("Starting Main Stream Loop (Smooth 30FPS Mode)...")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Stream lost, reconnecting...")
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(input_url)
            continue

        frame = cv2.resize(frame, (640, 480))
        
        with state_lock:
            latest_frame = frame
            current_results = latest_annotated_results

        if current_results:
            for r in current_results:
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0]
                    conf = box.conf[0]
                    cls = int(box.cls[0])
                    label = f"{model.names[cls]} {conf:.2f}"
                    
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    cv2.putText(frame, label, (int(x1), int(y1) - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        try:
            proc.stdin.write(frame.tobytes())
        except Exception as e:
            print(f"Error writing to ffmpeg: {e}")
            break

    cap.release()
    proc.terminate()

if __name__ == "__main__":
    run_system()
