// routes/customerRoutes.js

const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const authenticateToken = require('../middleware/authenticateToken'); // Предполагается, что middleware может различать роли

const router = express.Router();

// Публичные маршруты
router.post('/registration', CustomerController.registration);
router.post('/login', CustomerController.login);

// Маршрут для аутентификации клиента
router.get('/auth', authenticateToken, CustomerController.auth);

// Маршруты, требующие аутентификации
router.get('/', authenticateToken, CustomerController.findAll); // Получение всех клиентов (только для администраторов)
router.get('/:id', authenticateToken, CustomerController.findOne); // Получение клиента по ID (админ или сам клиент)
router.put('/:id', authenticateToken, CustomerController.update); // Обновление клиента (админ или сам клиент)
router.delete('/:id', authenticateToken, CustomerController.delete); // Удаление клиента (админ или сам клиент)

module.exports = router;
