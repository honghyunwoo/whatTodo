#!/bin/bash
export EXPO_ROUTER_APP_ROOT=./app

# Start Expo in background
npx expo start --web --port 8081 --host lan &
EXPO_PID=$!

# Wait for webpack to be ready with curl
echo "Waiting for Expo webpack server..."
for i in {1..90}; do
  if curl -s -o /dev/null -w '' --max-time 2 http://localhost:19006 2>/dev/null; then
    echo "Webpack server ready on port 19006"
    break
  fi
  sleep 1
done

# Start proxy server immediately to serve requests
echo "Starting proxy server on port 5000..."
exec node proxy-server.js
