#!/bin/bash

echo "======================================"
echo "Starting AI Candidate Evaluation Platform"
echo "======================================"

# Start Ollama
echo "[1/3] Starting Ollama in the background..."
ollama serve >/dev/null 2>&1 &
OLLAMA_PID=$!

# Start Backend
echo "[2/3] Starting Backend..."
cd backend || exit
npm run dev &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "[3/3] Starting Frontend..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================"
echo "All services are running!"
echo "Frontend: http://localhost:3000 (usually)"
echo "Backend:  http://localhost:5010"
echo "Ollama:   Running locally"
echo "======================================"
echo "Press [CTRL+C] to stop all services."

# Trap Ctrl+C to kill the background processes
trap "echo 'Stopping services...'; kill $OLLAMA_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for all background processes to keep the script running
wait
