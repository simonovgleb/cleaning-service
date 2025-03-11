// src/components/AdminRegister.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Spinner } from 'react-bootstrap';

// React Icons
import { FaUserShield, FaLock, FaUserPlus } from 'react-icons/fa';

const AdminRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  const { login, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerAdmin({ login, password })).unwrap();
      toast.success('Регистрация администратора прошла успешно! Пожалуйста, войдите в систему.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Не удалось зарегистрировать администратора');
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // --- Стили ---
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #6dd5ed, #2193b0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  };

  const cardStyle = {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.5s ease',
  };

  const cardHeaderStyle = {
    background: 'linear-gradient(135deg, #1abc9c, #2ecc71)',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
  };

  return (
    <div style={containerStyle}>
      <div className="col-md-6 col-lg-5">
        <div className="card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 className="fw-bold d-flex align-items-center justify-content-center gap-2 mb-0">
              <FaUserShield />
              Регистрация администратора
            </h3>
          </div>
          <div className="card-body p-4">
            <Form onSubmit={onSubmit}>
              {/* Логин */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Логин</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaUserPlus />
                  </span>
                  <Form.Control
                    type="text"
                    name="login"
                    value={login}
                    onChange={onChange}
                    required
                    placeholder="Введите логин"
                  />
                </div>
              </Form.Group>

              {/* Пароль */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Пароль</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaLock />
                  </span>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Введите пароль"
                  />
                </div>
              </Form.Group>

              {/* Кнопка регистрации */}
              <div className="d-grid">
                <Button
                  type="submit"
                  variant="success"
                  className="fw-bold"
                  style={{ borderRadius: '25px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{' '}
                      Регистрируем...
                    </>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;