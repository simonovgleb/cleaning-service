// src/components/Register.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Spinner } from 'react-bootstrap';

// React Icons
import {
    FaUserPlus,
    FaUser,
    FaLock,
    FaPhone,
    FaMapMarkerAlt,
    FaIdCard
} from 'react-icons/fa';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
    });

    const { login, password, firstName, lastName, phoneNumber, address } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(registerUser({
                login,
                password,
                firstName,
                lastName,
                phoneNumber,
                address
            })).unwrap();
            toast.success('Регистрация прошла успешно! Пожалуйста, войдите в систему.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Не удалось зарегистрироваться');
        }
    };

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // -- Стили для фона и карточки --
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(to right, #6a82fb, #fc5c7d)',
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
        background: 'linear-gradient(135deg, #007bff, #00a8ff)',
        color: '#fff',
        textAlign: 'center',
        padding: '20px',
    };

    const labelStyle = {
        fontWeight: '600',
    };

    const iconBoxStyle = {
        minWidth: '45px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <div style={containerStyle}>
            <div className="col-md-6 col-lg-5">
                <div className="card" style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <h3 className="fw-bold">
                            <FaUserPlus style={{ marginRight: '8px' }} />
                            Регистрация клиента
                        </h3>
                    </div>
                    <div className="card-body p-4">
                        <Form onSubmit={onSubmit}>
                            {/* Логин */}
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Логин:</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white" style={iconBoxStyle}>
                                        <FaUser />
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
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Пароль:</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white" style={iconBoxStyle}>
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

                            {/* Имя */}
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Имя:</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white" style={iconBoxStyle}>
                                        <FaIdCard />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={firstName}
                                        onChange={onChange}
                                        required
                                        placeholder="Введите ваше имя"
                                    />
                                </div>
                            </Form.Group>

                            {/* Фамилия */}
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Фамилия:</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white" style={iconBoxStyle}>
                                        <FaIdCard />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={lastName}
                                        onChange={onChange}
                                        required
                                        placeholder="Введите вашу фамилию"
                                    />
                                </div>
                            </Form.Group>

                            {/* Номер телефона */}
                            <Form.Group className="mb-3">
                                <Form.Label style={labelStyle}>Номер телефона:</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white" style={iconBoxStyle}>
                                        <FaPhone />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        name="phoneNumber"
                                        value={phoneNumber}
                                        onChange={onChange}
                                        placeholder="Например +7 (___) ___-__-__"
                                    />
                                </div>
                            </Form.Group>

                            {/* Адрес */}
                            <Form.Group className="mb-4">
                                <Form.Label style={labelStyle}>Адрес:</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white" style={iconBoxStyle}>
                                        <FaMapMarkerAlt />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={address}
                                        onChange={onChange}
                                        placeholder="Ваш адрес"
                                    />
                                </div>
                            </Form.Group>

                            {/* Кнопка отправки */}
                            <div className="d-grid">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="fw-bold"
                                    style={{ borderRadius: '25px' }}
                                    disabled={loading}
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
                                            <FaUserPlus style={{ marginRight: '6px' }} />
                                            Зарегистрироваться
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

export default Register;