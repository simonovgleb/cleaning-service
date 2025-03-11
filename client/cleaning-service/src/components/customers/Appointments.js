// src/components/Appointments.js

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import {
  Spinner,
  Table,
  Button,
  Modal,
  Badge,
  OverlayTrigger,
  Tooltip,
  Form
} from 'react-bootstrap';
import moment from 'moment';

// React Icons
import {
  FaInfoCircle,
  FaTrashAlt,
  FaCommentDots,
  FaTimes,
  FaCheck,
} from 'react-icons/fa';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Модалка для деталей
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Модалка для подтверждения отмены
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Модалка для оставления отзыва
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // ===========================
  // Загрузка записей
  // ===========================
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке записей:', err);
      setError('Не удалось загрузить записи. Попробуйте позже.');
      toast.error('Не удалось загрузить записи.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  // ===========================
  // Модалка "Подробнее"
  // ===========================
  const handleShowDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  // ===========================
  // Модалка "Отменить запись"
  // ===========================
  const handleShowCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleCloseCancel = () => {
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setCancelling(true);
    try {
      await axiosInstance.delete(`/appointments/${selectedAppointment.id}`);
      toast.success('Запись успешно отменена.');
      fetchAppointments();
      handleCloseCancel();
    } catch (err) {
      console.error('Ошибка при отмене записи:', err);
      const message =
        err.response?.data?.message || 'Произошла ошибка при отмене записи.';
      toast.error(`Ошибка: ${message}`);
    } finally {
      setCancelling(false);
    }
  };

  // ===========================
  // Модалка "Оставить отзыв"
  // ===========================
  const handleShowFeedback = (appointment) => {
    setSelectedAppointment(appointment);
    setFeedback({ rating: 5, comment: '' }); // Сброс значений формы
    setShowFeedbackModal(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
    setSelectedAppointment(null);
    setFeedback({ rating: 5, comment: '' }); // Сброс значений формы
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedAppointment) return;
    setSubmittingFeedback(true);

    try {
      await axiosInstance.post('/feedbacks', {
        appointmentId: selectedAppointment.id,
        rating: feedback.rating,
        comment: feedback.comment
      });

      toast.success('Отзыв успешно добавлен!');
      handleCloseFeedback();
      // Обновить список, чтобы отзыв отобразился
      fetchAppointments();
    } catch (err) {
      console.error('Ошибка при создании отзыва:', err);
      const message =
        err.response?.data?.message || 'Произошла ошибка при создании отзыва.';
      toast.error(`Ошибка: ${message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // ===========================
  // Badge для статуса записи
  // ===========================
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // ===========================
  // Стили для «ВАУ»-эффекта
  // ===========================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
    padding: '40px 20px'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    padding: '20px'
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={cardStyle}>
          <h2 className="mb-4 text-center fw-bold" style={{ letterSpacing: '1px' }}>
            Мои Записи
          </h2>

          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : appointments.length === 0 ? (
            <div className="alert alert-info" role="alert">
              У вас пока нет записей. Вы можете{' '}
              <a href="/dashboard" style={{ textDecoration: 'underline' }}>
                создать новую запись
              </a>
              .
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Дата и Время</th>
                    <th>Услуга</th>
                    <th>Сотрудник</th>
                    <th>Статус</th>
                    <th>Оплата</th>
                    <th>Отзыв</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => {
                    // Отзыв
                    const feedbackItem =
                      appointment.Feedbacks && appointment.Feedbacks.length > 0
                        ? appointment.Feedbacks[0]
                        : null;

                    // Оплата
                    const paymentItem = appointment.Payment || null;

                    return (
                      <tr
                        key={appointment.id}
                        className={
                          appointment.status === 'Cancelled'
                            ? 'table-danger'
                            : appointment.status === 'Completed'
                            ? 'table-success'
                            : ''
                        }
                      >
                        <td>{appointment.id}</td>
                        <td>
                          {moment(appointment.appointmentDate).format('DD.MM.YYYY HH:mm')}
                        </td>
                        <td>{appointment.Service?.name}</td>
                        <td>
                          {appointment.Employee
                            ? `${appointment.Employee.firstName} ${appointment.Employee.lastName}`
                            : 'Не назначен'}
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </td>

                        {/* Оплата */}
                        <td>
                          {paymentItem ? (
                            <>
                              <div>
                                <strong>Статус: </strong>
                                {paymentItem.status}
                              </div>
                              <div>
                                <strong>Сумма: </strong>
                                {paymentItem.amount} ₽
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#aaa' }}>Нет оплаты</span>
                          )}
                        </td>

                        {/* Отзыв */}
                        <td>
                          {feedbackItem ? (
                            <div>
                              <strong>Рейтинг: </strong>
                              {feedbackItem.rating}
                              <br />
                              <strong>Комментарий: </strong>
                              {feedbackItem.comment}
                            </div>
                          ) : (
                            <span style={{ color: '#aaa' }}>Нет отзыва</span>
                          )}
                        </td>

                        {/* Действия */}
                        <td>
                          {/* "Подробнее" */}
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Подробнее</Tooltip>}
                          >
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2 d-flex align-items-center gap-1"
                              onClick={() => handleShowDetails(appointment)}
                            >
                              <FaInfoCircle />
                            </Button>
                          </OverlayTrigger>

                          {/* "Отменить" (только если Scheduled) */}
                          {appointment.status === 'Scheduled' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Отменить</Tooltip>}
                            >
                              <Button
                                variant="danger"
                                size="sm"
                                className="d-flex align-items-center gap-1"
                                onClick={() => handleShowCancel(appointment)}
                              >
                                <FaTrashAlt />
                              </Button>
                            </OverlayTrigger>
                          )}

                          {/* "Оставить отзыв" (если Completed и нет отзыва) */}
                          {appointment.status === 'Completed' && !feedbackItem && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Оставить отзыв</Tooltip>}
                            >
                              <Button
                                variant="primary"
                                size="sm"
                                className="ms-2 d-flex align-items-center gap-1"
                                onClick={() => handleShowFeedback(appointment)}
                              >
                                <FaCommentDots />
                              </Button>
                            </OverlayTrigger>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* ===========================
          Модальное окно "Подробнее"
         =========================== */}
      <Modal show={showDetailsModal} onHide={handleCloseDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Подробности Записи</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <p>
                <strong>ID Записи:</strong> {selectedAppointment.id}
              </p>
              <p>
                <strong>Дата и Время:</strong>{' '}
                {moment(selectedAppointment.appointmentDate).format('DD.MM.YYYY HH:mm')}
              </p>
              <p>
                <strong>Услуга:</strong> {selectedAppointment.Service?.name}
              </p>
              <p>
                <strong>Описание Услуги:</strong>{' '}
                {selectedAppointment.Service?.description || 'Нет описания.'}
              </p>
              <p>
                <strong>Цена:</strong>{' '}
                {Number(selectedAppointment.Service?.price).toFixed(2)} ₽
              </p>
              <p>
                <strong>Длительность:</strong>{' '}
                {selectedAppointment.Service?.duration} мин
              </p>
              <p>
                <strong>Сотрудник:</strong>{' '}
                {selectedAppointment.Employee
                  ? `${selectedAppointment.Employee.firstName} ${selectedAppointment.Employee.lastName}`
                  : 'Не назначен'}
              </p>
              <p>
                <strong>Статус:</strong>{' '}
                <Badge bg={getStatusVariant(selectedAppointment.status)}>
                  {selectedAppointment.status}
                </Badge>
              </p>

              {/* Информация о платеже (если есть) */}
              {selectedAppointment.Payment && (
                <div className="mt-3 p-2 border rounded">
                  <h5>Оплата</h5>
                  <p>
                    <strong>Статус оплаты: </strong>
                    {selectedAppointment.Payment.status}
                  </p>
                  <p>
                    <strong>Сумма: </strong>
                    {selectedAppointment.Payment.amount} ₽
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            <FaTimes style={{ marginRight: '6px' }} />
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===========================
          Модальное окно "Отменить"
         =========================== */}
      <Modal show={showCancelModal} onHide={handleCloseCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Отменить Запись</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <p>
              Вы уверены, что хотите отменить запись на{' '}
              <strong>{selectedAppointment.Service?.name}</strong> (
              {moment(selectedAppointment.appointmentDate).format('DD.MM.YYYY HH:mm')})?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCancel}>
            <FaTimes style={{ marginRight: '6px' }} />
            Отмена
          </Button>
          <Button variant="danger" onClick={handleCancelAppointment} disabled={cancelling}>
            {cancelling ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Отмена...
              </>
            ) : (
              <>
                <FaCheck style={{ marginRight: '6px' }} />
                Отменить
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===========================
          Модальное окно "Отзыв"
         =========================== */}
      <Modal show={showFeedbackModal} onHide={handleCloseFeedback} centered>
        <Modal.Header closeButton>
          <Modal.Title>Оставить отзыв</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <>
              <p>
                <strong>Услуга: </strong>
                {selectedAppointment.Service?.name} (
                {moment(selectedAppointment.appointmentDate).format('DD.MM.YYYY HH:mm')})
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Рейтинг</Form.Label>
                <Form.Select
                  value={feedback.rating}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      rating: Number(e.target.value)
                    }))
                  }
                >
                  {[1, 2, 3, 4, 5].map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Комментарий</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      comment: e.target.value
                    }))
                  }
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFeedback}>
            <FaTimes style={{ marginRight: '6px' }} />
            Отмена
          </Button>
          <Button variant="success" onClick={handleFeedbackSubmit} disabled={submittingFeedback}>
            {submittingFeedback ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Сохранение...
              </>
            ) : (
              <>
                <FaCheck style={{ marginRight: '6px' }} />
                Сохранить отзыв
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Appointments;
