#!/bin/sh
PORT=${PORT:-8000}
echo "Starting BookLeaf Backend on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
