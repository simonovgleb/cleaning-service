// controllers/PaymentController.js

const { Payment, Appointment, Customer, Employee, Service } = require('../models/models');
const { Op } = require('sequelize');

class PaymentController {
    /**
     * Создание нового платежа (примерная логика):
     * - Клиент или админ может создать платёж
     * - Нужно передать appointmentId, amount, paymentMethod
     */
    async create(req, res) {
        try {
            const { appointmentId, amount, paymentMethod } = req.body;

            // Проверка обязательных полей
            if (!appointmentId || !amount || !paymentMethod) {
                return res.status(400).json({ message: 'Необходимы appointmentId, amount и paymentMethod' });
            }

            // Ищем запись (Appointment), к которой привязан платёж
            const appointment = await Appointment.findByPk(appointmentId, {
                include: [
                    { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                    { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                    { model: Service, attributes: ['id', 'name'] },
                ],
            });

            if (!appointment) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            // Проверка прав:
            // - Если это клиент, он может создать платёж только для своей записи
            // - Админ может создать платёж для любой записи
            if (req.user.role === 'customer') {
                if (appointment.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к созданию платежа для этой записи' });
                }
            } else if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав для создания платежа' });
            }

            // Проверка, не существует ли уже платежа для этой записи (у нас One-to-One)
            const existingPayment = await Payment.findOne({ where: { appointmentId } });
            if (existingPayment) {
                return res.status(400).json({ message: 'Платёж для этой записи уже существует' });
            }

            // Создаём платёж
            const payment = await Payment.create({
                amount,
                paymentMethod,
                status: 'Pending', // или 'Completed', если сразу оплачивается
                appointmentId,
            });

            return res.status(201).json(payment);
        } catch (error) {
            console.error('Ошибка при создании платежа:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Получение всех платежей:
     * - Админ: все
     * - Клиент: платежи только по своим записям
     * - Сотрудник: платежи по своим записям (по appointment.employeeId)
     */
    async findAll(req, res) {
        try {
            let whereCondition = {};
            let includeCondition = [
                {
                    model: Appointment,
                    include: [
                        { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Service, attributes: ['id', 'name'] },
                    ],
                },
            ];

            if (req.user.role === 'admin') {
                // Админ видит все платежи
                // whereCondition = {}
            } else if (req.user.role === 'customer') {
                // Клиент видит только платежи своих записей
                // Нужно "соединить" через Appointment
                whereCondition = {
                    // Этот вариант сложнее, так как Payment связывается с Appointment.
                    // Мы можем сделать "include", где Appointment.customerId === req.user.customerId
                    // Но проще найти все Payment, где appointmentId входит в список appointmentId клиента.
                    // Для Sequelize "по месту" это делается через include + required: true + where.

                    // Пример:
                    // include: [
                    //   {
                    //     model: Appointment,
                    //     required: true,
                    //     where: { customerId: req.user.customerId },
                    //   },
                    // ],
                };

                // Вместо whereCondition, лучше в includeCondition (Appointment) дописать where
                includeCondition[0] = {
                    ...includeCondition[0],
                    required: true,
                    where: {
                        customerId: req.user.customerId,
                    },
                };
            } else if (req.user.role === 'employee') {
                // Сотрудник видит только платежи своих записей
                includeCondition[0] = {
                    ...includeCondition[0],
                    required: true,
                    where: {
                        employeeId: req.user.employeeId,
                    },
                };
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для просмотра платежей' });
            }

            const payments = await Payment.findAll({
                where: whereCondition,
                include: includeCondition,
            });

            return res.json(payments);
        } catch (error) {
            console.error('Ошибка при получении платежей:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Получение одного платежа по ID:
     * - Админ: любой
     * - Клиент: если платёж по его записи
     * - Сотрудник: если платёж по записи, которая назначена ему
     */
    async findOne(req, res) {
        try {
            const { id } = req.params;
            const payment = await Payment.findByPk(id, {
                include: [
                    {
                        model: Appointment,
                        include: [
                            { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                            { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                            { model: Service, attributes: ['id', 'name'] },
                        ],
                    },
                ],
            });

            if (!payment) {
                return res.status(404).json({ message: 'Платёж не найден' });
            }

            // Проверяем доступ
            const appointment = payment.Appointment;
            if (req.user.role === 'customer') {
                if (appointment.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к этому платежу' });
                }
            } else if (req.user.role === 'employee') {
                if (appointment.employeeId !== req.user.employeeId) {
                    return res.status(403).json({ message: 'Нет доступа к этому платежу' });
                }
            } else if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав для просмотра платежа' });
            }

            return res.json(payment);
        } catch (error) {
            console.error('Ошибка при получении платежа:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Обновление статуса/суммы/метода оплаты платежа:
     * - Админ может обновлять любые поля
     * - Клиент (опционально) может менять статус на "Completed" только для своих платежей
     * - Либо делаем, что клиенту нельзя обновлять ничего (зависит от бизнес-логики)
     */
    async update(req, res) {
        try {
            const paymentId = req.params.id;
            const { amount, paymentMethod, status } = req.body;

            const payment = await Payment.findByPk(paymentId, {
                include: [{
                    model: Appointment,
                    attributes: ['customerId', 'employeeId'],
                }],
            });
            if (!payment) {
                return res.status(404).json({ message: 'Платёж не найден' });
            }

            // Проверяем доступ
            if (req.user.role === 'customer') {
                // Можно ли клиенту обновлять что-то?
                // Допустим, разрешим только сменить статус, если это "Completed",
                // и платёж принадлежит этому клиенту.
                if (payment.Appointment.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к этому платежу' });
                }
                if (status) {
                    if (!['Pending', 'Completed', 'Failed'].includes(status)) {
                        return res.status(400).json({ message: 'Неверный статус платежа' });
                    }
                    payment.status = status;
                }
                // amount/paymentMethod клиенту не даём менять
            } else if (req.user.role === 'admin') {
                // Админ может менять всё
                if (amount !== undefined) payment.amount = amount;
                if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
                if (status !== undefined) {
                    if (!['Pending', 'Completed', 'Failed'].includes(status)) {
                        return res.status(400).json({ message: 'Неверный статус платежа' });
                    }
                    payment.status = status;
                }
            } else if (req.user.role === 'employee') {
                // Обычно сотрудник не меняет платёж,
                // но можно добавить логику при необходимости.
                return res.status(403).json({ message: 'Недостаточно прав для обновления платежа' });
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для обновления платежа' });
            }

            await payment.save();
            return res.json(payment);
        } catch (error) {
            console.error('Ошибка при обновлении платежа:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Удаление платежа:
     * - Обычно имеет смысл только для админа
     * - Клиенту удалять платёж не даём
     */
    async delete(req, res) {
        try {
            const paymentId = req.params.id;
            const payment = await Payment.findByPk(paymentId, {
                include: [{
                    model: Appointment,
                    attributes: ['customerId'],
                }],
            });

            if (!payment) {
                return res.status(404).json({ message: 'Платёж не найден' });
            }

            // Проверка роли
            if (req.user.role === 'admin') {
                // Ок, админ может удалить
            } else if (req.user.role === 'customer') {
                // Можем разрешить удалять, если не Completed (по желанию)
                // Но чаще всего платежи не удаляют. 
                return res.status(403).json({ message: 'Недостаточно прав для удаления платежа' });
            } else if (req.user.role === 'employee') {
                return res.status(403).json({ message: 'Недостаточно прав для удаления платежа' });
            }

            await payment.destroy();
            return res.status(200).json({ message: 'Платёж успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении платежа:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new PaymentController();