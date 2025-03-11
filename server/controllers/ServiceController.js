// controllers/ServiceController.js
const { Service } = require('../models/models');
const path = require('path');
const fs = require('fs');

class ServiceController {
    // Создание новой услуги (доступно только администраторам)
    async create(req, res) {
        try {
            const { name, description, price, duration } = req.body;
            let photoPath = null;

            if (!name || !price || !duration) {
                return res.status(400).json({ message: 'Необходимы название, цена и продолжительность услуги' });
            }

            const existingService = await Service.findOne({ where: { name } });
            if (existingService) {
                return res.status(400).json({ message: 'Услуга с таким названием уже существует' });
            }

            if (req.file) {
                // Сохранение пути к изображению
                photoPath = `/uploads/${req.file.filename}`;
            }

            const service = await Service.create({
                name,
                description,
                price,
                duration,
                photo: photoPath,
            });

            res.status(201).json({
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration,
                photo: service.photo,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при создании услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех услуг (доступно всем аутентифицированным пользователям)
    async findAll(req, res) {
        try {
            const services = await Service.findAll({
                attributes: ['id', 'name', 'description', 'price', 'duration', 'photo', 'createdAt', 'updatedAt'],
            });
            res.json(services);
        } catch (error) {
            console.error('Ошибка при получении списка услуг:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение услуги по ID (доступно всем аутентифицированным пользователям)
    async findOne(req, res) {
        try {
            const service = await Service.findByPk(req.params.id, {
                attributes: ['id', 'name', 'description', 'price', 'duration', 'photo', 'createdAt', 'updatedAt'],
            });
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }
            res.json(service);
        } catch (error) {
            console.error('Ошибка при получении услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление услуги (доступно только администраторам)
    async update(req, res) {
        try {
            const { name, description, price, duration } = req.body;
            const serviceId = req.params.id;

            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }

            // Проверка уникальности названия, если оно обновляется
            if (name && name !== service.name) {
                const existingService = await Service.findOne({ where: { name } });
                if (existingService) {
                    return res.status(400).json({ message: 'Услуга с таким названием уже существует' });
                }
            }

            // Обновление полей при наличии в запросе
            if (name) service.name = name;
            if (description) service.description = description;
            if (price) service.price = price;
            if (duration) service.duration = duration;

            if (req.file) {
                // Удаление старого файла, если он существует
                if (service.photo) {
                    const oldPhotoPath = path.join(__dirname, '..', service.photo);
                    fs.unlink(oldPhotoPath, (err) => {
                        if (err) {
                            console.error('Ошибка при удалении старого фото:', err);
                        }
                    });
                }
                // Сохранение пути к новому изображению
                service.photo = `/uploads/${req.file.filename}`;
            }

            await service.save();

            res.json({
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration,
                photo: service.photo,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
            });
        } catch (error) {
            console.error('Ошибка при обновлении услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление услуги (доступно только администраторам)
    async delete(req, res) {
        try {
            const serviceId = req.params.id;

            const service = await Service.findByPk(serviceId);
            if (!service) {
                return res.status(404).json({ message: 'Услуга не найдена' });
            }

            // Удаление файла фотографии, если он существует
            if (service.photo) {
                const photoPath = path.join(__dirname, '..', service.photo);
                fs.unlink(photoPath, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении фото:', err);
                    }
                });
            }

            await service.destroy();

            res.status(200).json({ message: 'Услуга успешно удалена' });
        } catch (error) {
            console.error('Ошибка при удалении услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ServiceController();
