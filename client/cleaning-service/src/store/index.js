// src/store/index.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        // Добавьте другие слайсы здесь, если необходимо
    },
});

export default store;