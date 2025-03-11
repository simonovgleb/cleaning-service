// src/components/AdminScheduleManagement.js

import React, { useEffect, useState, useMemo } from 'react';
import { Button, Table, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

// React Icons
import {
  FaFileExcel,
  FaFileWord,
  FaCalendarPlus,
  FaEdit,
  FaTrash,
  FaFilter
} from 'react-icons/fa';

// Excel export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Word export
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

const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

const AdminScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Фильтры
  const [dayFilter, setDayFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Модалка (создание/редактирование)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' или 'edit'
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Поля формы
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    employeeId: '',
  });

  // ===========================
  // Загрузка расписаний и сотрудников
  // ===========================
  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/schedules');
      setSchedules(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписаний:', err);
      setError('Не удалось загрузить расписания.');
      toast.error('Не удалось загрузить расписания.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке сотрудников:', err);
      toast.error('Не удалось загрузить сотрудников.');
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  // ===========================
  // Модалка (создание/редактирование)
  // ===========================
  const handleShowModal = (mode, schedule = null) => {
    setModalMode(mode);
    if (mode === 'edit' && schedule) {
      setSelectedSchedule(schedule);
      setFormData({
        dayOfWeek: schedule.dayOfWeek.toString(),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        employeeId: schedule.employeeId.toString(),
      });
    } else {
      // «Create»
      setSelectedSchedule(null);
      setFormData({
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        employeeId: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    setFormData({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      employeeId: '',
    });
  };

  // Обработка полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===========================
  // Создание расписания
  // ===========================
  const createSchedule = async () => {
    try {
      await axiosInstance.post('/schedules', {
        dayOfWeek: Number(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        employeeId: Number(formData.employeeId),
      });
      toast.success('Расписание успешно создано.');
      fetchSchedules();
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при создании расписания:', err);
      const message = err.response?.data?.message || 'Не удалось создать расписание.';
      toast.error(message);
    }
  };

  // ===========================
  // Обновление расписания
  // ===========================
  const updateSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await axiosInstance.put(`/schedules/${selectedSchedule.id}`, {
        dayOfWeek: Number(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        employeeId: Number(formData.employeeId),
      });
      toast.success('Расписание успешно обновлено.');
      fetchSchedules();
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при обновлении расписания:', err);
      const message = err.response?.data?.message || 'Не удалось обновить расписание.';
      toast.error(message);
    }
  };

  // Сабмит формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      createSchedule();
    } else {
      updateSchedule();
    }
  };

  // ===========================
  // Удаление расписания
  // ===========================
  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Вы действительно хотите удалить эту запись в расписании?')) return;
    try {
      await axiosInstance.delete(`/schedules/${scheduleId}`);
      toast.success('Расписание успешно удалено.');
      fetchSchedules();
    } catch (err) {
      console.error('Ошибка при удалении расписания:', err);
      toast.error('Не удалось удалить расписание.');
    }
  };

  // ===========================
  // Фильтрация (useMemo)
  // ===========================
  const filteredSchedules = useMemo(() => {
    return schedules.filter((sched) => {
      // Фильтр по дню
      if (dayFilter !== '' && sched.dayOfWeek !== Number(dayFilter)) {
        return false;
      }
      // Фильтр по сотруднику
      if (employeeFilter !== '' && sched.employeeId !== Number(employeeFilter)) {
        return false;
      }
      return true;
    });
  }, [schedules, dayFilter, employeeFilter]);

  // ===========================
  // Экспорт в Excel
  // ===========================
  const handleExportExcel = () => {
    try {
      const sheetData = filteredSchedules.map((sch) => ({
        ID: sch.id,
        ДеньНедели: WEEKDAYS[sch.dayOfWeek] || `День ${sch.dayOfWeek}`,
        Начало: sch.startTime,
        Окончание: sch.endTime,
        Сотрудник: sch.Employee
          ? `${sch.Employee.firstName} ${sch.Employee.lastName}`
          : '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'schedule_report.xlsx');
      toast.success('Расписание экспортировано в Excel!');
    } catch (error) {
      toast.error('Ошибка экспорта в Excel');
      console.error('Excel export error:', error);
    }
  };

  // ===========================
  // Экспорт в Word
  // ===========================
  const handleExportWord = async () => {
    try {
      const tableRows = [];

      // Шапка таблицы
      const headerRow = new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'ID', bold: true })],
            width: { size: 700, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: 'День Недели', bold: true })],
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Начало', bold: true })],
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Окончание', bold: true })],
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Сотрудник', bold: true })],
          }),
        ],
      });
      tableRows.push(headerRow);

      // Данные
      filteredSchedules.forEach((sch) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(String(sch.id))],
              }),
              new TableCell({
                children: [
                  new Paragraph(WEEKDAYS[sch.dayOfWeek] || `День ${sch.dayOfWeek}`),
                ],
              }),
              new TableCell({
                children: [new Paragraph(sch.startTime || '')],
              }),
              new TableCell({
                children: [new Paragraph(sch.endTime || '')],
              }),
              new TableCell({
                children: [
                  new Paragraph(
                    sch.Employee
                      ? `${sch.Employee.firstName} ${sch.Employee.lastName}`
                      : ''
                  ),
                ],
              }),
            ],
          })
        );
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
                    text: 'Отчёт по расписанию',
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
      saveAs(blob, 'schedule_report.docx');
      toast.success('Расписание экспортировано в Word!');
    } catch (error) {
      toast.error('Ошибка экспорта в Word');
      console.error('Word export error:', error);
    }
  };

  // ===========================
  // Стили «ВАУ»
  // ===========================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #fffbd5, #b20a2c)',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '30px',
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={cardStyle}>
          <h2 className="fw-bold mb-4">Управление расписанием сотрудников</h2>

          {/* Кнопки экспорта */}
          <div className="mb-3 d-flex flex-wrap gap-2">
            <Button
              variant="outline-success"
              onClick={handleExportExcel}
              className="d-flex align-items-center gap-2"
            >
              <FaFileExcel />
              Экспорт в Excel
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleExportWord}
              className="d-flex align-items-center gap-2"
            >
              <FaFileWord />
              Экспорт в Word
            </Button>
          </div>

          {/* Блок фильтров */}
          <Row className="mb-4 g-3">
            <Col xs={12} md={4}>
              <div className="d-flex align-items-center gap-2">
                <FaFilter />
                <Form.Select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <option value="">Все дни</option>
                  {WEEKDAYS.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <Form.Select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="">Все сотрудники</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={4} className="text-end">
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2"
                onClick={() => handleShowModal('create')}
              >
                <FaCalendarPlus />
                Добавить расписание
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredSchedules.length === 0 ? (
            <p>Расписаний нет.</p>
          ) : (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>День Недели</th>
                  <th>Время Начала</th>
                  <th>Время Окончания</th>
                  <th>Сотрудник</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((sched) => {
                  const employeeName = sched.Employee
                    ? `${sched.Employee.firstName} ${sched.Employee.lastName}`
                    : '—';
                  return (
                    <tr key={sched.id}>
                      <td>{sched.id}</td>
                      <td>{WEEKDAYS[sched.dayOfWeek] || `День ${sched.dayOfWeek}`}</td>
                      <td>{sched.startTime}</td>
                      <td>{sched.endTime}</td>
                      <td>{employeeName}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2 d-flex align-items-center gap-1"
                          onClick={() => handleShowModal('edit', sched)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => handleDelete(sched.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}

          {/* Модалка создания/редактирования расписания */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {modalMode === 'create' ? 'Добавить расписание' : 'Изменить расписание'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formDayOfWeek">
                  <Form.Label>День недели</Form.Label>
                  <Form.Select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите день...</option>
                    {WEEKDAYS.map((name, idx) => (
                      <option key={idx} value={idx}>
                        {name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formStartTime">
                  <Form.Label>Время начала (HH:MM:SS)</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEndTime">
                  <Form.Label>Время окончания (HH:MM:SS)</Form.Label>
                  <Form.Control
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formEmployeeId">
                  <Form.Label>Сотрудник</Form.Label>
                  <Form.Select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите сотрудника...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant={modalMode === 'create' ? 'primary' : 'success'}>
                    {modalMode === 'create' ? 'Создать' : 'Сохранить'}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminScheduleManagement;