// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

import {
  Spinner,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  InputGroup,
  Table,
  Badge,
  Pagination, // <--- Добавляем из react-bootstrap
} from 'react-bootstrap';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { FaSignOutAlt, FaMoneyBillWave, FaUserAlt } from 'react-icons/fa';
import { MdAssignmentAdd, MdOutlineRateReview } from 'react-icons/md';
import { GiPriceTag } from 'react-icons/gi';

/** 
 * Карточка услуги 
 */
const ServiceCard = ({ service, onDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    transition: 'all 0.3s ease-in-out',
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: isHovered
      ? '0 12px 30px rgba(0,0,0,0.2)'
      : '0 8px 20px rgba(0,0,0,0.1)',
  };

  const imgStyle = {
    height: '200px',
    objectFit: 'cover',
    filter: isHovered ? 'brightness(105%)' : 'brightness(100%)',
    transition: 'filter 0.3s ease',
  };

  const btnStyle = {
    borderRadius: '25px',
    fontWeight: 'bold',
  };

  return (
    <Card
      className="h-100"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onDetails(service)}
    >
      {service.photo ? (
        <Card.Img
          variant="top"
          src={`${axiosInstance.defaults.baseURL}${service.photo}`}
          alt={service.name}
          style={imgStyle}
        />
      ) : (
        <Card.Img
          variant="top"
          src="https://via.placeholder.com/400x200?text=No+Image"
          alt="No Image"
          style={imgStyle}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="mb-2">{service.name}</Card.Title>
        <div className="mt-auto">
          <Button
            variant="info"
            style={btnStyle}
          >
            Подробнее
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // -----------------------------
  // Состояния для услуг
  // -----------------------------
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState(null);

  // -----------------------------
  // ПАГИНАЦИЯ (локальная)
  // -----------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Количество услуг на одной странице

  // -----------------------------
  // Состояния для формы создания записи (Appointment)
  // -----------------------------
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    serviceId: '',
    appointmentDate: new Date(),
    employeeId: '',
  });

  // -----------------------------
  // Состояния для создания платежа (Payment)
  // -----------------------------
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'Credit Card',
  });

  // -----------------------------
  // Состояния для сотрудников
  // -----------------------------
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);

  // -----------------------------
  // Модалка "Подробнее" об услуге
  // -----------------------------
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // -----------------------------
  // Отзывы (все) для клиентов
  // -----------------------------
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbacksError, setFeedbacksError] = useState(null);

  // ===========================
  // Функция логаута
  // ===========================
  const handleLogout = () => {
    dispatch(logout());
    toast.success('Вы успешно вышли из системы');
    navigate('/login');
  };

  // ===========================
  // Загрузка списка услуг
  // ===========================
  const fetchServices = async () => {
    setLoadingServices(true);
    setServicesError(null);
    try {
      const response = await axiosInstance.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке услуг:', err);
      setServicesError('Не удалось загрузить услуги.');
      toast.error('Не удалось загрузить услуги.');
    } finally {
      setLoadingServices(false);
    }
  };

  // ===========================
  // Загрузка доступных сотрудников
  // ===========================
  const fetchAvailableEmployees = async (serviceId, appointmentDate) => {
    setLoadingEmployees(true);
    setEmployeesError(null);
    try {
      const formattedDate = appointmentDate.toISOString();
      const response = await axiosInstance.get('/appointments/available-employees', {
        params: {
          serviceId,
          appointmentDate: formattedDate,
        },
      });
      setAvailableEmployees(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке сотрудников:', err);
      setEmployeesError('Не удалось загрузить сотрудников.');
      toast.error('Не удалось загрузить сотрудников.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // ===========================
  // Загрузка всех отзывов (для клиентов)
  // ===========================
  const fetchAllFeedbacks = async () => {
    setLoadingFeedbacks(true);
    setFeedbacksError(null);
    try {
      const res = await axiosInstance.get('/feedbacks');
      setAllFeedbacks(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setFeedbacksError('Не удалось загрузить отзывы.');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // ===========================
  // useEffect
  // ===========================
  useEffect(() => {
    fetchServices();
    // Если пользователь - клиент, загружаем все отзывы
    if (user?.role === 'customer') {
      fetchAllFeedbacks();
    }
    // eslint-disable-next-line
  }, [user?.role]);

  // ===========================
  // Модалки
  // ===========================
  const handleShowAppointmentModal = () => {
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
    setAppointmentData({
      serviceId: '',
      appointmentDate: new Date(),
      employeeId: '',
    });
    setPaymentData({
      amount: 0,
      paymentMethod: 'Credit Card',
    });
    setAvailableEmployees([]);
    setEmployeesError(null);
  };

  const handleServiceDetails = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setSelectedService(null);
  };

  // ===========================
  // Обработчики полей формы
  // ===========================
  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setAppointmentData((prev) => ({ ...prev, appointmentDate: date }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  // ===========================
  // Сабмит создания записи + платеж
  // ===========================
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    const { serviceId, appointmentDate, employeeId } = appointmentData;
    const { amount, paymentMethod } = paymentData;
    const errors = [];

    if (!serviceId) {
      errors.push('Необходимо выбрать услугу.');
    }
    if (!appointmentDate || isNaN(appointmentDate.getTime())) {
      errors.push('Необходимо выбрать корректную дату/время.');
    }
    if (amount <= 0) {
      errors.push('Сумма платежа должна быть больше 0.');
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      // Создаём Appointment
      const apptResp = await axiosInstance.post('/appointments', {
        serviceId,
        appointmentDate: appointmentDate.toISOString(),
        employeeId: employeeId || null,
      });

      const createdAppointment = apptResp.data;
      toast.success('Запись успешно создана!');

      // Создаём Payment
      await axiosInstance.post('/payments', {
        appointmentId: createdAppointment.id,
        amount,
        paymentMethod,
      });
      toast.success('Платёж успешно создан!');

      handleCloseAppointmentModal();
    } catch (err) {
      console.error('Ошибка при создании записи/платежа:', err);
      const message = err.response?.data?.message || 'Произошла ошибка при создании.';
      toast.error(`Ошибка: ${message}`);
    }
  };

  // ===========================
  // Автоматическая подстановка цены
  // ===========================
  useEffect(() => {
    if (appointmentData.serviceId) {
      const sel = services.find((s) => s.id === Number(appointmentData.serviceId));
      if (sel) {
        setPaymentData((prev) => ({ ...prev, amount: sel.price || 0 }));
      }
    }
  }, [appointmentData.serviceId, services]);

  // ===========================
  // Подгружаем сотрудников при изменении услуги/даты
  // ===========================
  useEffect(() => {
    const { serviceId, appointmentDate } = appointmentData;
    if (serviceId && appointmentDate) {
      fetchAvailableEmployees(serviceId, appointmentDate);
    } else {
      setAvailableEmployees([]);
    }
  }, [appointmentData.serviceId, appointmentData.appointmentDate]);

  // ===========================
  // Пагинация: вычисляем подмножество услуг для текущей страницы
  // ===========================
  const pagesCount = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

  // Функция смены страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ===========================
  // Стили
  // ===========================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f8ffff, #e0f7fa)',
    padding: '40px 20px',
  };

  const logoutBtnStyle = {
    borderRadius: '25px',
    fontWeight: 'bold',
  };

  const appointmentBtnStyle = {
    borderRadius: '25px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        {/* Шапка / Приветствие */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">
              Добро пожаловать, {user?.firstName}! <FaUserAlt style={{ marginLeft: '8px' }} />
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#555' }}>
              Ваша роль: 
              <Badge
                bg={user?.role === 'customer' ? 'primary' : 'secondary'}
                className="ms-2"
                style={{ fontSize: '1rem', verticalAlign: 'middle' }}
              >
                {user?.role}
              </Badge>
            </p>
          </div>

          <Button variant="danger" style={logoutBtnStyle} onClick={handleLogout}>
            <FaSignOutAlt /> Выйти
          </Button>
        </div>

        {/* --- Блок услуг --- */}
        <div className="p-4" style={{ backgroundColor: '#ffffffdd', borderRadius: '15px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold">
              Наши услуги <GiPriceTag style={{ marginLeft: '8px' }} />
            </h4>
            {user?.role === 'customer' && (
              <Button variant="primary" style={appointmentBtnStyle} onClick={handleShowAppointmentModal}>
                <MdAssignmentAdd /> Записаться
              </Button>
            )}
          </div>

          {loadingServices ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : servicesError ? (
            <div className="alert alert-danger" role="alert">
              {servicesError}
            </div>
          ) : services.length === 0 ? (
            <p>Услуг не найдено.</p>
          ) : (
            <>
              {/* Карточки услуг (только для текущей страницы) */}
              <Row xs={1} md={2} lg={3} className="g-4">
                {currentServices.map((service) => (
                  <Col key={service.id}>
                    <ServiceCard service={service} onDetails={handleServiceDetails} />
                  </Col>
                ))}
              </Row>

              {/* Пагинация (если страниц > 1) */}
              {pagesCount > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    {Array.from({ length: pagesCount }, (_, i) => i + 1).map((page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagesCount}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(pagesCount)}
                      disabled={currentPage === pagesCount}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- Модалка "Подробнее" об услуге --- */}
        <Modal
          show={showServiceModal}
          onHide={handleCloseServiceModal}
          size="lg"
          centered
          className="pt-5"
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedService?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedService?.photo ? (
              <img
                src={`${axiosInstance.defaults.baseURL}${selectedService.photo}`}
                alt={selectedService.name}
                className="img-fluid mb-3 rounded"
              />
            ) : (
              <img
                src="https://via.placeholder.com/800x400?text=No+Image"
                alt="No Image"
                className="img-fluid mb-3 rounded"
              />
            )}
            <h5 className="fw-bold">Описание:</h5>
            <p>{selectedService?.description || 'Описание отсутствует.'}</p>

            <h5 className="fw-bold">Цена:</h5>
            <p>{Number(selectedService?.price).toFixed(2)} ₽</p>

            <h5 className="fw-bold">Длительность:</h5>
            <p>{selectedService?.duration} минут</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseServiceModal}>
              Закрыть
            </Button>
          </Modal.Footer>
        </Modal>

        {/* --- Модалка "Создать запись" (Appointment + Payment) --- */}
        <Modal
          show={showAppointmentModal}
          onHide={handleCloseAppointmentModal}
          size="lg"
          centered
          className="pt-5"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <MdAssignmentAdd /> Создать запись
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAppointmentSubmit}>
              <Form.Group className="mb-3" controlId="formService">
                <Form.Label>Услуга</Form.Label>
                <Form.Select
                  name="serviceId"
                  value={appointmentData.serviceId}
                  onChange={handleAppointmentChange}
                  required
                >
                  <option value="">Выберите услугу</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {Number(service.price).toFixed(2)} ₽
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formAppointmentDate">
                <Form.Label>Дата и время</Form.Label>
                <InputGroup>
                  <DatePicker
                    selected={appointmentData.appointmentDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp"
                    minDate={new Date()}
                    className="form-control"
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmployee">
                <Form.Label>Сотрудник (необязательно)</Form.Label>
                {loadingEmployees ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" /> 
                    <span>Загрузка...</span>
                  </div>
                ) : employeesError ? (
                  <div className="text-danger">{employeesError}</div>
                ) : availableEmployees.length === 0 ? (
                  <div>Доступных сотрудников не найдено.</div>
                ) : (
                  <Form.Select
                    name="employeeId"
                    value={appointmentData.employeeId}
                    onChange={handleAppointmentChange}
                  >
                    <option value="">Не выбирать сотрудника</option>
                    {availableEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>

              <hr />
              <h5 className="mb-3 fw-bold">
                <FaMoneyBillWave style={{ marginRight: '5px' }} />
                Данные оплаты
              </h5>

              <Form.Group className="mb-3" controlId="formPaymentAmount">
                <Form.Label>Сумма</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handlePaymentChange}
                  required
                />
                <Form.Text className="text-muted">
                  Сумма не может быть меньше цены услуги (рекомендуемая: {paymentData.amount}).
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPaymentMethod">
                <Form.Label>Способ оплаты</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handlePaymentChange}
                  required
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Наличные</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid">
                <Button variant="success" type="submit" style={{ borderRadius: '25px', fontWeight: 'bold' }}>
                  <MdAssignmentAdd /> Создать и оплатить
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* --- Блок "Отзывы от всех клиентов" (виден клиентам) --- */}
        {user?.role === 'customer' && (
          <div className="mt-5 p-4" style={{ backgroundColor: '#ffffffdd', borderRadius: '15px' }}>
            <h4 className="fw-bold mb-3">
              Отзывы от всех клиентов <MdOutlineRateReview style={{ marginLeft: '8px' }} />
            </h4>
            {loadingFeedbacks ? (
              <div className="d-flex justify-content-center my-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </Spinner>
              </div>
            ) : feedbacksError ? (
              <div className="alert alert-danger">{feedbacksError}</div>
            ) : allFeedbacks.length === 0 ? (
              <p>Пока нет отзывов.</p>
            ) : (
              <Table striped bordered hover className="align-middle">
                <thead>
                  <tr>
                    <th>Рейтинг</th>
                    <th>Комментарий</th>
                    <th>Дата Записи (статус)</th>
                    <th>Услуга</th>
                    <th>Клиент</th>
                  </tr>
                </thead>
                <tbody>
                  {allFeedbacks.map((fb) => {
                    const appointment = fb.Appointment;
                    const service = appointment?.Service;
                    const customer = fb.Customer;
                    return (
                      <tr key={fb.id}>
                        <td>
                          <Badge bg="warning" text="dark" style={{ fontSize: '1rem' }}>
                            {fb.rating}
                          </Badge>
                        </td>
                        <td>{fb.comment || '—'}</td>
                        <td>
                          {appointment
                            ? new Date(appointment.appointmentDate).toLocaleString() +
                              ' (' + appointment.status + ')'
                            : '—'}
                        </td>
                        <td>{service ? service.name : '—'}</td>
                        <td>
                          {customer
                            ? `${customer.firstName} ${customer.lastName}`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;