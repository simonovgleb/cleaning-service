// routes/adminRoutes.js

const express = require('express');
const AdminController = require('../controllers/AdminController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Маршрут для регистрации администратора
router.post('/registration', AdminController.registration);

// Маршрут для входа администратора
router.post('/login', AdminController.login);

// Маршрут для аутентификации администратора
router.get('/auth', authenticateToken, AdminController.auth);

// Маршруты, требующие аутентификации
router.get('/', authenticateToken, AdminController.findAll); // Получение всех администраторов
router.get('/:id', authenticateToken, AdminController.findOne); // Получение администратора по ID
router.put('/:id', authenticateToken, AdminController.update); // Обновление администратора
router.delete('/:id', authenticateToken, AdminController.delete); // Удаление администратора

module.exports = router;
