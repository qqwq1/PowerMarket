FROM python:3.11-slim

WORKDIR /app

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY ./app ./app

EXPOSE 8081

# Простой запуск
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8081"]