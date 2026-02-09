# 🐳 Simple List - Docker + PostgreSQL + FastAPI

Минимальное приложение с сохранением данных в PostgreSQL.

## 🚀 Быстрый старт

# Запустить Docker
docker-compose up --build

# Открыть в браузере:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs


## 📁 Структура

``` txt
simple-list/
├── backend/          # FastAPI + PostgreSQL
│   ├── app.py       # API логика
│   ├── Dockerfile   # Контейнер Python
│   └── requirements.txt
├── frontend/        # HTML/JS интерфейс
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── Dockerfile   # Контейнер Nginx
└── docker-compose.yml  # Оркестрация
```
---

## 🔧 Технологии

- **FastAPI** - Python бэкенд
- **PostgreSQL** - база данных
- **HTML/CSS/JS** - фронтенд
- **Docker** - контейнеризация
- **Docker Compose** - управление сервисами

## 📝 Функции

✅ Добавление записей  
✅ Просмотр списка  
✅ Удаление записей  
✅ Сохранение в БД  

## 🐳 Команды Docker

# Запуск
docker-compose up --build

# Запуск в фоне
docker-compose up -d --build

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Очистка
docker-compose down -v --rmi all
\`\`\`

## 📞 Контакты

Проект создан для демонстрации Docker + PostgreSQL + GitHub