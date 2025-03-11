// routes/serviceRoutes.js
const express = require('express');
const ServiceController = require('../controllers/ServiceController');
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/upload'); // Импортируем Multer

const router = express.Router();

// Публичные маршруты (доступны только аутентифицированным пользователям)

// Получение всех услуг
router.get('/', authenticateToken, ServiceController.findAll);

// Получение услуги по ID
router.get('/:id', authenticateToken, ServiceController.findOne);

// Маршруты, требующие роли 'admin'

// Создание новой услуги (доступно только администраторам)
// Используем Multer middleware для обработки поля 'photo'
router.post(
    '/',
    authenticateToken,
    (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Нет прав для создания услуг' });
        }
        next();
    },
    upload.single('photo'), // Обработка одного файла с полем 'photo'
    ServiceController.create
);

// Обновление услуги (доступно только администраторам)
router.put(
    '/:id',
    authenticateToken,
    (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Нет прав для обновления услуг' });
        }
        next();
    },
    upload.single('photo'), // Обработка одного файла с полем 'photo'
    ServiceController.update
);

// Удаление услуги (доступно только администраторам)
router.delete('/:id', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для удаления услуг' });
    }
    next();
}, ServiceController.delete);

module.exports = router;
