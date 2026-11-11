.PHONY: dev test seed sim openapi build run

run:
	python run.py

dev:
	python run.py

test:
	python apps/api/tests/test_full_suite.py
	python apps/api/tests/test_rebound_core.py

seed:
	python scripts/seed.py

sim:
	python scripts/sim.py --users 5000

openapi:
	python scripts/export_openapi.py

build:
	cd apps/web && pnpm build

