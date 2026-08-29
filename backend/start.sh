#!/bin/sh
PORT="${PORT:-10000}"
echo "Starting Luta Studio API on 0.0.0.0:$PORT..."
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
