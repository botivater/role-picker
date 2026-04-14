FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml README.md ./
COPY role_picker ./role_picker
COPY entrypoint.sh ./

RUN pip install --no-cache-dir .

CMD ["./entrypoint.sh"]