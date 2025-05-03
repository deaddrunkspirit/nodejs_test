# REST API Аутентификации Пользователей

## Возможности

- Регистрация и вход пользователей
- Аутентификация на основе JWT
- Защищенный эндпоинт для получения списка пользователей
- Документация API через Swagger
- Интеграция с базой данных PostgreSQL
- Поддержка TypeScript

## Требования

- Node.js (версия 14 или выше)
- PostgreSQL (локально или удаленно)
- npm или yarn
- Docker и Docker Compose (опционально)

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корневой директории со следующими переменными:
```
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nodejs_test
JWT_SECRET=your-super-secret-key-change-in-production
```

## Запуск Приложения

### Использование Docker (Рекомендуется)
```bash
docker-compose up --build
```

### Без Docker
Режим разработки:
```bash
npm run dev
```

Режим продакшн:
```bash
npm run build
npm start
```

## Документация API

После запуска сервера документацию Swagger можно найти по адресу:
```
http://localhost:3000/api-docs
```

## Эндпоинты API

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход и получение JWT токена

### Пользователи
- `GET /api/users` - Получение списка пользователей (требуется аутентификация)
- `GET /api/users/:id` - Получение пользователя по ID (требуется аутентификация)
- `PUT /api/users/:id` - Обновление пользователя (требуется аутентификация)
- `DELETE /api/users/:id` - Удаление пользователя (требуется аутентификация)

## Тестирование

Для запуска тестов:
```bash
npm test
```
