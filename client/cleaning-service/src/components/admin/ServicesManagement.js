// src/components/ServicesManagement.js

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

// React Icons
import {
    FaFileExcel,
    FaFileWord,
    FaPlusCircle,
    FaEdit,
    FaTrash
} from 'react-icons/fa';

// Для экспорта в Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Для экспорта в Word
import {
    Document,
    Packer,
    Paragraph,
    Table as DocxTable,
    TableRow,
    TableCell,
    WidthType,
    TextRun
} from 'docx';

// Bootstrap
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

// Стили «для вау-эффекта»
const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #ffecd2, #fcb69f)',
    padding: '40px 20px'
};

const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '30px'
};

const ServicesManagement = () => {
    // ------------------------------
    // Состояния
    // ------------------------------
    const [serviceData, setServiceData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        photo: null
    });

    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);

    const [sortConfigServices, setSortConfigServices] = useState({
        key: null,
        direction: 'asc'
    });
    const [filterQueryServices, setFilterQueryServices] = useState('');

    // Модальное окно редактирования
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [editServiceData, setEditServiceData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        photo: null
    });
    const [editServicePhotoPreview, setEditServicePhotoPreview] = useState(null);

    // Превью фото при создании
    const [newServicePhotoPreview, setNewServicePhotoPreview] = useState(null);

    // ------------------------------
    // Загрузка списка услуг
    // ------------------------------
    const fetchServices = async () => {
        setLoadingServices(true);
        try {
            const response = await axiosInstance.get('/services');
            setServices(response.data);
            setFilteredServices(response.data);
        } catch (error) {
            toast.error('Ошибка загрузки услуг');
            console.error(error);
        } finally {
            setLoadingServices(false);
        }
    };

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line
    }, []);

    // ------------------------------
    // Форма создания услуги
    // ------------------------------
    const handleServiceChange = (e) => {
        const { name, value } = e.target;
        setServiceData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewServicePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setServiceData((prev) => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewServicePhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setServiceData((prev) => ({ ...prev, photo: null }));
            setNewServicePhotoPreview(null);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        const { name, price, description, duration, photo } = serviceData;
        const errors = [];

        // Валидация
        if (!name || name.length < 2 || name.length > 100) {
            errors.push('Название должно быть длиной от 2 до 100 символов.');
        }
        if (!price || isNaN(price) || Number(price) < 0) {
            errors.push('Цена должна быть числом и не менее 0.');
        }
        if (!duration || isNaN(duration) || Number(duration) < 15) {
            errors.push('Продолжительность должна быть числом и не менее 15 минут.');
        }
        if (photo && !/\.(jpg|jpeg|png|gif)$/i.test(photo.name)) {
            errors.push('Файл фотографии должен быть изображением (jpg, jpeg, png, gif).');
        }

        if (errors.length > 0) {
            errors.forEach((error) => toast.error(error));
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('price', parseFloat(price));
            formData.append('description', description.trim());
            formData.append('duration', parseInt(duration, 10));
            if (photo) {
                formData.append('photo', photo);
            }

            await axiosInstance.post('/services', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Услуга успешно добавлена!');
            fetchServices();
            // Сброс формы
            setServiceData({
                name: '',
                description: '',
                price: '',
                duration: '',
                photo: null
            });
            setNewServicePhotoPreview(null);
        } catch (error) {
            const message = error.response?.data?.message || 'Произошла ошибка при добавлении услуги.';
            toast.error(`Ошибка: ${message}`);
            console.error('Ошибка при добавлении услуги:', error);
        }
    };

    // ------------------------------
    // Удаление услуги
    // ------------------------------
    const handleServiceDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту услугу?')) return;
        try {
            await axiosInstance.delete(`/services/${id}`);
            toast.success('Услуга успешно удалена.');
            fetchServices();
        } catch (error) {
            const message = error.response?.data?.message || 'Произошла ошибка при удалении услуги.';
            toast.error(`Ошибка: ${message}`);
            console.error('Ошибка при удалении услуги:', error);
        }
    };

    // ------------------------------
    // Сортировка
    // ------------------------------
    const requestSortServices = (key) => {
        let direction = 'asc';
        if (sortConfigServices.key === key && sortConfigServices.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfigServices({ key, direction });
    };

    const sortedServices = useMemo(() => {
        let sortableServices = [...filteredServices];
        if (sortConfigServices.key) {
            sortableServices.sort((a, b) => {
                const aValue = a[sortConfigServices.key];
                const bValue = b[sortConfigServices.key];
                if (aValue < bValue) {
                    return sortConfigServices.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfigServices.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableServices;
    }, [filteredServices, sortConfigServices]);

    // ------------------------------
    // Фильтр
    // ------------------------------
    const handleFilterChangeServices = (e) => {
        const query = e.target.value.toLowerCase();
        setFilterQueryServices(query);

        const filtered = services.filter((service) => {
            const nameMatch = service.name.toLowerCase().includes(query);
            const descMatch = service.description && service.description.toLowerCase().includes(query);
            return nameMatch || descMatch;
        });
        setFilteredServices(filtered);
    };

    // ------------------------------
    // Редактирование услуги (модалка)
    // ------------------------------
    const handleShowEditModal = (service) => {
        setCurrentService(service);
        setEditServiceData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            duration: service.duration,
            photo: null
        });
        setEditServicePhotoPreview(
            service.photo ? `${axiosInstance.defaults.baseURL}${service.photo}` : null
        );
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setCurrentService(null);
        setEditServiceData({
            name: '',
            description: '',
            price: '',
            duration: '',
            photo: null
        });
        setEditServicePhotoPreview(null);
    };

    const handleEditServiceChange = (e) => {
        const { name, value } = e.target;
        setEditServiceData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditServicePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditServiceData((prev) => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditServicePhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setEditServiceData((prev) => ({ ...prev, photo: null }));
            setEditServicePhotoPreview(
                currentService.photo ? `${axiosInstance.defaults.baseURL}${currentService.photo}` : null
            );
        }
    };

    const handleEditServiceSubmit = async (e) => {
        e.preventDefault();
        const { name, price, description, duration, photo } = editServiceData;
        const errors = [];

        if (!name || name.length < 2 || name.length > 100) {
            errors.push('Название должно быть длиной от 2 до 100 символов.');
        }
        if (!price || isNaN(price) || Number(price) < 0) {
            errors.push('Цена должна быть числом и не менее 0.');
        }
        if (!duration || isNaN(duration) || Number(duration) < 15) {
            errors.push('Продолжительность должна быть числом и не менее 15 минут.');
        }
        if (photo && !/\.(jpg|jpeg|png|gif)$/i.test(photo.name)) {
            errors.push('Файл фотографии должен быть изображением (jpg, jpeg, png, gif).');
        }

        if (errors.length > 0) {
            errors.forEach((error) => toast.error(error));
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('price', parseFloat(price));
            formData.append('description', description.trim());
            formData.append('duration', parseInt(duration, 10));
            if (photo) {
                formData.append('photo', photo);
            }

            await axiosInstance.put(`/services/${currentService.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Услуга успешно обновлена!');
            fetchServices();
            handleCloseEditModal();
        } catch (error) {
            const message = error.response?.data?.message || 'Произошла ошибка при обновлении услуги.';
            toast.error(`Ошибка: ${message}`);
            console.error('Ошибка при обновлении услуги:', error);
        }
    };

    // ------------------------------
    // Экспорт в Excel
    // ------------------------------
    const handleExportExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                sortedServices.map((srv) => ({
                    ID: srv.id,
                    Название: srv.name,
                    Цена: srv.price,
                    Длительность: srv.duration,
                    Описание: srv.description || '',
                    Фото: srv.photo || ''
                }))
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
            saveAs(data, 'services_report.xlsx');
            toast.success('Отчёт в Excel сформирован!');
        } catch (error) {
            toast.error('Ошибка при экспорте в Excel');
            console.error('Excel export error:', error);
        }
    };

    // ------------------------------
    // Экспорт в Word
    // ------------------------------
    const handleExportWord = async () => {
        try {
            const tableRows = [];

            // Шапка
            const headerRow = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: 'ID', bold: true })],
                        width: { size: 1000, type: WidthType.DXA }
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: 'Название', bold: true })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: 'Цена', bold: true })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: 'Длительность', bold: true })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: 'Описание', bold: true })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: 'Фото', bold: true })]
                    })
                ]
            });
            tableRows.push(headerRow);

            // Данные
            sortedServices.forEach((srv) => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph(String(srv.id))]
                            }),
                            new TableCell({
                                children: [new Paragraph(srv.name || '')]
                            }),
                            new TableCell({
                                children: [new Paragraph(String(srv.price))]
                            }),
                            new TableCell({
                                children: [new Paragraph(String(srv.duration))]
                            }),
                            new TableCell({
                                children: [new Paragraph(srv.description || '')]
                            }),
                            new TableCell({
                                children: [new Paragraph(srv.photo || '')]
                            })
                        ]
                    })
                );
            });

            const docTable = new DocxTable({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE }
            });

            const doc = new Document({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'Отчёт по услугам',
                                        bold: true,
                                        size: 28
                                    })
                                ]
                            }),
                            new Paragraph({ text: '' }),
                            docTable
                        ]
                    }
                ]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, 'services_report.docx');
            toast.success('Отчёт в Word сформирован!');
        } catch (error) {
            toast.error('Ошибка при экспорте в Word');
            console.error('Word export error:', error);
        }
    };

    // ------------------------------
    // Рендер
    // ------------------------------
    return (
        <div style={containerStyle}>
            <div className="container">
                <div style={cardStyle}>
                    <h3 className="fw-bold mb-4">Управление услугами</h3>

                    {/* --- Форма добавления услуги --- */}
                    <div className="p-3 mb-4" style={{ backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                            <FaPlusCircle />
                            Добавить новую услугу
                        </h5>
                        <Form onSubmit={handleServiceSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <Form.Label>Название</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={serviceData.name}
                                        onChange={handleServiceChange}
                                        minLength={2}
                                        maxLength={100}
                                        required
                                    />
                                    <Form.Text className="text-muted">От 2 до 100 символов.</Form.Text>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Form.Label>Цена</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={serviceData.price}
                                        onChange={handleServiceChange}
                                        min="0"
                                        required
                                    />
                                    <Form.Text className="text-muted">Минимум 0.</Form.Text>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Описание</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={serviceData.description}
                                    onChange={handleServiceChange}
                                />
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <Form.Label>Продолжительность (минуты)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duration"
                                        value={serviceData.duration}
                                        onChange={handleServiceChange}
                                        min="15"
                                        required
                                    />
                                    <Form.Text className="text-muted">Минимум 15 минут.</Form.Text>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Form.Label>Фотография</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleNewServicePhotoChange}
                                    />
                                    <Form.Text className="text-muted">
                                        Загрузите изображение (jpg, jpeg, png, gif).
                                    </Form.Text>
                                </div>
                            </div>

                            {newServicePhotoPreview && (
                                <div className="mb-3">
                                    <img
                                        src={newServicePhotoPreview}
                                        alt="Preview"
                                        className="img-thumbnail"
                                        width="150"
                                    />
                                </div>
                            )}

                            <Button type="submit" variant="success" className="fw-bold">
                                Добавить услугу
                            </Button>
                        </Form>
                    </div>

                    {/* --- Кнопки экспорта + фильтр --- */}
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <div className="d-flex gap-2">
                            <Button variant="outline-success" onClick={handleExportExcel} className="d-flex align-items-center gap-2">
                                <FaFileExcel />
                                Экспорт в Excel
                            </Button>
                            <Button variant="outline-secondary" onClick={handleExportWord} className="d-flex align-items-center gap-2">
                                <FaFileWord />
                                Экспорт в Word
                            </Button>
                        </div>
                        <div className="ms-auto" style={{ minWidth: '300px' }}>
                            <Form.Control
                                type="text"
                                placeholder="Фильтр по названию или описанию"
                                value={filterQueryServices}
                                onChange={handleFilterChangeServices}
                            />
                        </div>
                    </div>

                    {/* --- Список услуг --- */}
                    {loadingServices ? (
                        <div className="d-flex justify-content-center my-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => requestSortServices('id')}
                                        >
                                            ID
                                            {sortConfigServices.key === 'id'
                                                ? sortConfigServices.direction === 'asc'
                                                    ? ' ▲'
                                                    : ' ▼'
                                                : ''}
                                        </th>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => requestSortServices('name')}
                                        >
                                            Название
                                            {sortConfigServices.key === 'name'
                                                ? sortConfigServices.direction === 'asc'
                                                    ? ' ▲'
                                                    : ' ▼'
                                                : ''}
                                        </th>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => requestSortServices('price')}
                                        >
                                            Цена
                                            {sortConfigServices.key === 'price'
                                                ? sortConfigServices.direction === 'asc'
                                                    ? ' ▲'
                                                    : ' ▼'
                                                : ''}
                                        </th>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => requestSortServices('duration')}
                                        >
                                            Продолж.
                                            {sortConfigServices.key === 'duration'
                                                ? sortConfigServices.direction === 'asc'
                                                    ? ' ▲'
                                                    : ' ▼'
                                                : ''}
                                        </th>
                                        <th>Описание</th>
                                        <th>Фото</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedServices.length > 0 ? (
                                        sortedServices.map((service) => (
                                            <tr key={service.id}>
                                                <td>{service.id}</td>
                                                <td>{service.name}</td>
                                                <td>{Number(service.price).toFixed(2)} ₽</td>
                                                <td>{service.duration}</td>
                                                <td>{service.description || '-'}</td>
                                                <td>
                                                    {service.photo ? (
                                                        <img
                                                            src={`${axiosInstance.defaults.baseURL}${service.photo}`}
                                                            alt={service.name}
                                                            width="80"
                                                            style={{ borderRadius: '5px' }}
                                                        />
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="me-2 d-flex align-items-center gap-1"
                                                        onClick={() => handleShowEditModal(service)}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1"
                                                        onClick={() => handleServiceDelete(service.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                Услуги не найдены.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Модальное окно редактирования --- */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Form onSubmit={handleEditServiceSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Редактировать услугу</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={editServiceData.name}
                                onChange={handleEditServiceChange}
                                minLength={2}
                                maxLength={100}
                                required
                            />
                            <Form.Text className="text-muted">От 2 до 100 символов.</Form.Text>
                        </div>
                        <div className="mb-3">
                            <Form.Label>Цена</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="price"
                                value={editServiceData.price}
                                onChange={handleEditServiceChange}
                                min="0"
                                required
                            />
                            <Form.Text className="text-muted">Минимум 0.</Form.Text>
                        </div>
                        <div className="mb-3">
                            <Form.Label>Продолжительность (минуты)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duration"
                                value={editServiceData.duration}
                                onChange={handleEditServiceChange}
                                min="15"
                                required
                            />
                            <Form.Text className="text-muted">Минимум 15 минут.</Form.Text>
                        </div>
                        <div className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={editServiceData.description}
                                onChange={handleEditServiceChange}
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label>Новое Фото</Form.Label>
                            <Form.Control
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleEditServicePhotoChange}
                            />
                            <Form.Text className="text-muted">
                                Загрузите новое изображение (jpg, jpeg, png, gif), чтобы заменить существующее.
                            </Form.Text>
                        </div>
                        {editServicePhotoPreview && (
                            <div className="mb-3">
                                <img
                                    src={editServicePhotoPreview}
                                    alt="Preview"
                                    className="img-thumbnail"
                                    width="150"
                                />
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Сохранить изменения
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ServicesManagement;