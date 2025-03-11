// routes/paymentRoutes.js

const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticateToken);

/**
 * Создание нового платежа (POST /payments)
 * - клиенты и админы
 */
router.post('/', (req, res, next) => {
    if (req.user.role === 'customer' || req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Недостаточно прав для создания платежа' });
}, PaymentController.create);

/**
 * Получение списка платежей (GET /payments)
 * - admin видит все
 * - customer видит только свои
 * - employee видит свои (если хотите)
 */
router.get('/', PaymentController.findAll);

/**
 * Получение одного платежа (GET /payments/:id)
 * - admin, customer (если его запись), employee (если его запись)
 */
router.get('/:id', PaymentController.findOne);

/**
 * Обновление платежа (PUT /payments/:id)
 * - admin может обновлять любые поля
 * - customer при желании может менять статус (Pending -> Completed), если это его платеж
 */
router.put('/:id', PaymentController.update);

/**
 * Удаление платежа (DELETE /payments/:id)
 * - admin
 */
router.delete('/:id', (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }
    // Если хотите дать клиенту удалять свои Pending-платежи, тоже можно
    // Но по умолчанию запретим
    return res.status(403).json({ message: 'Недостаточно прав для удаления платежа' });
}, PaymentController.delete);

module.exports = router;
