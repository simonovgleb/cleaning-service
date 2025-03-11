// routes/feedbackRoutes.js

const express = require('express');
const FeedbackController = require('../controllers/FeedbackController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Создание нового отзыва (только клиенты и администраторы)
router.post('/', (req, res, next) => {
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Нет прав для создания отзывов' });
}, FeedbackController.create);

// Получение всех отзывов
router.get('/', FeedbackController.findAll);

// Получение отзыва по ID
router.get('/:id', FeedbackController.findOne);

// Обновление отзыва по ID
router.put('/:id', (req, res, next) => {
    // Клиенты могут обновлять свои отзывы, админы - любые
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Нет прав для обновления отзывов' });
}, FeedbackController.update);

// Удаление отзыва по ID
router.delete('/:id', (req, res, next) => {
    // Клиенты могут удалять свои отзывы, админы - любые
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Нет прав для удаления отзывов' });
}, FeedbackController.delete);

module.exports = router;