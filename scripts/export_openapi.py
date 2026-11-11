#!/usr/bin/env python3
"""
Exports OpenAPI JSON specification from FastAPI app.
"""
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "api")))

from rebound.main import app

def main():
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "packages", "shared"))
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "openapi.json")

    spec = app.openapi()
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)

    print(f"✅ Exported OpenAPI specification to {out_file}")

if __name__ == "__main__":
    main()

