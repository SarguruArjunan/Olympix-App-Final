#!/bin/bash

# Production build script
echo "Starting production build..."

# Ensure we're using Node 18
node --version

# Clean install dependencies
echo "Installing dependencies..."
npm ci

# Build the project
echo "Building the project..."
npm run build

echo "Build completed successfully!"