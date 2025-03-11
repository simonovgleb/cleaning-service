// controllers/ScheduleController.js

const { Schedule, Employee } = require('../models/models');

class ScheduleController {
    // Создание нового расписания (доступно только администраторам)
    async create(req, res) {
        try {
            const { dayOfWeek, startTime, endTime, employeeId } = req.body;

            // Проверка наличия обязательных полей
            if (dayOfWeek === undefined || !startTime || !endTime || !employeeId) {
                return res.status(400).json({ message: 'Необходимы день недели, время начала, время окончания и ID сотрудника' });
            }

            // Проверка корректности дня недели
            if (dayOfWeek < 0 || dayOfWeek > 6) {
                return res.status(400).json({ message: 'День недели должен быть от 0 (Воскресенье) до 6 (Суббота)' });
            }

            // Проверка, что время начала меньше времени окончания
            if (startTime >= endTime) {
                return res.status(400).json({ message: 'Время начала должно быть раньше времени окончания' });
            }

            // Проверка существования сотрудника
            const employee = await Employee.findByPk(employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            // Создание расписания
            const schedule = await Schedule.create({
                dayOfWeek,
                startTime,
                endTime,
                employeeId,
            });

            res.status(201).json({
                id: schedule.id,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                employeeId: schedule.employeeId,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании расписания:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех расписаний (админ: все; сотрудник: свои)
    async findAll(req, res) {
        try {
            let schedules;

            if (req.user.role === 'admin') {
                schedules = await Schedule.findAll({
                    include: [{
                        model: Employee,
                        attributes: ['id', 'firstName', 'lastName'],
                    }],
                });
            } else if (req.user.role === 'employee') {
                schedules = await Schedule.findAll({
                    where: { employeeId: req.user.employeeId },
                    include: [{
                        model: Employee,
                        attributes: ['id', 'firstName', 'lastName'],
                    }],
                });
            } else {
                return res.status(403).json({ message: 'Недостаточно прав для просмотра расписаний' });
            }

            res.json(schedules);
        } catch (error) {
            console.error('Ошибка при получении расписаний:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение расписания по ID (админ: любое; сотрудник: свое)
    async findOne(req, res) {
        try {
            const scheduleId = req.params.id;
            const schedule = await Schedule.findByPk(scheduleId, {
                include: [{
                    model: Employee,
                    attributes: ['id', 'firstName', 'lastName'],
                }],
            });

            if (!schedule) {
                return res.status(404).json({ message: 'Расписание не найдено' });
            }

            // Проверка доступа
            if (req.user.role === 'employee' && schedule.employeeId !== req.user.employeeId) {
                return res.status(403).json({ message: 'Нет доступа к этому расписанию' });
            }

            res.json(schedule);
        } catch (error) {
            console.error('Ошибка при получении расписания:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление расписания (админ: любое; сотрудник: свое)
    async update(req, res) {
        try {
            const scheduleId = req.params.id;
            const { dayOfWeek, startTime, endTime, employeeId } = req.body;

            const schedule = await Schedule.findByPk(scheduleId);
            if (!schedule) {
                return res.status(404).json({ message: 'Расписание не найдено' });
            }

            // Проверка доступа
            if (req.user.role === 'employee' && schedule.employeeId !== req.user.employeeId) {
                return res.status(403).json({ message: 'Нет доступа к этому расписанию' });
            }

            // Администраторы могут обновлять любое поле
            if (req.user.role === 'admin') {
                if (dayOfWeek !== undefined) {
                    if (dayOfWeek < 0 || dayOfWeek > 6) {
                        return res.status(400).json({ message: 'День недели должен быть от 0 (Воскресенье) до 6 (Суббота)' });
                    }
                    schedule.dayOfWeek = dayOfWeek;
                }

                if (startTime) {
                    schedule.startTime = startTime;
                }

                if (endTime) {
                    schedule.endTime = endTime;
                }

                if (employeeId) {
                    const employee = await Employee.findByPk(employeeId);
                    if (!employee) {
                        return res.status(404).json({ message: 'Сотрудник не найден' });
                    }
                    schedule.employeeId = employeeId;
                }
            }

            // Сотрудники могут обновлять только свои расписания и только определенные поля
            if (req.user.role === 'employee') {
                if (dayOfWeek !== undefined) {
                    if (dayOfWeek < 0 || dayOfWeek > 6) {
                        return res.status(400).json({ message: 'День недели должен быть от 0 (Воскресенье) до 6 (Суббота)' });
                    }
                    schedule.dayOfWeek = dayOfWeek;
                }

                if (startTime) {
                    schedule.startTime = startTime;
                }

                if (endTime) {
                    schedule.endTime = endTime;
                }

                // Сотрудники не могут менять employeeId
                if (employeeId && employeeId !== schedule.employeeId) {
                    return res.status(403).json({ message: 'Сотрудники не могут менять назначенного сотрудника' });
                }
            }

            // Проверка, что время начала меньше времени окончания
            if (schedule.startTime >= schedule.endTime) {
                return res.status(400).json({ message: 'Время начала должно быть раньше времени окончания' });
            }

            await schedule.save();

            res.json({
                id: schedule.id,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                employeeId: schedule.employeeId,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении расписания:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление расписания (доступно только администраторам)
    async delete(req, res) {
        try {
            const scheduleId = req.params.id;
            const schedule = await Schedule.findByPk(scheduleId);

            if (!schedule) {
                return res.status(404).json({ message: 'Расписание не найдено' });
            }

            // Проверка роли пользователя
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Нет прав для удаления расписаний' });
            }

            await schedule.destroy();

            res.status(200).json({ message: 'Расписание успешно удалено' });
        } catch (error) {
            console.error('Ошибка при удалении расписания:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ScheduleController();
