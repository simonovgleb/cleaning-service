// src/components/EmployeeDashboard.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axiosInstance from '../../api/axiosConfig';

// Bootstrap
import {
  Spinner,
  Table,
  Button,
  Modal,
  Form,
  Badge
} from 'react-bootstrap';

// React Icons
import {
  FaSignOutAlt,
  FaUserEdit,
  FaCalendarAlt,
  FaRegEdit,
  FaSave,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';

const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота'
];

const ALLOWED_STATUSES = ['In Progress', 'Completed', 'Cancelled'];

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // ===========================
  // Состояния
  // ===========================
  const [employeeData, setEmployeeData] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [employeeError, setEmployeeError] = useState(null);

  // Расписание сотрудника
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  // Записи (Appointments), назначенные сотруднику
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);

  // Отзывы (Feedback) по записям этого сотрудника
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbacksError, setFeedbacksError] = useState(null);

  // Модалка для редактирования профиля
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    password: '' // Если сотрудник хочет сменить пароль
  });
  const [updating, setUpdating] = useState(false);

  // Модалка для изменения статуса записи
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // ===========================
  // Logout
  // ===========================
  const handleLogout = () => {
    dispatch(logout());
    toast.success('Вы успешно вышли из системы');
    navigate('/login');
  };

  // ===========================
  // Загрузка данных сотрудника
  // ===========================
  const fetchEmployeeData = async () => {
    if (!user?.id) return;
    setLoadingEmployee(true);
    setEmployeeError(null);
    try {
      const response = await axiosInstance.get(`/employees/${user.id}`);
      setEmployeeData(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке данных сотрудника:', err);
      setEmployeeError('Не удалось загрузить данные сотрудника.');
    } finally {
      setLoadingEmployee(false);
    }
  };

  // ===========================
  // Загрузка расписания
  // ===========================
  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    setScheduleError(null);
    try {
      const response = await axiosInstance.get('/schedules');
      setSchedule(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке расписания:', err);
      setScheduleError('Не удалось загрузить расписание.');
    } finally {
      setLoadingSchedule(false);
    }
  };

  // ===========================
  // Загрузка назначенных записей
  // ===========================
  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const response = await axiosInstance.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке записей:', err);
      setAppointmentsError('Не удалось загрузить записи.');
    } finally {
      setLoadingAppointments(false);
    }
  };

  // ===========================
  // Загрузка отзывов
  // ===========================
  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    setFeedbacksError(null);
    try {
      const response = await axiosInstance.get('/feedbacks');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setFeedbacksError('Не удалось загрузить отзывы.');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // ===========================
  // useEffect - загружаем всё
  // ===========================
  useEffect(() => {
    if (user?.id) {
      fetchEmployeeData();
      fetchSchedule();
      fetchAppointments();
      fetchFeedbacks();
    }
    // eslint-disable-next-line
  }, [user?.id]);

  // ===========================
  // Модалка редактирования профиля
  // ===========================
  const handleShowEditModal = () => {
    if (!employeeData) return;
    setUpdateData({
      firstName: employeeData.firstName || '',
      lastName: employeeData.lastName || '',
      phoneNumber: employeeData.phoneNumber || '',
      address: employeeData.address || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setUpdateData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      password: ''
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!employeeData) return;

    setUpdating(true);
    try {
      await axiosInstance.put(`/employees/${employeeData.id}`, {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phoneNumber: updateData.phoneNumber,
        address: updateData.address,
        password: updateData.password ? updateData.password : undefined
      });
      toast.success('Данные успешно обновлены');
      fetchEmployeeData();
      handleCloseEditModal();
    } catch (err) {
      console.error('Ошибка при обновлении сотрудника:', err);
      toast.error('Не удалось обновить данные.');
    } finally {
      setUpdating(false);
    }
  };

  // ===========================
  // Модалка изменения статуса записи
  // ===========================
  const handleShowStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedAppointment(null);
    setNewStatus('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    if (newStatus === selectedAppointment.status) {
      toast.info('Статус не изменился.');
      handleCloseStatusModal();
      return;
    }

    try {
      await axiosInstance.put(`/appointments/${selectedAppointment.id}`, {
        status: newStatus
      });
      toast.success('Статус успешно обновлён');
      fetchAppointments();
      handleCloseStatusModal();
    } catch (err) {
      console.error('Ошибка при обновлении статуса записи:', err);
      toast.error('Не удалось обновить статус.');
    }
  };

  // ===========================
  // Стили для «ВАУ»-эффекта
  // ===========================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #8e9eab, #eef2f3)',
    padding: '40px 20px'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    padding: '30px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  };

  const nameStyle = {
    fontSize: '1.6rem',
    fontWeight: 'bold'
  };

  const roleBadgeStyle = {
    fontSize: '1rem',
    marginLeft: '10px'
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={cardStyle}>
          {/* Шапка: приветствие + кнопка «Выйти» */}
          <div style={headerStyle}>
            <div>
              <h2 className="fw-bold">Панель сотрудника</h2>
              {employeeData && (
                <p style={nameStyle}>
                  Добро пожаловать, {employeeData.firstName}!
                </p>
              )}
            </div>
            <div>
              <Button
                variant="outline-danger"
                onClick={handleLogout}
                className="d-flex align-items-center gap-2 fw-bold"
              >
                <FaSignOutAlt /> Выйти
              </Button>
            </div>
          </div>

          {/* Основная инфа о сотруднике + кнопка «Редактировать» */}
          <div className="mt-4 p-3" style={{ backgroundColor: '#f7f7f7', borderRadius: '10px' }}>
            <h5 className="fw-bold">Мои данные:</h5>
            {loadingEmployee ? (
              <Spinner animation="border" size="sm" />
            ) : employeeError ? (
              <div className="text-danger">{employeeError}</div>
            ) : employeeData ? (
              <>
                <p>
                  <strong>Логин:</strong> {employeeData.login}
                </p>
                <p>
                  <strong>Имя:</strong> {employeeData.firstName}
                </p>
                <p>
                  <strong>Фамилия:</strong> {employeeData.lastName}
                </p>
                <p>
                  <strong>Телефон:</strong> {employeeData.phoneNumber || '—'}
                </p>
                <p>
                  <strong>Адрес:</strong> {employeeData.address || '—'}
                </p>
                <Button
                  variant="warning"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={handleShowEditModal}
                >
                  <FaUserEdit />
                  Редактировать
                </Button>
              </>
            ) : (
              <p>Нет данных о сотруднике.</p>
            )}
          </div>

          {/* Расписание */}
          <div className="mt-4 p-3" style={{ backgroundColor: '#ffffffcc', borderRadius: '10px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FaCalendarAlt /> Моё расписание
            </h5>
            {loadingSchedule ? (
              <Spinner animation="border" size="sm" />
            ) : scheduleError ? (
              <div className="text-danger">{scheduleError}</div>
            ) : schedule.length === 0 ? (
              <p>Пока нет расписания.</p>
            ) : (
              <Table bordered hover size="sm">
                <thead>
                  <tr>
                    <th>День Недели</th>
                    <th>Начало</th>
                    <th>Окончание</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => (
                    <tr key={item.id}>
                      <td>{WEEKDAYS[item.dayOfWeek] || item.dayOfWeek}</td>
                      <td>{item.startTime}</td>
                      <td>{item.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* Записи */}
          <div className="mt-4 p-3" style={{ backgroundColor: '#ffffffcc', borderRadius: '10px' }}>
            <h5 className="fw-bold mb-3">Мои записи</h5>
            {loadingAppointments ? (
              <Spinner animation="border" size="sm" />
            ) : appointmentsError ? (
              <div className="text-danger">{appointmentsError}</div>
            ) : appointments.length === 0 ? (
              <p>Записей нет.</p>
            ) : (
              <Table bordered hover size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Дата/Время</th>
                    <th>Услуга</th>
                    <th>Клиент</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app) => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td>{new Date(app.appointmentDate).toLocaleString()}</td>
                      <td>{app.Service?.name}</td>
                      <td>
                        {app.Customer
                          ? `${app.Customer.firstName} ${app.Customer.lastName}`
                          : '—'}
                      </td>
                      <td>
                        <Badge bg="info" text="dark">
                          {app.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => handleShowStatusModal(app)}
                        >
                          <FaRegEdit />
                          Изменить статус
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          {/* Отзывы */}
          <div className="mt-4 p-3" style={{ backgroundColor: '#ffffffcc', borderRadius: '10px' }}>
            <h5 className="fw-bold mb-3">Отзывы о моих записях</h5>
            {loadingFeedbacks ? (
              <Spinner animation="border" size="sm" />
            ) : feedbacksError ? (
              <div className="text-danger">{feedbacksError}</div>
            ) : feedbacks.length === 0 ? (
              <p>Пока нет отзывов.</p>
            ) : (
              <Table bordered hover size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Рейтинг</th>
                    <th>Комментарий</th>
                    <th>Дата Записи</th>
                    <th>Клиент</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb) => (
                    <tr key={fb.id}>
                      <td>{fb.id}</td>
                      <td>{fb.rating}</td>
                      <td>{fb.comment}</td>
                      <td>
                        {fb.Appointment
                          ? new Date(fb.Appointment.appointmentDate).toLocaleString()
                          : '—'}
                      </td>
                      <td>
                        {fb.Customer
                          ? `${fb.Customer.firstName} ${fb.Customer.lastName}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Модалка редактирования профиля */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать данные</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={updateData.firstName}
                onChange={handleUpdateChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={updateData.lastName}
                onChange={handleUpdateChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Телефон</Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={updateData.phoneNumber}
                onChange={handleUpdateChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Адрес</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={updateData.address}
                onChange={handleUpdateChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Новый пароль (необязательно)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={updateData.password}
                onChange={handleUpdateChange}
              />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" variant="success" disabled={updating} className="d-flex align-items-center gap-2">
                {updating ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" /> Сохранение...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Модалка изменения статуса записи */}
      <Modal show={showStatusModal} onHide={handleCloseStatusModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Изменить статус записи</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <Form onSubmit={handleStatusSubmit}>
              <p>
                Запись #{selectedAppointment.id} на{' '}
                {new Date(selectedAppointment.appointmentDate).toLocaleString()}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Новый статус</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {ALLOWED_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-grid">
                <Button type="submit" variant="primary" className="d-flex align-items-center gap-2">
                  <FaCheckCircle />
                  Сохранить
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;