// src/components/AdminFeedbackManagement.js

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

// React Icons
import { 
  FaEdit, 
  FaTrash, 
  FaStar 
} from 'react-icons/fa';

const RATING_OPTIONS = [1, 2, 3, 4, 5];

const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Модалка для редактирования отзыва
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // Загрузка всех отзывов
  // =========================
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/feedbacks');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setError('Не удалось загрузить отзывы.');
      toast.error('Не удалось загрузить отзывы.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // =========================
  // Открыть/закрыть модалку редактирования
  // =========================
  const handleShowModal = (feedback) => {
    setSelectedFeedback(feedback);
    setFormData({
      rating: feedback.rating,
      comment: feedback.comment || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
    setFormData({ rating: 5, comment: '' });
  };

  // =========================
  // Сабмит формы (редактирование отзыва)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setSubmitting(true);
    try {
      await axiosInstance.put(`/feedbacks/${selectedFeedback.id}`, {
        rating: Number(formData.rating),
        comment: formData.comment,
      });
      toast.success('Отзыв успешно обновлён!');
      handleCloseModal();
      fetchFeedbacks();
    } catch (err) {
      console.error('Ошибка при обновлении отзыва:', err);
      toast.error('Не удалось обновить отзыв.');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Удаление отзыва
  // =========================
  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Вы действительно хотите удалить этот отзыв?')) return;
    try {
      await axiosInstance.delete(`/feedbacks/${feedbackId}`);
      toast.success('Отзыв успешно удалён!');
      fetchFeedbacks();
    } catch (err) {
      console.error('Ошибка при удалении отзыва:', err);
      toast.error('Не удалось удалить отзыв.');
    }
  };

  // =========================
  // Стили для «ВАУ»-эффекта
  // =========================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdfcfb, #e2d1c3)',
    padding: '40px 20px',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '15px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '30px',
  };

  const ratingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  // Функция для отображения рейтинга «звёздочками», если хотите
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <FaStar key={i} style={{ color: '#FFD700' }} />
      );
    }
    return stars;
  };

  return (
    <div style={containerStyle}>
      <div className="container">
        <div style={cardStyle}>
          <h2 className="fw-bold mb-4">Управление Отзывами (Администратор)</h2>

          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : feedbacks.length === 0 ? (
            <p>Отзывов нет.</p>
          ) : (
            <Table bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Рейтинг</th>
                  <th>Комментарий</th>
                  <th>Запись</th>
                  <th>Услуга</th>
                  <th>Клиент</th>
                  <th>Сотрудник</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb) => {
                  const appointment = fb.Appointment;
                  const service = appointment?.Service;
                  const customer = fb.Customer;
                  const employee = fb.Employee;

                  return (
                    <tr key={fb.id}>
                      <td>{fb.id}</td>
                      <td>
                        {/* Отобразим звёздочки + числовое значение (по желанию) */}
                        <div style={ratingStyle}>
                          {renderStars(fb.rating)}
                          <Badge bg="warning" text="dark">
                            {fb.rating}
                          </Badge>
                        </div>
                      </td>
                      <td>{fb.comment || '—'}</td>
                      <td>
                        {appointment
                          ? new Date(appointment.appointmentDate).toLocaleString() +
                            ` (${appointment.status})`
                          : '—'}
                      </td>
                      <td>
                        {service ? service.name : '—'}
                      </td>
                      <td>
                        {customer
                          ? `${customer.firstName} ${customer.lastName}`
                          : '—'}
                      </td>
                      <td>
                        {employee
                          ? `${employee.firstName} ${employee.lastName}`
                          : '—'}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2 d-flex align-items-center gap-1"
                          onClick={() => handleShowModal(fb)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => handleDelete(fb.id)}
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

          {/* Модальное окно редактирования отзыва */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Редактировать Отзыв</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedFeedback && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Рейтинг</Form.Label>
                    <Form.Select
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rating: e.target.value,
                        }))
                      }
                    >
                      {RATING_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Комментарий</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.comment}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                      className="fw-bold"
                    >
                      {submitting ? 'Сохранение...' : 'Сохранить'}
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

export default AdminFeedbackManagement;