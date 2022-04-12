# wbschool-chat-backend
Серверная часть проекта чата
## Документация для домена http://www.wbschool-chat.ru/

### Незащищенные запросы
GET / Возвращает Hello нужен для проверки работы сервера

POST /signup возвращает email созданного пользователя, требует:
- поле email
- поле password длинной от 8 и до 100 символов
- поле username длинной от 4 до 30 символов

POST /signin возвращает token и объект пользователя newUser, требует:
- поле emailOrUser длинной от 4 до 100 символов
- поле password длинной от 8 до 100 символов

### Защищенные запросы (требуют токен в заголовках)
GET /chats возвращает массив чатов пользователя

POST /chats создает новый чат, требует:
- обязательное поле name длинной от 4 до 40 символов
- обязательное поле users массив, который может быть пустой (с помощью него будут добавляться новые пользователи в чат)
- необязательное поле avatar строка в формате base64
- необязательное поле about строка длинной от 4 до 100 символов
- необязательное поле isNotifications булевое значение
- необязательное поле isRead булевое значение
- необязательное поле isActive булевое значение

DELETE /chats/:chatId удаляет чат и все сообщения в нём, требует:
- обязательный параметр id длинной 24 символа

PATCH /chats/:chatId изменяет чат, требует:
- необязательное поле name длинной от 4 до 40 символов
- необязательное поле users массив (с помощью него будут добавляться новые пользователи в чат)
- необязательное поле avatar строка в формате base64
- необязательное поле about строка длинной от 4 до 100 символов
- необязательное поле isNotifications булевое значение
- необязательное поле isRead булевое значение
- необязательное поле isActive булевое значение

GET /chats/:chatId/messages возвращает список сообщений чата

POST /chats/:chatId/messages создает новое сообщение и возвращает его с датой создания, имеет:
- обязательно поле text длинной до тысячи символов
- необязательное поле imageOrFile строка в формате base64

DELETE /chats/:chatId/messages/:id удаляет сообщение и возвращает его, имеет:
- обязательный параметр id длинной 24 символа

PATCH /chats/:chatId/messages/:id изменяет сообщение и возвращает его с датой обновления сообщения, имеет:
- необязательное поле text длинной до тысячи символов
- необязательное поле imageOrFile строка в формате base64
