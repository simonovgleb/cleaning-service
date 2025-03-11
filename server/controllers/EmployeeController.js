// controllers/EmployeeController.js

const { Employee } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class EmployeeController {
    // Создание сотрудника (доступно только администраторам)
    async create(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address, role } = req.body;

            if (!login || !password || !firstName || !lastName) {
                return res.status(400).json({ message: 'Необходимы логин, пароль, имя и фамилия' });
            }

            const existingEmployee = await Employee.findOne({ where: { login } });
            if (existingEmployee) {
                return res.status(400).json({ message: 'Сотрудник с таким логином уже существует' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const employee = await Employee.create({
                login,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                address,
                role: role || 'Employee',
            });

            res.status(201).json({
                id: employee.id,
                login: employee.login,
                firstName: employee.firstName,
                lastName: employee.lastName,
                phoneNumber: employee.phoneNumber,
                address: employee.address,
                role: employee.role,
                createdAt: employee.createdAt,
                updatedAt: employee.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании сотрудника:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход сотрудника
    async login(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            const employee = await Employee.findOne({ where: { login } });
            if (!employee) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            const isMatch = await bcrypt.compare(password, employee.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { employeeId: employee.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: employee.id,
                    login: employee.login,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    phoneNumber: employee.phoneNumber,
                    address: employee.address,
                    role: employee.role || 'employee',
                },
            });
        } catch (error) {
            console.error('Ошибка при входе сотрудника:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация сотрудника
    async auth(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const employee = await Employee.findByPk(decoded.employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            res.json({
                user: {
                    id: employee.id,
                    login: employee.login,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    phoneNumber: employee.phoneNumber,
                    address: employee.address,
                    role: employee.role || 'employee',
                },
            });
        } catch (error) {
            console.error('Ошибка при аутентификации сотрудника:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение сотрудника по ID
    async findOne(req, res) {
        try {
            const employee = await Employee.findByPk(req.params.id, {
                attributes: ['id', 'login', 'firstName', 'lastName', 'phoneNumber', 'address', 'role', 'createdAt', 'updatedAt'],
            });
            if (!employee) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }
            res.json(employee);
        } catch (error) {
            console.error('Ошибка при получении сотрудника:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех сотрудников (доступно только администраторам)
    async findAll(req, res) {
        try {
            // Проверка роли пользователя
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Нет прав для просмотра всех сотрудников' });
            }

            const employees = await Employee.findAll({
                attributes: ['id', 'login', 'firstName', 'lastName', 'phoneNumber', 'address', 'role', 'createdAt', 'updatedAt'],
            });
            res.json(employees);
        } catch (error) {
            console.error('Ошибка при получении списка сотрудников:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных сотрудника
    async update(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address, role } = req.body;
            const employeeId = req.params.id;

            // Проверка прав доступа (либо админ, либо сам сотрудник)
            if (req.user.role !== 'admin' && req.user.employeeId !== parseInt(employeeId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const employee = await Employee.findByPk(employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            let updatedData = {};

            if (login) {
                // Проверка уникальности логина
                const existingEmployee = await Employee.findOne({ where: { login } });
                if (existingEmployee && existingEmployee.id !== employee.id) {
                    return res.status(400).json({ message: 'Сотрудник с таким логином уже существует' });
                }
                updatedData.login = login;
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updatedData.password = hashedPassword;
            }

            if (firstName) updatedData.firstName = firstName;
            if (lastName) updatedData.lastName = lastName;
            if (phoneNumber) updatedData.phoneNumber = phoneNumber;
            if (address) updatedData.address = address;
            if (role && req.user.role === 'admin') updatedData.role = role; // Только админ может обновлять роль

            await employee.update(updatedData);

            res.json({
                id: employee.id,
                login: employee.login,
                firstName: employee.firstName,
                lastName: employee.lastName,
                phoneNumber: employee.phoneNumber,
                address: employee.address,
                role: employee.role,
                createdAt: employee.createdAt,
                updatedAt: employee.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении сотрудника:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление сотрудника (доступно только администраторам)
    async delete(req, res) {
        try {
            const employeeId = req.params.id;

            // Проверка прав доступа (только админ может удалять сотрудников)
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const employee = await Employee.findByPk(employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            await employee.destroy();

            res.status(200).json({ message: 'Сотрудник успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении сотрудника:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new EmployeeController();