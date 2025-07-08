#!/bin/bash

NAME=$1
INTERVAL=${2:-1}

if [ -z "$NAME" ]; then
  echo "Usage: $0 <process_name> [interval]"
  exit 1
fi

echo "🔍 Waiting for process '$NAME' to start..."

# Loop until we find the process
while true; do
  PID=$(pgrep -f "$NAME" | head -n 1)
  if [ -n "$PID" ]; then
    break
  fi
  sleep 1
done

TIMESTAMP=$(date +%s)
OUTPUT="${TIMESTAMP}.png"

echo "✅ Found process '$NAME' (PID: $PID)"
echo "📈 Monitoring — press Ctrl+C to stop..."

# Clean up nicely on Ctrl+C
trap "echo -e '\n🛑 Stopping...'; exit" SIGINT

# Run psrecord until interrupted
psrecord $PID --interval $INTERVAL --plot "$OUTPUT"