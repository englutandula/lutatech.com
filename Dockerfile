# Stage 1: Build Next.js Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Production Web Server
FROM python:3.11-slim
RUN useradd -m -u 1000 user

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download and cache AI models for instant inference
RUN mkdir -p /home/user/.u2net && chown -R user:user /home/user/.u2net
USER user
ENV PATH="/home/user/.local/bin:$PATH"
ENV HOME="/home/user"

RUN python -c "from rembg import new_session; new_session('birefnet-portrait')"
RUN mkdir -p /home/user/models && python -c "import urllib.request; urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite', '/home/user/models/blaze_face_short_range.tflite')"

# Copy Backend Application
COPY --chown=user backend/ /app/backend/
COPY --chown=user shared/ /app/shared/

# Copy Compiled Frontend Web Assets
COPY --chown=user --from=frontend-builder /app/frontend/out /app/frontend/out

WORKDIR /app/backend
EXPOSE 8000

ENV PORT=8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
