FROM python:3.11-slim

RUN useradd -m -u 1000 user

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download and cache ultra-lightweight AI models (<200MB RAM)
RUN mkdir -p /home/user/.u2net /home/user/models && chown -R user:user /home/user
USER user
ENV PATH="/home/user/.local/bin:$PATH"
ENV HOME="/home/user"


RUN python -c "from rembg import new_session; new_session('u2net_human_seg'); new_session('u2net'); new_session('u2netp')"
RUN python -c "import urllib.request; urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite', '/home/user/models/blaze_face_short_range.tflite')"

# Copy Backend Code
COPY --chown=user . /app

EXPOSE 10000
EXPOSE 8000

CMD ["./start.sh"]
