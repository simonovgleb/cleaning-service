// src/components/AdminAppointments.js

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { toast } from 'react-toastify';

// Bootstrap
import {
  Spinner,
  Table,
  Button,
  Modal,
  Form,
  Badge
} from 'react-bootstrap';

import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// React Icons
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaFileExcel,
  FaFileWord,
  FaFilter,
  FaPhone,
  FaUserAlt
} from 'react-icons/fa';

// Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Word
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

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Состояния для выбранной записи
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Модалки
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Данные для обновления
  const [updateData, setUpdateData] = useState({
    status: '',
    employeeId: '',
    appointmentDate: new Date(),
  });

  // Сотрудники (для назначения)
  const [employees, setEmployees] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Фильтры
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ==========================
  // Загрузка всех записей
  // ==========================
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/appointments');
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке записей:', err);
      setError('Не удалось загрузить записи. Попробуйте позже.');
      toast.error('Не удалось загрузить записи.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Загрузка списка сотрудников
  // ==========================
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
    fetchAppointments();
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  // ==========================
  // Фильтрация
  // ==========================
  const filterAppointments = () => {
    let filtered = appointments;

    if (filterStatus) {
      filtered = filtered.filter(
        (appointment) => appointment.status === filterStatus
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((appointment) =>
        appointment.Customer?.phoneNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line
  }, [filterStatus, searchQuery, appointments]);

  // ==========================
  // Модалка "Подробнее"
  // ==========================
  const handleShowDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  // ==========================
  // Модалка "Обновить"
  // ==========================
  const handleShowUpdate = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdateData({
      status: appointment.status,
      employeeId: appointment.employeeId || '',
      appointmentDate: new Date(appointment.appointmentDate),
    });
    setShowUpdateModal(true);
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setSelectedAppointment(null);
  };

  // Обработчики формы
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setUpdateData((prev) => ({ ...prev, appointmentDate: date }));
  };

  // ==========================
  // Сабмит обновления
  // ==========================
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!updateData.appointmentDate || isNaN(updateData.appointmentDate.getTime())) {
      toast.error('Выберите корректную дату и время.');
      return;
    }

    setUpdating(true);
    try {
      // Обновляем саму запись
      await axiosInstance.put(`/appointments/${selectedAppointment.id}`, {
        status: updateData.status,
        employeeId: updateData.employeeId || null,
        appointmentDate: updateData.appointmentDate.toISOString(),
      });

      // Если в записи есть Payment, меняем статус платежа
      if (selectedAppointment.Payment) {
        const paymentId = selectedAppointment.Payment.id;
        let newPaymentStatus = null;

        if (updateData.status === 'Completed') {
          newPaymentStatus = 'Completed';
        } else if (updateData.status === 'Cancelled') {
          newPaymentStatus = 'Failed';
        }

        if (newPaymentStatus) {
          await axiosInstance.put(`/payments/${paymentId}`, {
            status: newPaymentStatus,
          });
        }
      }

      toast.success('Запись успешно обновлена.');
      fetchAppointments();
      handleCloseUpdate();
    } catch (err) {
      console.error('Ошибка при обновлении записи:', err);
      toast.error('Не удалось обновить запись.');
    } finally {
      setUpdating(false);
    }
  };

  // ==========================
  // Удаление записи
  // ==========================
  const handleDeleteAppointment = async (appointment) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;
    try {
      await axiosInstance.delete(`/appointments/${appointment.id}`);
      toast.success('Запись успешно удалена.');
      fetchAppointments();
    } catch (err) {
      console.error('Ошибка при удалении записи:', err);
      toast.error('Не удалось удалить запись.');
    }
  };

  // ==========================
  // Экспорт в Excel
  // ==========================
  const handleExportExcel = () => {
    try {
      const sheetData = filteredAppointments.map((apt) => ({
        ID: apt.id,
        ДатаВремя: moment(apt.appointmentDate).format('DD.MM.YYYY HH:mm'),
        Услуга: apt.Service?.name || '',
        Сотрудник: apt.Employee
          ? `${apt.Employee.firstName} ${apt.Employee.lastName}`
          : '',
        Клиент: apt.Customer
          ? `${apt.Customer.firstName} ${apt.Customer.lastName} (${
              apt.Customer.phoneNumber || ''
            })`
          : '',
        Статус: apt.status,
        ОплатаСумма: apt.Payment?.amount || '',
        ОплатаСтатус: apt.Payment?.status || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'appointments_report.xlsx');
      toast.success('Отчёт в Excel сформирован!');
    } catch (error) {
      toast.error('Ошибка при экспорте в Excel');
      console.error('Excel export error:', error);
    }
  };

  // ==========================
  // Экспорт в Word
  // ==========================
  const handleExportWord = async () => {
    try {
      // Шапка таблицы
      const headerRow = new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'ID', bold: true })],
            width: { size: 800, type: WidthType.DXA },
          }),
          new TableCell({ children: [new Paragraph({ text: 'Дата/Время', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Услуга', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Сотрудник', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Клиент', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Статус', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Оплата', bold: true })] }),
        ],
      });

      // Данные
      const dataRows = filteredAppointments.map((apt) => {
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(apt.id))] }),
            new TableCell({
              children: [
                new Paragraph(
                  moment(apt.appointmentDate).format('DD.MM.YYYY HH:mm') || ''
                ),
              ],
            }),
            new TableCell({ children: [new Paragraph(apt.Service?.name || '')] }),
            new TableCell({
              children: [
                new Paragraph(
                  apt.Employee
                    ? `${apt.Employee.firstName} ${apt.Employee.lastName}`
                    : ''
                ),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph(
                  apt.Customer
                    ? `${apt.Customer.firstName} ${apt.Customer.lastName} (${
                        apt.Customer.phoneNumber || ''
                      })`
                    : ''
                ),
              ],
            }),
            new TableCell({ children: [new Paragraph(apt.status || '')] }),
            new TableCell({
              children: [
                new Paragraph(
                  apt.Payment
                    ? `Сумма: ${apt.Payment.amount} | Статус: ${apt.Payment.status}`
                    : ''
                ),
              ],
            }),
          ],
        });
      });

      const docTable = new DocxTable({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Отчёт по записям',
                    bold: true,
                    size: 28, // 14pt
                  }),
                ],
              }),
              new Paragraph({ text: '' }), // пустая строка
              docTable,
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'appointments_report.docx');
      toast.success('Отчёт в Word сформирован!');
    } catch (error) {
      toast.error('Ошибка при экспорте в Word');
      console.error('Word export error:', error);
    }
  };

  // ==========================
  // Функция возвращает цвет для статуса (пример)
  // ==========================
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'warning';
      case 'In Progress':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // ==========================
  // Стили для «ВАУ»-эффекта
  // ==========================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #f9fafc, #cfd9df)',
    padding: '40px 20px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '30px',
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={cardStyle}>
          <h2 className="fw-bold mb-4">Управление Записями</h2>

          {/* Блок экспорта */}
          <div className="d-flex flex-wrap mb-3 gap-2">
            <Button variant="outline-success" onClick={handleExportExcel} className="d-flex align-items-center gap-2">
              <FaFileExcel />
              Экспорт в Excel
            </Button>
            <Button variant="outline-secondary" onClick={handleExportWord} className="d-flex align-items-center gap-2">
              <FaFileWord />
              Экспорт в Word
            </Button>
          </div>

          {/* Фильтры */}
          <div className="row mb-3 g-3">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2">
                <FaFilter />
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Все статусы</option>
                  <option value="Scheduled">Запланировано</option>
                  <option value="In Progress">В процессе</option>
                  <option value="Completed">Завершено</option>
                  <option value="Cancelled">Отменено</option>
                </Form.Select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2">
                <FaPhone />
                <Form.Control
                  type="text"
                  placeholder="Поиск по номеру телефона"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Основной блок */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredAppointments.length === 0 ? (
            <p>Записи не найдены.</p>
          ) : (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Дата и Время</th>
                  <th>Услуга</th>
                  <th>Сотрудник</th>
                  <th>Клиент</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  // Для удобства
                  const employeeName = appointment.Employee
                    ? `${appointment.Employee.firstName} ${appointment.Employee.lastName}`
                    : 'Не назначен';

                  const customerName = appointment.Customer
                    ? `${appointment.Customer.firstName} ${appointment.Customer.lastName} 
                      (${appointment.Customer.phoneNumber || 'Нет номера'})`
                    : 'Неизвестный клиент';

                  const rowClass =
                    appointment.status === 'Cancelled'
                      ? 'table-danger'
                      : appointment.status === 'Completed'
                      ? 'table-success'
                      : '';

                  return (
                    <tr key={appointment.id} className={rowClass}>
                      <td>{appointment.id}</td>
                      <td>{moment(appointment.appointmentDate).format('DD.MM.YYYY HH:mm')}</td>
                      <td>{appointment.Service?.name}</td>
                      <td>{employeeName}</td>
                      <td>{customerName}</td>
                      <td>
                        <Badge bg={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2 d-flex align-items-center gap-1"
                          onClick={() => handleShowDetails(appointment)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2 d-flex align-items-center gap-1"
                          onClick={() => handleShowUpdate(appointment)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => handleDeleteAppointment(appointment)}
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

          {/* Модалка "Подробнее" */}
          <Modal show={showDetailsModal} onHide={handleCloseDetails} centered>
            <Modal.Header closeButton>
              <Modal.Title>Подробности записи</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedAppointment && (
                <div>
                  <p>
                    <strong>ID:</strong> {selectedAppointment.id}
                  </p>
                  <p>
                    <strong>Дата и Время:</strong>{' '}
                    {moment(selectedAppointment.appointmentDate).format('DD.MM.YYYY HH:mm')}
                  </p>
                  <p>
                    <strong>Услуга:</strong> {selectedAppointment.Service?.name}
                  </p>
                  <p>
                    <strong>Сотрудник:</strong>{' '}
                    {selectedAppointment.Employee
                      ? `${selectedAppointment.Employee.firstName} ${selectedAppointment.Employee.lastName}`
                      : 'Не назначен'}
                  </p>
                  <p>
                    <strong>Клиент:</strong>{' '}
                    {selectedAppointment.Customer
                      ? `${selectedAppointment.Customer.firstName} ${selectedAppointment.Customer.lastName}`
                      : 'Неизвестный клиент'}
                  </p>
                  <p>
                    <strong>Статус:</strong> {selectedAppointment.status}
                  </p>

                  {/* Блок информации о платеже (если есть) */}
                  {selectedAppointment.Payment && (
                    <div className="mt-3 p-2 border rounded">
                      <h5>Информация о платеже</h5>
                      <p>
                        <strong>Сумма:</strong> {selectedAppointment.Payment.amount} ₽
                      </p>
                      <p>
                        <strong>Способ оплаты:</strong>{' '}
                        {selectedAppointment.Payment.paymentMethod}
                      </p>
                      <p>
                        <strong>Статус платежа:</strong>{' '}
                        {selectedAppointment.Payment.status}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDetails}>
                Закрыть
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Модалка "Обновить" */}
          <Modal show={showUpdateModal} onHide={handleCloseUpdate} centered>
            <Modal.Header closeButton>
              <Modal.Title>Обновление записи</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedAppointment && (
                <Form onSubmit={handleUpdateSubmit}>
                  {/* Статус */}
                  <Form.Group className="mb-3">
                    <Form.Label>Статус</Form.Label>
                    <Form.Select
                      name="status"
                      value={updateData.status}
                      onChange={handleUpdateChange}
                      required
                    >
                      <option value="">Выберите статус</option>
                      <option value="Scheduled">Запланировано</option>
                      <option value="In Progress">В процессе</option>
                      <option value="Completed">Завершено</option>
                      <option value="Cancelled">Отменено</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Сотрудник */}
                  <Form.Group className="mb-3">
                    <Form.Label>Сотрудник</Form.Label>
                    <Form.Select
                      name="employeeId"
                      value={updateData.employeeId}
                      onChange={handleUpdateChange}
                    >
                      <option value="">Не назначен</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Дата и время */}
                  <Form.Group className="mb-3">
                    <Form.Label>Дата и Время</Form.Label>
                    <DatePicker
                      selected={updateData.appointmentDate}
                      onChange={handleDateChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd.MM.yyyy HH:mm"
                      className="form-control"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button type="submit" disabled={updating} variant="success">
                      {updating ? 'Обновление...' : 'Обновить'}
                    </Button>
                  </div>
                </Form>
              )}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;