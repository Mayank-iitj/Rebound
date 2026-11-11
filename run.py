#!/usr/bin/env python3
"""
Rebound — Single Command Platform Runner
Launches the full Rebound API, ML engines, and serves the static Web Client on port 8000.
Open http://localhost:8000 in your browser to experience Rebound.
"""
import sys
import os
import uvicorn

# Ensure apps/api is in the Python module search path
api_dir = os.path.join(os.path.dirname(__file__), "apps", "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from rebound.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"""
    ================================================================
      🚀 REBOUND — BUILT FOR THE BAD WEEK
      Adaptive Behavior-Change Platform (Challenge 09)
      --------------------------------------------------------------
      Serving Web Client & API: http://localhost:{port}
      Swagger / OpenAPI Docs:   http://localhost:{port}/docs
      Ethics Governor Version:  1.0.0 (Hash: 368b1932f91a56bc)
      Active Demo Personas:     Fatima (AR), Rajesh (HI), Omar, Mariam
    ================================================================
    """)
    uvicorn.run(app, host=host, port=port, log_level="info")

