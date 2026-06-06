FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# TORCH_VARIANT controls which PyTorch wheel is installed:
#   cpu  (default) — ~220 MB, no GPU required
#   gpu            — ~2 GB, requires NVIDIA driver + NVIDIA Container Toolkit on host
ARG TORCH_VARIANT=cpu

RUN if [ "$TORCH_VARIANT" = "gpu" ]; then \
      pip install --no-cache-dir torch \
        --index-url https://download.pytorch.org/whl/cu121; \
    else \
      pip install --no-cache-dir torch \
        --index-url https://download.pytorch.org/whl/cpu; \
    fi

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
ENTRYPOINT ["bash", "entrypoint.sh"]
