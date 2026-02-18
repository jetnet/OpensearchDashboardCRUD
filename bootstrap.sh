#!/bin/bash

# bootstrap.sh - Setup local development environment for opensearch-dashboards-crud

set -e

PLUGIN_NAME="opensearch-dashboards-crud"
OSD_REPO="https://github.com/opensearch-project/OpenSearch-Dashboards.git"
OSD_BRANCH="2.x"
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")
OSD_DIR="$PARENT_DIR/OpenSearch-Dashboards"

echo "Checking for OpenSearch-Dashboards in $OSD_DIR..."

if [ ! -d "$OSD_DIR" ]; then
    echo "OpenSearch-Dashboards not found. Cloning $OSD_BRANCH branch..."
    git clone --depth 1 --branch $OSD_BRANCH $OSD_REPO "$OSD_DIR"
else
    echo "OpenSearch-Dashboards found at $OSD_DIR."
fi

echo "Linking plugin to OpenSearch-Dashboards/plugins..."
mkdir -p "$OSD_DIR/plugins"
if [ ! -L "$OSD_DIR/plugins/$PLUGIN_NAME" ]; then
    # Remove if it exists as a directory (unlikely but safe)
    if [ -d "$OSD_DIR/plugins/$PLUGIN_NAME" ] && [ ! -L "$OSD_DIR/plugins/$PLUGIN_NAME" ]; then
        rm -rf "$OSD_DIR/plugins/$PLUGIN_NAME"
    fi
    ln -s "$CURRENT_DIR" "$OSD_DIR/plugins/$PLUGIN_NAME"
    echo "Linked $CURRENT_DIR to $OSD_DIR/plugins/$PLUGIN_NAME"
else
    echo "Plugin already linked."
fi

echo "Checking Node.js and Yarn versions..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js (v18 recommended for OSD 2.x)."
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo "Yarn is not installed. Please install Yarn (v1.x recommended)."
    exit 1
fi

echo "Node version: $(node -v)"
echo "Yarn version: $(yarn -v)"

echo "Running yarn osd bootstrap in $OSD_DIR..."
cd "$OSD_DIR"
yarn osd bootstrap

echo "--------------------------------------------------"
echo "Setup complete!"
echo "To start OpenSearch Dashboards with the plugin:"
echo "1. cd $OSD_DIR"
echo "2. yarn start --no-base-path"
echo "--------------------------------------------------"
