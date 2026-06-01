#!/bin/bash
# Auto-update script for APA Asistente Chrome Extension (macOS/Linux)
# This script pulls latest changes from the docker branch and notifies if updated

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BRANCH="docker"
EXTENSION_DIR="$REPO_DIR/extension"
LOG_FILE="$REPO_DIR/.auto-update.log"
LOCK_FILE="$REPO_DIR/.auto-update.lock"

# Function to log messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Prevent concurrent runs
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        log "Update already in progress (PID: $PID). Exiting."
        exit 0
    fi
fi

echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$REPO_DIR"

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log "ERROR: Not a git repository: $REPO_DIR"
    exit 1
fi

# Fetch latest changes without merging
log "Fetching latest changes from origin/$BRANCH..."
if ! git fetch origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Failed to fetch from origin"
    exit 1
fi

# Check if there are new commits
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    log "Already up to date (commit: ${LOCAL_HASH:0:7})"
    exit 0
fi

# Get commit info for notification
COMMIT_MSG=$(git log --oneline origin/$BRANCH -1)
NEW_COMMITS=$(git rev-list --count HEAD..origin/$BRANCH)

log "Update available: $NEW_COMMITS new commit(s)"
log "Latest: $COMMIT_MSG"

# Pull the changes
log "Pulling updates..."
if git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"; then
    log "Successfully updated to: ${REMOTE_HASH:0:7}"
    
    # macOS notification using osascript
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"Extension updated to ${REMOTE_HASH:0:7}. Open chrome://extensions and reload APA Asistente.\" with title \"APA Asistente Updated\" sound name \"Glass\"" 2>/dev/null || true
    fi
    
    echo "$REMOTE_HASH" > "$REPO_DIR/.last-updated-hash"
else
    log "ERROR: Pull failed. There may be conflicts."
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"Update failed - check for conflicts.\" with title \"APA Asistente Update Error\" sound name \"Basso\"" 2>/dev/null || true
    fi
    exit 1
fi
