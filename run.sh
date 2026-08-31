#!/bin/bash

# Ensure standard Homebrew and system paths are available
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "======================================"
echo "Starting AI Candidate Evaluation Platform"
echo "======================================"

# 0. Ensure backend uploads directory exists
mkdir -p backend/uploads

# 1. Clean up any stale processes on frontend & backend ports
echo "Checking ports..."
for PORT in 5010 3000; do
  PORT_PID=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$PORT_PID" ]; then
    echo "  -> Port $PORT is already in use (PID $PORT_PID). Freeing port..."
    kill -9 "$PORT_PID" 2>/dev/null || true
  fi
done

# 2. Start Ollama
echo "[1/3] Checking Ollama..."
OLLAMA_STARTED=0
if lsof -i :11434 >/dev/null 2>&1; then
  echo "  -> Ollama is already running on port 11434."
else
  if command -v ollama >/dev/null 2>&1; then
    echo "  -> Starting Ollama in the background..."
    ollama serve >/dev/null 2>&1 &
    OLLAMA_PID=$!
    OLLAMA_STARTED=1
    sleep 2
  else
    echo "  -> Warning: 'ollama' command not found in PATH. Make sure Ollama is installed."
  fi
fi

# 3. Start Backend
echo "[2/3] Starting Backend (Port 5010)..."
cd backend || exit 1
npm run dev &
BACKEND_PID=$!
cd ..

# 4. Start Frontend
echo "[3/3] Starting Frontend (Port 3000)..."
cd frontend || exit 1
npm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================"
echo "All services are running!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5010"
if lsof -i :11434 >/dev/null 2>&1; then
  echo "Ollama:   http://localhost:11434 (Active)"
else
  echo "Ollama:   Fallback mode active"
fi
echo "======================================"
echo "Press [CTRL+C] to stop all services."

# Cleanup trap for graceful shutdown
cleanup() {
  echo ""
  echo "Stopping services..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  if [ "$OLLAMA_STARTED" -eq 1 ] && [ -n "$OLLAMA_PID" ]; then
    kill "$OLLAMA_PID" 2>/dev/null
  fi
  # Clean up ports if child processes lingered
  for PORT in 5010 3000; do
    PORT_PID=$(lsof -ti :$PORT 2>/dev/null)
    [ -n "$PORT_PID" ] && kill -9 "$PORT_PID" 2>/dev/null
  done
  echo "All services stopped."
  exit 0
}

trap cleanup INT TERM

# Wait for background processes
wait
