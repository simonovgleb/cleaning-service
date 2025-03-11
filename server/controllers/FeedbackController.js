// controllers/FeedbackController.js

const { Feedback, Appointment, Customer, Employee, Service } = require('../models/models');
const { Op } = require('sequelize');

class FeedbackController {
    // Создание нового отзыва (доступно только клиентам и администраторам)
    async create(req, res) {
        try {
            const { appointmentId, rating, comment } = req.body;
            const userId = req.user.role === 'customer' ? req.user.customerId : req.body.customerId;

            // Проверка наличия обязательных полей
            if (!appointmentId || !rating) {
                return res.status(400).json({ message: 'Необходимы ID записи и рейтинг' });
            }

            // Проверка существования записи (appointment)
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

            // Проверка, что отзыв создается клиентом, связанным с этой записью
            if (req.user.role === 'customer' && appointment.customerId !== req.user.customerId) {
                return res.status(403).json({ message: 'Вы не можете оставлять отзыв для этой записи' });
            }

            // Проверка, что запись завершена перед созданием отзыва
            if (appointment.status !== 'Completed') {
                return res.status(400).json({ message: 'Отзыв можно оставить только после завершения записи' });
            }

            // Проверка, что отзыв для этой записи еще не существует
            const existingFeedback = await Feedback.findOne({ where: { appointmentId } });
            if (existingFeedback) {
                return res.status(400).json({ message: 'Отзыв для этой записи уже существует' });
            }

            // Создание отзыва
            const feedback = await Feedback.create({
                rating,
                comment,
                appointmentId,
                customerId: appointment.customerId,
                employeeId: appointment.employeeId,
            });

            res.status(201).json({
                id: feedback.id,
                rating: feedback.rating,
                comment: feedback.comment,
                appointmentId: feedback.appointmentId,
                customerId: feedback.customerId,
                employeeId: feedback.employeeId,
                createdAt: feedback.createdAt,
                updatedAt: feedback.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех отзывов
    // Администраторы: все отзывы
    // Сотрудники: отзывы по своим записям
    // Клиенты: свои отзывы
    async findAll(req, res) {
        try {
            let feedbacks;

            if (req.user.role === 'admin') {
                feedbacks = await Feedback.findAll({
                    include: [
                        // Связываем Feedback -> Appointment -> Service
                        {
                            model: Appointment,
                            attributes: ['id', 'appointmentDate', 'status'],
                            include: [
                                { model: Service, attributes: ['id', 'name'] },
                            ],
                        },
                        { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                    ],
                });
            } else if (req.user.role === 'employee') {
                feedbacks = await Feedback.findAll({
                    where: { employeeId: req.user.employeeId },
                    include: [
                        {
                            model: Appointment,
                            attributes: ['id', 'appointmentDate', 'status'],
                            include: [
                                { model: Service, attributes: ['id', 'name'] },
                            ],
                        },
                        { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                        // Можно включить Employee, но именно этот employeeId нам уже известен
                    ],
                });
            } else if (req.user.role === 'customer') {
                feedbacks = await Feedback.findAll({
                    include: [
                        {
                            model: Appointment,
                            attributes: ['id', 'appointmentDate', 'status'],
                            include: [
                                { model: Service, attributes: ['id', 'name'] },
                            ],
                        },
                        { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                    ],
                });
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для просмотра отзывов' });
            }

            res.json(feedbacks);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение отзыва по ID
    // Администраторы: любой отзыв
    // Сотрудники: отзывы по своим записям
    // Клиенты: свои отзывы
    async findOne(req, res) {
        try {
            const feedbackId = req.params.id;
            const feedback = await Feedback.findByPk(feedbackId, {
                include: [
                    { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                    { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                    { model: Appointment, attributes: ['id', 'appointmentDate', 'status'] },
                    { model: Service, attributes: ['id', 'name'] },
                ],
            });

            if (!feedback) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            // Проверка доступа
            if (req.user.role === 'customer' && feedback.customerId !== req.user.customerId) {
                return res.status(403).json({ message: 'Нет доступа к этому отзыву' });
            }

            if (req.user.role === 'employee' && feedback.employeeId !== req.user.employeeId) {
                return res.status(403).json({ message: 'Нет доступа к этому отзыву' });
            }

            res.json(feedback);
        } catch (error) {
            console.error('Ошибка при получении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление отзыва
    // Администраторы: могут обновлять любой отзыв
    // Клиенты: могут обновлять свои отзывы, если они не были изменены администратором
    async update(req, res) {
        try {
            const feedbackId = req.params.id;
            const { rating, comment } = req.body;

            const feedback = await Feedback.findByPk(feedbackId);
            if (!feedback) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            // Проверка доступа
            if (req.user.role === 'customer') {
                if (feedback.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к этому отзыву' });
                }
            } else if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав для обновления отзыва' });
            }

            // Обновление полей при наличии в запросе
            if (rating !== undefined) {
                if (rating < 1 || rating > 5) {
                    return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
                }
                feedback.rating = rating;
            }

            if (comment !== undefined) {
                feedback.comment = comment;
            }

            await feedback.save();

            res.json({
                id: feedback.id,
                rating: feedback.rating,
                comment: feedback.comment,
                appointmentId: feedback.appointmentId,
                customerId: feedback.customerId,
                employeeId: feedback.employeeId,
                createdAt: feedback.createdAt,
                updatedAt: feedback.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление отзыва
    // Администраторы: могут удалять любой отзыв
    // Клиенты: могут удалять свои отзывы
    async delete(req, res) {
        try {
            const feedbackId = req.params.id;
            const feedback = await Feedback.findByPk(feedbackId);

            if (!feedback) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            // Проверка доступа
            if (req.user.role === 'customer') {
                if (feedback.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к этому отзыву' });
                }
            } else if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав для удаления отзыва' });
            }

            await feedback.destroy();

            res.status(200).json({ message: 'Отзыв успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new FeedbackController();