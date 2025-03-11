// src/api/axiosConfig.js

import axios from 'axios';

// Создаём экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик запросов для добавления токена авторизации
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
