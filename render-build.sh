#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================================="
echo "  🚀 REBOUND — RENDER COMBINED BUILD PIPELINE"
echo "=========================================================="

# 1. Install Python dependencies
echo "📦 Installing Python 3.12 dependencies..."
python -m pip install --upgrade pip
pip install -r apps/api/requirements.txt

# 2. Build or verify Frontend assets
if [ ! -d "apps/web/dist" ]; then
  echo "⚠️ Pre-built frontend not found. Compiling from source..."
  if command -v pnpm &> /dev/null; then
    cd apps/web && pnpm install && pnpm build && cd ../..
  elif command -v npm &> /dev/null; then
    npm install -g pnpm
    cd apps/web && pnpm install && pnpm build && cd ../..
  fi
else
  echo "✅ Verified pre-compiled frontend distribution bundle in apps/web/dist"
fi

# 3. Export OpenAPI schema and verify database schema
echo "🔄 Verifying schema & database seeds..."
export PYTHONPATH="apps/api"
python scripts/seed.py

echo "=========================================================="
echo "  🎉 BUILD COMPLETED SUCCESSFULLY — READY TO LAUNCH"
echo "=========================================================="

