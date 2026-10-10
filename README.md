# Запуск JSON-server

Установите зависимости:

```sh
npm install
```

Задайте имя пользователя и пароль для входа в админку и запустите JSON-server:

```sh
ADMIN_USERNAME=admin ADMIN_PASSWORD='ваш-пароль' npm run start:api
```

Сервер запустится на `http://localhost:4545` и будет использовать базу
`db/db.json`.
