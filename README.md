# cleaning-service
клонировать репозиторий git clone https://github.com/simonovgleb/cleaning-service.git
На компьютере необходимо установить платформу node.js версии не ниже 20.0.0 и PostgreSQL. Сайт с официальными установочными пакетами –  node.js https://nodejs.org и PostgreSQL https://www.postgresql.org/download/. 
Алгоритм установки программного обеспечения на локальный компьютер:
–  распаковать архив с программным обеспечением или клонировать репозиторий;
–  в среде разработки Visual Studio Code перейти в папку client/cleaning-service;
–  установить зависимости командой npm install;
–  выполнить команду npm start;
–  перейти в папку server;
–  установить зависимости командой npm install;
–  выполнить команду npm run dev.
PORT='ПОРТ ДЛЯ СЕРВЕРА'
DB_NAME='ИМЯ БАЗЫ ДАННЫХ В POSTGRESQL'
DB_USER='ИМЯ ПОЛЬЗОВАТЕЛЯ БАЗЫ ДАННЫХ'
DB_PASSWORD='ПАРОЛЬ ПОЛЬЗОВАТЕЛЯ БАЗЫ ДАННЫХ'
DB_HOST=localhost
DB_PORT='ПОРТ БАЗЫ ДАННЫХ'
JWT_SECRET=smokinglongdoors
REACT_APP_API_URL=http://localhost:PORT
