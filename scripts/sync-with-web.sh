#!/usr/bin/env bash
# sync-with-web.sh — Bi-directional sync between macOS XuViHarness and ViWaldorf Web App
set -e

ACTION="${1:-help}"
WEB_URL="${2:-http://localhost:3000}"
PASSKEY="${3:-}"

LOCAL_DIR="$HOME/Library/Application Support/XuViHarness"
LOCAL_FILE="$LOCAL_DIR/waldorf.json"

if [ "$ACTION" = "push" ]; then
  if [ ! -f "$LOCAL_FILE" ]; then
    echo "Error: Local file not found at $LOCAL_FILE"
    exit 1
  fi
  if [ -z "$PASSKEY" ]; then
    echo "Usage: ./sync-with-web.sh push <web_url> <passkey>"
    exit 1
  fi
  echo "Encrypting and pushing $LOCAL_FILE to $WEB_URL/api/sync..."
  TOKEN_HASH=$(echo -n "$PASSKEY" | shasum -a 256 | awk '{print $1}')
  
  # Base64 payload
  PAYLOAD_B64=$(cat "$LOCAL_FILE" | base64 | tr -d '\n')
  
  curl -s -X POST "$WEB_URL/api/sync" \
    -H "Content-Type: application/json" \
    -d "{\"token\": \"$TOKEN_HASH\", \"payload\": \"$PAYLOAD_B64\"}" | grep -q "ok" && echo "✓ Push successful!" || echo "✗ Push failed."

elif [ "$ACTION" = "pull" ]; then
  if [ -z "$PASSKEY" ]; then
    echo "Usage: ./sync-with-web.sh pull <web_url> <passkey>"
    exit 1
  fi
  TOKEN_HASH=$(echo -n "$PASSKEY" | shasum -a 256 | awk '{print $1}')
  echo "Pulling latest data from $WEB_URL/api/sync..."
  mkdir -p "$LOCAL_DIR"
  
  RES=$(curl -s "$WEB_URL/api/sync?token=$TOKEN_HASH")
  if echo "$RES" | grep -q '"payload"'; then
    # Backup existing
    if [ -f "$LOCAL_FILE" ]; then
      cp "$LOCAL_FILE" "$LOCAL_FILE.bak"
    fi
    echo "$RES" | grep -o '"payload":"[^"]*"' | cut -d'"' -f4 | base64 -d > "$LOCAL_FILE"
    echo "✓ Pull successful! Saved to $LOCAL_FILE (backup at $LOCAL_FILE.bak)"
  else
    echo "✗ Pull failed or no remote data found."
  fi

else
  echo "ViWaldorf Sync Utility"
  echo "Usage:"
  echo "  ./sync-with-web.sh push <web_url> <passkey>"
  echo "  ./sync-with-web.sh pull <web_url> <passkey>"
fi
