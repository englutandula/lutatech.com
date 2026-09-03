#!/bin/sh
PORT="${PORT:-8000}"
echo "Starting Luta Tech API on 0.0.0.0:$PORT..."
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers 2
