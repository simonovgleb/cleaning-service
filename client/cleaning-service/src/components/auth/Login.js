// src/components/Login.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, loginCustomer, loginEmployee } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Spinner } from 'react-bootstrap';

// React Icons
import { FaSignInAlt, FaUser, FaLock, FaUserShield, FaUserTie } from 'react-icons/fa';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    login: '',
    password: '',
    role: 'customer', // роль по умолчанию
  });

  const { login, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onRoleChange = (e) =>
    setFormData({ ...formData, role: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (role === 'admin') {
      try {
        await dispatch(loginAdmin({ login, password })).unwrap();
        toast.success('Авторизация прошла успешно как администратор!');
        navigate('/admin-dashboard');
      } catch (err) {
        toast.error(err.message || 'Не удалось авторизоваться как администратор');
      }
    } else if (role === 'customer') {
      try {
        await dispatch(loginCustomer({ login, password })).unwrap();
        toast.success('Авторизация прошла успешно как клиент!');
        navigate('/home');
      } catch (err) {
        toast.error(err.message || 'Не удалось авторизоваться как клиент');
      }
    } else if (role === 'employee') {
      try {
        await dispatch(loginEmployee({ login, password })).unwrap();
        toast.success('Авторизация прошла успешно как сотрудник!');
        navigate('/employee-dashboard');
      } catch (err) {
        toast.error(err.message || 'Не удалось авторизоваться как сотрудник');
      }
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
    background: 'linear-gradient(to right, #f1f2b5, #135058)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  };

  const cardStyle = {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.5s ease',
  };

  const cardHeaderStyle = {
    background: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
  };

  const iconStyle = {
    marginRight: '8px',
  };

  return (
    <div style={containerStyle}>
      <div className="col-md-4">
        <div className="card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 className="fw-bold">
              <FaSignInAlt style={iconStyle} />
              Авторизация
            </h3>
          </div>
          <div className="card-body p-4">
            <Form onSubmit={onSubmit}>
              {/* Роль пользователя */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Роль:</Form.Label>
                <Form.Select
                  name="role"
                  value={role}
                  onChange={onRoleChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="customer">Клиент</option>
                  <option value="admin">Администратор</option>
                  <option value="employee">Сотрудник</option>
                </Form.Select>
              </Form.Group>

              {/* Логин */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Логин:
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaUser />
                  </span>
                  <Form.Control
                    type="text"
                    name="login"
                    value={login}
                    onChange={onChange}
                    required
                    placeholder="Введите ваш логин"
                  />
                </div>
              </Form.Group>

              {/* Пароль */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Пароль:
                </Form.Label>
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
                    placeholder="Введите ваш пароль"
                  />
                </div>
              </Form.Group>

              {/* Кнопка отправки */}
              <div className="d-grid">
                <Button
                  variant="dark"
                  type="submit"
                  className="fw-bold"
                  disabled={loading}
                  style={{ borderRadius: '25px' }}
                >
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <>
                      <FaSignInAlt style={{ marginRight: '6px' }} />
                      Войти
                    </>
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

export default Login;