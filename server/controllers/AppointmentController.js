// controllers/AppointmentController.js

const { Appointment, Customer, Employee, Service, Payment, Feedback } = require('../models/models');
const { Op } = require('sequelize');

class AppointmentController {
    // Создание новой записи (доступно клиентам и администраторам)
    async create(req, res) {
        try {
            const { appointmentDate, serviceId, employeeId } = req.body;
            const customerId = req.user.role === 'customer' ? req.user.customerId : req.body.customerId;

            if (!appointmentDate || !serviceId) {
                return res.status(400).json({ message: 'Необходимы дата записи и ID услуги' });
            }

            // Проверка существования услуги
            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }

            // Если указан сотрудник, проверяем его существование
            let employee = null;
            if (employeeId) {
                employee = await Employee.findByPk(employeeId);
                if (!employee) {
                    return res.status(404).json({ message: 'Сотрудник не найден' });
                }
            }

            const appointment = await Appointment.create({
                appointmentDate,
                serviceId,
                employeeId: employee ? employee.id : null,
                customerId: customerId || req.user.customerId,
            });

            res.status(201).json({
                id: appointment.id,
                appointmentDate: appointment.appointmentDate,
                status: appointment.status,
                serviceId: appointment.serviceId,
                employeeId: appointment.employeeId,
                customerId: appointment.customerId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании записи:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех записей (админ: все; клиент: свои; сотрудник: назначенные)
    async findAll(req, res) {
        try {
            let appointments;

            if (req.user.role === 'admin') {
                appointments = await Appointment.findAll({
                    include: [
                        { model: Customer, attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                        { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Service, attributes: ['id', 'name', 'price'] },
                        { model: Payment, attributes: ['id', 'amount', 'status'] },
                        // Подключаем отзывы
                        { model: Feedback },
                        { model: Payment }, // <-- добавляем сюда
                    ],
                });
            } else if (req.user.role === 'customer') {
                appointments = await Appointment.findAll({
                    where: { customerId: req.user.customerId },
                    include: [
                        { model: Service, attributes: ['id', 'name', 'price'] },
                        { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Payment, attributes: ['id', 'amount', 'status'] },
                        // Подключаем отзывы
                        { model: Feedback }, // <-- добавляем сюда
                    ],
                });
            } else if (req.user.role === 'employee') {
                appointments = await Appointment.findAll({
                    where: { employeeId: req.user.employeeId },
                    include: [
                        { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                        { model: Service, attributes: ['id', 'name', 'price'] },
                        { model: Payment, attributes: ['id', 'amount', 'status'] },
                        // Подключаем отзывы
                        { model: Feedback }, // <-- добавляем сюда
                    ],
                });
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для просмотра записей' });
            }

            res.json(appointments);
        } catch (error) {
            console.error('Ошибка при получении записей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение записи по ID (админ: любые; клиент: свои; сотрудник: назначенные)
    async findOne(req, res) {
        try {
            const appointmentId = req.params.id;
            const appointment = await Appointment.findByPk(appointmentId, {
                include: [
                    { model: Customer, attributes: ['id', 'firstName', 'lastName'] },
                    { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
                    { model: Service, attributes: ['id', 'name', 'price'] },
                    { model: Payment, attributes: ['id', 'amount', 'status'] },
                    // Подключаем отзывы
                    { model: Feedback }, // <-- добавляем сюда
                ],
            });

            if (!appointment) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            // Проверка доступа
            if (req.user.role === 'customer' && appointment.customerId !== req.user.customerId) {
                return res.status(403).json({ message: 'Нет доступа к этой записи' });
            }
            if (req.user.role === 'employee' && appointment.employeeId !== req.user.employeeId) {
                return res.status(403).json({ message: 'Нет доступа к этой записи' });
            }

            res.json(appointment);
        } catch (error) {
            console.error('Ошибка при получении записи:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление записи (админ: любые; клиент: свои, если статус 'Scheduled'; сотрудник: обновление статуса)
    async update(req, res) {
        try {
            const appointmentId = req.params.id;
            const { appointmentDate, serviceId, employeeId, status } = req.body;

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            // Проверка доступа
            if (req.user.role === 'customer') {
                if (appointment.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к этой записи' });
                }
                if (appointment.status !== 'Scheduled') {
                    return res.status(400).json({ message: 'Нельзя изменить запись с текущим статусом' });
                }
            } else if (req.user.role === 'employee') {
                if (appointment.employeeId !== req.user.employeeId) {
                    return res.status(403).json({ message: 'Нет доступа к этой записи' });
                }
                // Сотрудники могут обновлять только статус
                if (!status) {
                    return res.status(400).json({ message: 'Только статус может быть обновлен сотрудником' });
                }
                if (!['In Progress', 'Completed', 'Cancelled'].includes(status)) {
                    return res.status(400).json({ message: 'Неверный статус' });
                }
                appointment.status = status;
                await appointment.save();
                return res.json({
                    id: appointment.id,
                    appointmentDate: appointment.appointmentDate,
                    status: appointment.status,
                    serviceId: appointment.serviceId,
                    employeeId: appointment.employeeId,
                    customerId: appointment.customerId,
                    updatedAt: appointment.updatedAt,
                });
            } else if (req.user.role === 'admin') {
                // Администраторы могут обновлять любые поля
                if (serviceId) {
                    const service = await Service.findByPk(serviceId);
                    if (!service) {
                        return res.status(404).json({ message: 'Услуга не найдена' });
                    }
                    appointment.serviceId = serviceId;
                }
                if (employeeId) {
                    const employee = await Employee.findByPk(employeeId);
                    if (!employee) {
                        return res.status(404).json({ message: 'Сотрудник не найден' });
                    }
                    appointment.employeeId = employeeId;
                }
                if (appointmentDate) {
                    appointment.appointmentDate = appointmentDate;
                }
                if (status) {
                    if (!['Scheduled', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
                        return res.status(400).json({ message: 'Неверный статус' });
                    }
                    appointment.status = status;
                }
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для обновления записи' });
            }

            // Клиенты могут обновлять только дату, услугу и сотрудника (если требуется)
            if (req.user.role === 'customer') {
                if (appointmentDate) appointment.appointmentDate = appointmentDate;
                if (serviceId) appointment.serviceId = serviceId;
                if (employeeId !== undefined) appointment.employeeId = employeeId; // Может быть null
            }

            await appointment.save();

            res.json({
                id: appointment.id,
                appointmentDate: appointment.appointmentDate,
                status: appointment.status,
                serviceId: appointment.serviceId,
                employeeId: appointment.employeeId,
                customerId: appointment.customerId,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении записи:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление записи (админ: любые; клиент: свои, если статус 'Scheduled')
    async delete(req, res) {
        try {
            const appointmentId = req.params.id;
            const appointment = await Appointment.findByPk(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            // Проверка доступа
            if (req.user.role === 'customer') {
                if (appointment.customerId !== req.user.customerId) {
                    return res.status(403).json({ message: 'Нет доступа к этой записи' });
                }
                if (appointment.status !== 'Scheduled') {
                    return res.status(400).json({ message: 'Нельзя отменить запись с текущим статусом' });
                }
            } else if (req.user.role === 'admin') {
                // Администраторы могут удалять любые записи
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для удаления записи' });
            }

            await appointment.destroy();

            res.status(200).json({ message: 'Запись успешно удалена' });
        } catch (error) {
            console.error('Ошибка при удалении записи:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение доступных сотрудников для назначения (администраторы и клиенты)
    async getAvailableEmployees(req, res) {
        try {
            const { appointmentDate, serviceId } = req.query;

            if (!appointmentDate || !serviceId) {
                return res.status(400).json({ message: 'Необходимы дата записи и ID услуги' });
            }

            // Получаем услугу, чтобы знать её длительность
            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }

            // Преобразуем appointmentDate в Date объект
            const appointmentDateObj = new Date(appointmentDate);
            if (isNaN(appointmentDateObj)) {
                return res.status(400).json({ message: 'Неверный формат даты' });
            }

            // Вычисляем конец записи
            const endDateObj = new Date(appointmentDateObj.getTime() + service.duration * 60000);

            // Находим сотрудников, у которых нет других записей в этот период
            const employees = await Employee.findAll({
                include: [{
                    model: Appointment,
                    required: false,
                    where: {
                        appointmentDate: {
                            [Op.lt]: endDateObj,
                        },
                        [Op.and]: [
                            { appointmentDate: { [Op.gte]: appointmentDateObj } },
                        ],
                        status: {
                            [Op.notIn]: ['Cancelled'],
                        },
                    },
                }],
            });

            // Фильтруем сотрудников, у которых нет конфликтующих записей
            const availableEmployees = employees.filter(employee => employee.Appointments.length === 0);

            res.json(availableEmployees);
        } catch (error) {
            console.error('Ошибка при получении доступных сотрудников:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new AppointmentController();