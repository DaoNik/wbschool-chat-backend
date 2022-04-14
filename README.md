# wbschool-chat-backend
Серверная часть проекта чата
## Документация для домена http://www.wbschool-chat.ru/

### Незащищенные запросы
GET / Возвращает Hello нужен для проверки работы сервера

POST /signup возвращает email созданного пользователя, требует:
- поле email
- поле password длиной от 8 и до 100 символов
- поле username длиной от 4 до 30 символов

POST /signin возвращает token и объект пользователя newUser, требует:
- поле emailOrUser длиной от 4 до 100 символов
- поле password длиной от 8 до 100 символов

### Защищенные запросы (требуют токен в заголовках)
#### Users
GET /users возвращает массив пользователей

GET /users/me возвращает текущего пользователя

DELETE /users/:userId удаляет пользователя и возвращает его id, требует:
- обязательный параметр id длиной 24 символа
- обязательное поле password длиной от 8 до 100 символов

PATCH /users/me возвращает измененного пользователя, требует:
- необязательное поле about длиной от 2 до 100 символов
- необязательное поле avatar в формате base64
- необязательное поле email
- необязательное поле username длиной от 4 до 30 символов

PATCH /users/me/newPass возвращает измененного пользователя, требует:
- обязательное поле email 
- обязательное поле password
- обязательное поле newPassword

#### Chats
GET /chats возвращает массив личных чатов пользователя

GET /chats/groups возвращает массив общих чатов пользователей

POST /chats создает новый чат, требует:
- обязательное поле name длинной от 4 до 40 символов
- обязательное поле users массив, который может быть пустой (с помощью него будут добавляться новые пользователи в чат)
- необязательное поле avatar строка в формате base64
- необязательное поле about строка длинной от 4 до 100 символов
- необязательное поле isNotifications булевое значение
- необязательное поле isRead булевое значение
- необязательное поле isActive булевое значение

DELETE /chats/:chatId удаляет чат и все сообщения в нём, требует:
- обязательный параметр id длиной 24 символа

PATCH /chats/:chatId изменяет чат, требует:
- необязательное поле name длинной от 4 до 40 символов
- необязательное поле users массив (с помощью него будут добавляться новые пользователи в чат)
- необязательное поле avatar строка в формате base64
- необязательное поле about строка длинной от 4 до 100 символов
- необязательное поле isNotifications булевое значение
- необязательное поле isRead булевое значение
- необязательное поле isActive булевое значение

#### Messages

GET /chats/:chatId/messages возвращает список сообщений чата

POST /chats/:chatId/messages создает новое сообщение и возвращает его с датой создания, имеет:
- обязательно поле text длинной до тысячи символов
- необязательное поле imageOrFile строка в формате base64

DELETE /chats/:chatId/messages/:id удаляет сообщение и возвращает его id, имеет:
- обязательный параметр id длиной 24 символа

PATCH /chats/:chatId/messages/:id изменяет сообщение и возвращает его с датой обновления сообщения, имеет:
- необязательное поле text длиной до тысячи символов
- необязательное поле imageOrFile строка в формате base64

#### Notifications

GET /users/notifications - возвращает все уведомление  

POST /users/notifications - создает новое уведомление и возвращает его с датой создания, id уведомления и id создателя. Имеет:
- обязательное поле text длиной до трехсот символов

DELETE /users/notifications/notificationId - удаляет уведомление и возвращает его id, имеет:
- обязательный параметр id длиной 24 символа
