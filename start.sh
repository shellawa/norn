#!/usr/bin/env bash
set -e

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but not installed."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

if [ ! -d "build" ]; then
  echo "Building project..."
  pnpm build
fi

echo "Starting server..."
node build