FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (inclui ffmpeg para áudio e libs para WeasyPrint PDF)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    ffmpeg \
    libpango1.0-dev \
    libcairo2-dev \
    libgdk-pixbuf2.0-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p /app/data/agentes /app/data/memorias /app/data/resultados

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
