// src/components/EmployeesManagement.js

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

// React Icons
import {
    FaFileExcel,
    FaFileWord,
    FaUserPlus,
    FaEdit,
    FaTrash
} from 'react-icons/fa';

// Для Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Для Word
import {
    Document,
    Packer,
    Paragraph,
    Table as DocxTable,
    TableRow,
    TableCell,
    WidthType,
    TextRun,
} from 'docx';

// Bootstrap
import {
    Modal,
    Button,
    Form,
    Spinner
} from 'react-bootstrap';

const EmployeesManagement = () => {
    // Состояние для добавления сотрудника
    const [employeeData, setEmployeeData] = useState({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        role: 'Employee',
    });

    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Состояния для сортировки
    const [sortConfigEmployees, setSortConfigEmployees] = useState({ key: null, direction: 'asc' });

    // Состояние для фильтра
    const [filterQueryEmployees, setFilterQueryEmployees] = useState('');

    // Модалка редактирования
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [editEmployeeData, setEditEmployeeData] = useState({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        role: 'Employee',
    });

    // ======================
    // Загрузка сотрудников
    // ======================
    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        try {
            const response = await axiosInstance.get('/employees');
            setEmployees(response.data);
            setFilteredEmployees(response.data);
        } catch (error) {
            toast.error('Ошибка загрузки сотрудников');
            console.error(error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        // eslint-disable-next-line
    }, []);

    // ======================
    // Обработка формы добавления сотрудника
    // ======================
    const handleEmployeeChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();

        const { login, password, firstName, lastName, phoneNumber, role } = employeeData;
        const errors = [];

        // Валидация
        if (!login || login.length < 5 || login.length > 50) {
            errors.push('Логин должен быть от 5 до 50 символов.');
        }
        if (!password || password.length < 8) {
            errors.push('Пароль должен быть не менее 8 символов.');
        }
        if (!firstName || firstName.length < 2 || firstName.length > 50) {
            errors.push('Имя должно быть от 2 до 50 символов.');
        }
        if (!lastName || lastName.length < 2 || lastName.length > 50) {
            errors.push('Фамилия должна быть от 2 до 50 символов.');
        }
        if (phoneNumber && !/^[0-9\-+() ]+$/.test(phoneNumber)) {
            errors.push('Телефон содержит недопустимые символы.');
        }
        if (!role) {
            errors.push('Роль должна быть выбрана.');
        }

        if (errors.length > 0) {
            errors.forEach((error) => toast.error(error));
            return;
        }

        try {
            // POST /employees
            await axiosInstance.post('/employees', employeeData);
            toast.success('Сотрудник успешно добавлен!');
            fetchEmployees(); // обновляем список
            // Сброс формы
            setEmployeeData({
                login: '',
                password: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                role: 'Employee',
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка при добавлении сотрудника.';
            toast.error(`Ошибка: ${message}`);
            console.error('Ошибка при добавлении сотрудника:', error);
        }
    };

    // ======================
    // Удаление сотрудника
    // ======================
    const handleEmployeeDelete = async (id) => {
        if (!window.confirm('Удалить сотрудника?')) return;
        try {
            await axiosInstance.delete(`/employees/${id}`);
            toast.success('Сотрудник успешно удалён.');
            fetchEmployees();
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка при удалении сотрудника.';
            toast.error(`Ошибка: ${message}`);
            console.error('Ошибка при удалении сотрудника:', error);
        }
    };

    // ======================
    // Сортировка
    // ======================
    const requestSortEmployees = (key) => {
        let direction = 'asc';
        if (sortConfigEmployees.key === key && sortConfigEmployees.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfigEmployees({ key, direction });
    };

    const sortedEmployees = useMemo(() => {
        let sortable = [...filteredEmployees];
        if (sortConfigEmployees.key) {
            sortable.sort((a, b) => {
                const aValue = a[sortConfigEmployees.key];
                const bValue = b[sortConfigEmployees.key];
                if (aValue < bValue) {
                    return sortConfigEmployees.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfigEmployees.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortable;
    }, [filteredEmployees, sortConfigEmployees]);

    // ======================
    // Фильтр
    // ======================
    const handleFilterChangeEmployees = (e) => {
        const query = e.target.value.toLowerCase();
        setFilterQueryEmployees(query);

        const filtered = employees.filter((emp) => {
            const loginMatch = emp.login.toLowerCase().includes(query);
            const firstNameMatch = emp.firstName.toLowerCase().includes(query);
            const lastNameMatch = emp.lastName.toLowerCase().includes(query);
            return loginMatch || firstNameMatch || lastNameMatch;
        });
        setFilteredEmployees(filtered);
    };

    // ======================
    // Редактирование (модалка)
    // ======================
    const handleShowEditModal = (employee) => {
        setCurrentEmployee(employee);
        setEditEmployeeData({
            login: employee.login,
            password: '',
            firstName: employee.firstName,
            lastName: employee.lastName,
            phoneNumber: employee.phoneNumber,
            address: employee.address,
            role: employee.role,
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setCurrentEmployee(null);
    };

    const handleEditEmployeeChange = (e) => {
        const { name, value } = e.target;
        setEditEmployeeData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditEmployeeSubmit = async (e) => {
        e.preventDefault();

        const { login, password, firstName, lastName, phoneNumber, role } = editEmployeeData;
        const errors = [];

        // Валидация
        if (!login || login.length < 5 || login.length > 50) {
            errors.push('Логин: от 5 до 50 символов.');
        }
        if (password && password.length < 8) {
            errors.push('Пароль должен быть не менее 8 символов (или оставьте пустым).');
        }
        if (!firstName || firstName.length < 2 || firstName.length > 50) {
            errors.push('Имя: от 2 до 50 символов.');
        }
        if (!lastName || lastName.length < 2 || lastName.length > 50) {
            errors.push('Фамилия: от 2 до 50 символов.');
        }
        if (phoneNumber && !/^[0-9\-+() ]+$/.test(phoneNumber)) {
            errors.push('Телефон содержит недопустимые символы.');
        }
        if (!role) {
            errors.push('Роль должна быть выбрана.');
        }

        if (errors.length > 0) {
            errors.forEach((error) => toast.error(error));
            return;
        }

        try {
            // Если пароль не указан - не отправляем
            const dataToUpdate = { ...editEmployeeData };
            if (!password) delete dataToUpdate.password;

            await axiosInstance.put(`/employees/${currentEmployee.id}`, dataToUpdate);
            toast.success('Сотрудник успешно обновлён!');
            fetchEmployees();
            handleCloseEditModal();
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка при обновлении сотрудника.';
            toast.error(`Ошибка: ${message}`);
            console.error('Ошибка при обновлении сотрудника:', error);
        }
    };

    // ===========================
    // Экспорт данных в Excel
    // ===========================
    const handleExportExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(sortedEmployees);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
            saveAs(data, 'employees_report.xlsx');
            toast.success('Отчёт в Excel успешно сформирован!');
        } catch (error) {
            toast.error('Ошибка при формировании отчёта Excel.');
            console.error('Excel export error:', error);
        }
    };

    // ===========================
    // Экспорт данных в Word
    // ===========================
    const handleExportWord = async () => {
        try {
            // Строим документ
            const tableRows = [];

            // Заголовок таблицы
            const headerRow = new TableRow({
                children: [
                    new TableCell({
                        width: { size: 2000, type: WidthType.DXA },
                        children: [new Paragraph({ text: 'ID', bold: true })],
                    }),
                    new TableCell({ children: [new Paragraph({ text: 'Логин', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Имя', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Фамилия', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Телефон', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Адрес', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Роль', bold: true })] }),
                ],
            });
            tableRows.push(headerRow);

            // Данные
            sortedEmployees.forEach((emp) => {
                const row = new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(String(emp.id))] }),
                        new TableCell({ children: [new Paragraph(emp.login || '')] }),
                        new TableCell({ children: [new Paragraph(emp.firstName || '')] }),
                        new TableCell({ children: [new Paragraph(emp.lastName || '')] }),
                        new TableCell({ children: [new Paragraph(emp.phoneNumber || '')] }),
                        new TableCell({ children: [new Paragraph(emp.address || '')] }),
                        new TableCell({ children: [new Paragraph(emp.role || '')] }),
                    ],
                });
                tableRows.push(row);
            });

            const docTable = new DocxTable({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
            });

            const doc = new Document({
                sections: [
                    {
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'Отчёт по сотрудникам',
                                        bold: true,
                                        size: 28,
                                    }),
                                ],
                            }),
                            new Paragraph({ text: '' }),
                            docTable,
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, 'employees_report.docx');
            toast.success('Отчёт в Word успешно сформирован!');
        } catch (error) {
            toast.error('Ошибка при формировании отчёта Word.');
            console.error('Word export error:', error);
        }
    };

    // ===========================
    // Стили для «ВАУ»-эффекта
    // ===========================
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(to right, #ffffff, #e2e2e2)',
        padding: '40px 20px',
    };

    const cardStyle = {
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        padding: '30px',
    };

    const tableStyle = {
        cursor: 'pointer',
    };

    return (
        <div style={containerStyle}>
            <div className="container">
                <div style={cardStyle}>
                    <h3 className="fw-bold mb-4">Управление Сотрудниками</h3>

                    {/* Форма добавления сотрудника */}
                    <div className="p-3 mb-4" style={{ backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                        <h5 className="mb-3 d-flex align-items-center gap-2">
                            <FaUserPlus />
                            Добавить нового сотрудника
                        </h5>
                        <form onSubmit={handleEmployeeSubmit} className="mb-4">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="login" className="form-label">
                                        Логин
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="login"
                                        name="login"
                                        value={employeeData.login}
                                        onChange={handleEmployeeChange}
                                        minLength="5"
                                        maxLength="50"
                                        required
                                    />
                                    <small className="form-text text-muted">От 5 до 50 символов.</small>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Пароль
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={employeeData.password}
                                        onChange={handleEmployeeChange}
                                        minLength="8"
                                        required
                                    />
                                    <small className="form-text text-muted">Минимум 8 символов.</small>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="firstName" className="form-label">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        name="firstName"
                                        value={employeeData.firstName}
                                        onChange={handleEmployeeChange}
                                        minLength="2"
                                        maxLength="50"
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="lastName" className="form-label">
                                        Фамилия
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        name="lastName"
                                        value={employeeData.lastName}
                                        onChange={handleEmployeeChange}
                                        minLength="2"
                                        maxLength="50"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">
                                        Телефон
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={employeeData.phoneNumber}
                                        onChange={handleEmployeeChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="address" className="form-label">
                                        Адрес
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="address"
                                        name="address"
                                        value={employeeData.address}
                                        onChange={handleEmployeeChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="role" className="form-label">
                                    Роль
                                </label>
                                <select
                                    className="form-select"
                                    id="role"
                                    name="role"
                                    value={employeeData.role}
                                    onChange={handleEmployeeChange}
                                    required
                                >
                                    <option value="Employee">Сотрудник</option>
                                    <option value="Manager">Менеджер</option>
                                    <option value="HR">HR</option>
                                </select>
                            </div>
                            <Button type="submit" variant="success" className="fw-bold">
                                Добавить
                            </Button>
                        </form>
                    </div>

                    {/* Блок экспорта + фильтр */}
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
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Фильтр по логину, имени или фамилии"
                                value={filterQueryEmployees}
                                onChange={handleFilterChangeEmployees}
                            />
                        </div>
                    </div>

                    {/* Таблица сотрудников */}
                    {loadingEmployees ? (
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
                                            onClick={() => requestSortEmployees('id')}
                                            style={tableStyle}
                                        >
                                            ID{' '}
                                            {sortConfigEmployees.key === 'id'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th
                                            onClick={() => requestSortEmployees('login')}
                                            style={tableStyle}
                                        >
                                            Логин{' '}
                                            {sortConfigEmployees.key === 'login'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th
                                            onClick={() => requestSortEmployees('firstName')}
                                            style={tableStyle}
                                        >
                                            Имя{' '}
                                            {sortConfigEmployees.key === 'firstName'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th
                                            onClick={() => requestSortEmployees('lastName')}
                                            style={tableStyle}
                                        >
                                            Фамилия{' '}
                                            {sortConfigEmployees.key === 'lastName'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th
                                            onClick={() => requestSortEmployees('phoneNumber')}
                                            style={tableStyle}
                                        >
                                            Телефон{' '}
                                            {sortConfigEmployees.key === 'phoneNumber'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th
                                            onClick={() => requestSortEmployees('address')}
                                            style={tableStyle}
                                        >
                                            Адрес{' '}
                                            {sortConfigEmployees.key === 'address'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th
                                            onClick={() => requestSortEmployees('role')}
                                            style={tableStyle}
                                        >
                                            Роль{' '}
                                            {sortConfigEmployees.key === 'role'
                                                ? sortConfigEmployees.direction === 'asc'
                                                    ? '▲'
                                                    : '▼'
                                                : ''}
                                        </th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedEmployees.length > 0 ? (
                                        sortedEmployees.map((emp) => (
                                            <tr key={emp.id}>
                                                <td>{emp.id}</td>
                                                <td>{emp.login}</td>
                                                <td>{emp.firstName}</td>
                                                <td>{emp.lastName}</td>
                                                <td>{emp.phoneNumber}</td>
                                                <td>{emp.address}</td>
                                                <td>{emp.role}</td>
                                                <td>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="me-2 d-flex align-items-center gap-1"
                                                        onClick={() => handleShowEditModal(emp)}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1"
                                                        onClick={() => handleEmployeeDelete(emp.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                Сотрудники не найдены.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Модалка редактирования сотрудника */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Form onSubmit={handleEditEmployeeSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Редактировать сотрудника</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            <Form.Label>Логин</Form.Label>
                            <Form.Control
                                type="text"
                                name="login"
                                value={editEmployeeData.login}
                                onChange={handleEditEmployeeChange}
                                minLength="5"
                                maxLength="50"
                                required
                            />
                            <Form.Text className="text-muted">От 5 до 50 символов.</Form.Text>
                        </div>
                        <div className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={editEmployeeData.password}
                                onChange={handleEditEmployeeChange}
                                minLength="8"
                            />
                            <Form.Text className="text-muted">
                                Оставьте пустым, чтобы не менять пароль.
                            </Form.Text>
                        </div>
                        <div className="mb-3">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={editEmployeeData.firstName}
                                onChange={handleEditEmployeeChange}
                                minLength="2"
                                maxLength="50"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label>Фамилия</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={editEmployeeData.lastName}
                                onChange={handleEditEmployeeChange}
                                minLength="2"
                                maxLength="50"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={editEmployeeData.phoneNumber}
                                onChange={handleEditEmployeeChange}
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label>Адрес</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={editEmployeeData.address}
                                onChange={handleEditEmployeeChange}
                            />
                        </div>
                        <div className="mb-3">
                            <Form.Label>Роль</Form.Label>
                            <Form.Select
                                name="role"
                                value={editEmployeeData.role}
                                onChange={handleEditEmployeeChange}
                                required
                            >
                                <option value="Employee">Сотрудник</option>
                                <option value="Manager">Менеджер</option>
                                <option value="HR">HR</option>
                            </Form.Select>
                        </div>
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

export default EmployeesManagement;