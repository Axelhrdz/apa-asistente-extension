#!/bin/bash
# Uninstall script for APA Asistente auto-updater (macOS)

set -e

PLIST_NAME="com.apaasistente.auto-update"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "=== APA Asistente Auto-Updater Uninstaller ==="
echo ""

if [ ! -f "$PLIST_PATH" ]; then
    echo "No LaunchAgent found at: $PLIST_PATH"
    echo ""
    exit 0
fi

echo "Removing LaunchAgent: $PLIST_NAME"

# Unload the agent
if launchctl list 2>/dev/null | grep -q "$PLIST_NAME"; then
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
    echo "✓ Stopped the agent"
fi

# Remove the plist file
rm -f "$PLIST_PATH"
echo "✓ Removed LaunchAgent file"

echo ""
echo "Uninstall complete."
