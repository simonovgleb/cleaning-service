// routes/employeeRoutes.js

const express = require('express');
const EmployeeController = require('../controllers/EmployeeController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Маршрут для входа сотрудника
router.post('/login', EmployeeController.login);

// Маршрут для аутентификации сотрудника
router.get('/auth', authenticateToken, EmployeeController.auth);

// Маршруты, требующие аутентификации и соответствующей роли
router.post('/', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для создания сотрудников' });
    }
    next();
}, EmployeeController.create); // Создание нового сотрудника (админ)

router.get('/', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для просмотра всех сотрудников' });
    }
    next();
}, EmployeeController.findAll); // Получение списка всех сотрудников (админ)

router.get('/:id', authenticateToken, EmployeeController.findOne); // Получение сотрудника по ID (админ или сам сотрудник)

router.put('/:id', authenticateToken, EmployeeController.update); // Обновление сотрудника (админ или сам сотрудник)

router.delete('/:id', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Нет прав для удаления сотрудников' });
    }
    next();
}, EmployeeController.delete); // Удаление сотрудника (только админ)

module.exports = router;
