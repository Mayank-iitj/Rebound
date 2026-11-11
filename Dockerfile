# Multi-stage Docker build for combined Rebound platform (API + Frontend)
# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/apps/web
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY apps/web/ ./
RUN pnpm build

# Stage 2: Python 3.12 Runtime
FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt /app/apps/api/requirements.txt
RUN pip install --no-cache-dir -r /app/apps/api/requirements.txt

COPY apps/api /app/apps/api
COPY content /app/content
COPY scripts /app/scripts
COPY run.py /app/run.py
COPY --from=frontend-builder /app/apps/web/dist /app/apps/web/dist

ENV PYTHONPATH="/app/apps/api"
ENV PORT=10000
ENV HOST=0.0.0.0
ENV ENVIRONMENT=production
ENV DEMO_MODE=true

EXPOSE 10000

CMD ["python", "run.py"]
