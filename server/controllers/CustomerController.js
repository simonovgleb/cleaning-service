// controllers/CustomerController.js

const { Customer } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class CustomerController {
    // Регистрация клиента
    async registration(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address } = req.body;

            if (!login || !password || !firstName || !lastName) {
                return res.status(400).json({ message: 'Необходимы логин, пароль, имя и фамилия' });
            }

            const existingCustomer = await Customer.findOne({ where: { login } });
            if (existingCustomer) {
                return res.status(400).json({ message: 'Клиент с таким логином уже существует' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const customer = await Customer.create({
                login,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                address,
            });

            res.status(201).json({
                id: customer.id,
                login: customer.login,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phoneNumber: customer.phoneNumber,
                address: customer.address,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при регистрации клиента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход клиента
    async login(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(400).json({ message: 'Необходимы логин и пароль' });
            }

            const customer = await Customer.findOne({ where: { login } });
            if (!customer) {
                return res.status(404).json({ message: 'Клиент не найден' });
            }

            const isMatch = await bcrypt.compare(password, customer.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { customerId: customer.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: customer.id,
                    login: customer.login,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phoneNumber: customer.phoneNumber,
                    address: customer.address,
                    role: 'customer', // Явно указываем роль
                },
            });
        } catch (error) {
            console.error('Ошибка при входе клиента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация клиента
    async auth(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const customer = await Customer.findByPk(decoded.customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Клиент не найден' });
            }

            res.json({
                user: {
                    id: customer.id,
                    login: customer.login,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phoneNumber: customer.phoneNumber,
                    address: customer.address,
                    role: 'customer',
                },
            });
        } catch (error) {
            console.error('Ошибка при аутентификации клиента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение клиента по ID
    async findOne(req, res) {
        try {
            const customer = await Customer.findByPk(req.params.id, {
                attributes: ['id', 'login', 'firstName', 'lastName', 'phoneNumber', 'address', 'createdAt', 'updatedAt'],
            });
            if (!customer) {
                return res.status(404).json({ message: 'Клиент не найден' });
            }
            res.json(customer);
        } catch (error) {
            console.error('Ошибка при получении клиента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех клиентов
    async findAll(req, res) {
        try {
            // Предполагается, что только администраторы могут видеть всех клиентов
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Нет прав для просмотра всех клиентов' });
            }

            const customers = await Customer.findAll({
                attributes: ['id', 'login', 'firstName', 'lastName', 'phoneNumber', 'address', 'createdAt', 'updatedAt'],
            });
            res.json(customers);
        } catch (error) {
            console.error('Ошибка при получении списка клиентов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление данных клиента
    async update(req, res) {
        try {
            const { login, password, firstName, lastName, phoneNumber, address } = req.body;
            const customerId = req.params.id;

            // Проверка прав доступа (либо админ, либо сам клиент)
            if (req.user.role !== 'admin' && req.user.customerId !== parseInt(customerId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const customer = await Customer.findByPk(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Клиент не найден' });
            }

            let updatedData = {};

            if (login) {
                // Проверка уникальности логина
                const existingCustomer = await Customer.findOne({ where: { login } });
                if (existingCustomer && existingCustomer.id !== customer.id) {
                    return res.status(400).json({ message: 'Клиент с таким логином уже существует' });
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

            await customer.update(updatedData);

            res.json({
                id: customer.id,
                login: customer.login,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phoneNumber: customer.phoneNumber,
                address: customer.address,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении клиента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление клиента
    async delete(req, res) {
        try {
            const customerId = req.params.id;

            // Проверка прав доступа (либо админ, либо сам клиент)
            if (req.user.role !== 'admin' && req.user.customerId !== parseInt(customerId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const customer = await Customer.findByPk(customerId);
            if (!customer) {
                return res.status(404).json({ message: 'Клиент не найден' });
            }

            await customer.destroy();

            res.status(200).json({ message: 'Клиент успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении клиента:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new CustomerController();