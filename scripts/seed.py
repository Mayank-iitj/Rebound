#!/usr/bin/env python3
"""
Rebound Seed Script
Seeds action catalog, BCT techniques, nudge templates, test personas, and cohort analytics.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "api")))

from rebound.core.db import init_db, get_db
from rebound.core.seed_data import seed_database

def main():
    print("Initializing Rebound database schema...")
    init_db()
    db = next(get_db())
    print("Seeding catalog, BCTs, nudge templates, personas (Fatima, Rajesh, Omar), and 500 cohort records...")
    seed_database(db)
    print("✅ Database seeding complete.")

if __name__ == "__main__":
    main()

