// src/store/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosConfig';

// Асинхронные экшены для регистрации
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ login, password, firstName, lastName, phoneNumber, address }, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/customers/registration', {
                login,
                password,
                firstName,
                lastName,
                phoneNumber,
                address,
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const registerAdmin = createAsyncThunk(
    'auth/registerAdmin',
    async ({ login, password }, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/admins/registration', {
                login,
                password,
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Асинхронные экшены для логина
export const loginAdmin = createAsyncThunk(
    'auth/loginAdmin',
    async ({ login, password }, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/admins/login', { login, password });
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const loginCustomer = createAsyncThunk(
    'auth/loginCustomer',
    async ({ login, password }, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/customers/login', { login, password });
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Новый асинхронный экшен для логина сотрудника
export const loginEmployee = createAsyncThunk(
    'auth/loginEmployee',
    async ({ login, password }, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/employees/login', { login, password });
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Асинхронный экшен для выхода из системы
export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('token');
});

// Новый асинхронный экшен для проверки аутентификации
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, thunkAPI) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return thunkAPI.rejectWithValue('No token found');
        }

        try {
            // Попробуем проверить как администратор
            const adminResponse = await axiosInstance.get('/admins/auth', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (adminResponse.data.user) {
                return { user: adminResponse.data.user, token };
            }
        } catch (error) {
            // Не удалось проверить как администратор, продолжим
        }

        try {
            // Попробуем проверить как клиент
            const customerResponse = await axiosInstance.get('/customers/auth', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (customerResponse.data.user) {
                return { user: customerResponse.data.user, token };
            }
        } catch (error) {
            // Не удалось проверить как клиент, продолжим
        }

        try {
            // Попробуем проверить как сотрудник
            const employeeResponse = await axiosInstance.get('/employees/auth', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (employeeResponse.data.user) {
                return { user: employeeResponse.data.user, token };
            }
        } catch (error) {
            // Не удалось проверить как сотрудник
        }

        // Если ни один из запросов не удался
        return thunkAPI.rejectWithValue('Invalid token');
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Можно добавить синхронные экшены здесь, если необходимо
    },
    extraReducers: (builder) => {
        // Регистрация пользователя
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            // Можно автоматически авторизовать пользователя после регистрации, если необходимо
            // state.user = action.payload;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || 'Не удалось зарегистрировать пользователя';
        });

        // Регистрация администратора
        builder.addCase(registerAdmin.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerAdmin.fulfilled, (state, action) => {
            state.loading = false;
            // Аналогично, можно автоматически авторизовать администратора
            // state.user = action.payload;
        });
        builder.addCase(registerAdmin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || 'Не удалось зарегистрировать администратора';
        });

        // Логин администратора
        builder.addCase(loginAdmin.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginAdmin.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(loginAdmin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || 'Не удалось авторизоваться как администратор';
        });

        // Логин клиента
        builder.addCase(loginCustomer.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginCustomer.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(loginCustomer.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || 'Не удалось авторизоваться как клиент';
        });

        // Логин сотрудника
        builder.addCase(loginEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginEmployee.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(loginEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message || 'Не удалось авторизоваться как сотрудник';
        });

        // Выход из системы
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.token = null;
        });

        // Проверка аутентификации
        builder.addCase(checkAuth.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(checkAuth.rejected, (state, action) => {
            state.loading = false;
            state.user = null;
            state.token = null;
            state.error = action.payload || 'Не удалось проверить аутентификацию';
        });
    },
});

export default authSlice.reducer;
