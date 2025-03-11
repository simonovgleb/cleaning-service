// routes/appointmentRoutes.js

const express = require('express');
const AppointmentController = require('../controllers/AppointmentController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Публичные маршруты (доступны только аутентифицированным пользователям)

// Создание новой записи (доступно клиентам и администраторам)
router.post('/', authenticateToken, (req, res, next) => {
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Нет прав для создания записей' });
}, AppointmentController.create);

// Получение всех записей
router.get('/', authenticateToken, AppointmentController.findAll);

// Получение доступных сотрудников для назначения
router.get('/available-employees', authenticateToken, (req, res, next) => {
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Нет прав для просмотра доступных сотрудников' });
}, AppointmentController.getAvailableEmployees);

// Получение записи по ID
router.get('/:id', authenticateToken, AppointmentController.findOne);

// Обновление записи
router.put('/:id', authenticateToken, AppointmentController.update);

// Удаление записи
router.delete('/:id', authenticateToken, (req, res, next) => {
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Нет прав для удаления записей' });
}, AppointmentController.delete);

module.exports = router;