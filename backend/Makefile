.PHONY: dev test lint typecheck format install

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest

lint:
	black --check . && isort --check-only .

typecheck:
	mypy app

format:
	black . && isort .
