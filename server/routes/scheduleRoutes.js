// routes/scheduleRoutes.js

const express = require('express');
const ScheduleController = require('../controllers/ScheduleController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Создание нового расписания (только администраторы)
router.post('/', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для создания расписаний' });
    }
    next();
}, ScheduleController.create);

// Получение всех расписаний
router.get('/', ScheduleController.findAll);

// Получение расписания по ID
router.get('/:id', ScheduleController.findOne);

// Обновление расписания по ID
router.put('/:id', ScheduleController.update);

// Удаление расписания по ID (только администраторы)
router.delete('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для удаления расписаний' });
    }
    next();
}, ScheduleController.delete);

module.exports = router;