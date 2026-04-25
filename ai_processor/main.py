import cv2
from ultralytics import YOLO
import subprocess
import os
import time
import threading

# Configuration
input_url = "rtsp://mediamtx:1485/live/stream"
output_url = "rtmp://mediamtx:1484/live/output"
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
    '-r', '30', # Target 30fps for smooth motion
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-f', 'flv',
    output_url
]

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
            # Run inference on a smaller size for speed
            # results = model.predict(frame_to_process, imgsz=320, verbose=False, conf=0.25)
            # Actually, let's use track() for even better box stability if needed, 
            # but predict() is faster for just showing boxes.
            results = model.predict(frame_to_process, imgsz=320, verbose=False, conf=0.25)
            with state_lock:
                latest_annotated_results = results
        
        # Small sleep to allow other threads and keep CPU from 100% just for the loop
        time.sleep(0.01)

def run_system():
    global latest_frame
    
    cap = cv2.VideoCapture(input_url)
    while not cap.isOpened():
        print("Waiting for input stream...")
        time.sleep(2)
        cap = cv2.VideoCapture(input_url)

    # Start AI Detector in background
    detector_thread = threading.Thread(target=detector_thread_func, daemon=True)
    detector_thread.start()

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
        
        # Share this frame with the detector
        with state_lock:
            latest_frame = frame
            current_results = latest_annotated_results

        # Draw the LATEST available boxes on the current frame
        if current_results:
            # Use the plot() method of the results object
            # Note: We need to draw on the CURRENT frame, not the one processed by AI
            # So we manually draw boxes to avoid re-rendering the whole frame if possible,
            # but r.plot() is easier.
            for r in current_results:
                # We can't easily 'plot' on a different frame with ultralytics API 
                # without some hacks, so let's just use the plot() on the processed frame 
                # but update the logic to be: AI thread only produces coordinates, 
                # and this thread draws them.
                
                # Simple hack: if detection is available, show the annotated frame
                # but since we want 30fps video, let's manually draw.
                
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0]
                    conf = box.conf[0]
                    cls = int(box.cls[0])
                    label = f"{model.names[cls]} {conf:.2f}"
                    
                    # Draw rectangle
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    cv2.putText(frame, label, (int(x1), int(y1) - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Immediately push to ffmpeg (No waiting for AI!)
        try:
            proc.stdin.write(frame.tobytes())
        except Exception as e:
            print(f"Error writing to ffmpeg: {e}")
            break

    cap.release()
    proc.terminate()

if __name__ == "__main__":
    run_system()
