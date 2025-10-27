#!/bin/bash
set -e

echo "Cleaning up previous builds..."
rm -rf node_modules package-lock.json

echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "Building the application..."
npm run build

echo "Build complete!"
