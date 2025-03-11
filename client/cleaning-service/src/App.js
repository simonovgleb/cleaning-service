// src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/auth/Register';
import AdminRegister from './components/admin/AdminRegister';
import Login from './components/auth/Login';
import Home from './components/customers/Home';
import AdminDashboard from './components/admin/AdminDashboard';
import EmployeeDashboard from './components/employ/EmployeeDashboard';
import EmployeesManagement from './components/admin/EmployeesManagement';
import ServicesManagement from './components/admin/ServicesManagement';
import AdminAppointments from './components/admin/AdminAppointments'; // Импортируем новый компонент
import Appointments from './components/customers/Appointments'; // Импортируем компонент для клиентов
import AdminScheduleManagement from './components/admin/AdminScheduleManagement';
import AdminFeedbackManagement from './components/admin/AdminFeedbackManagement';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDispatch } from 'react-redux';
import { checkAuth } from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Header />
          <Routes>
            <Route
              path="/"
              element={<h2 className="text-center">Добро пожаловать в систему управления!</h2>}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/login" element={<Login />} />

            {/* Защищённые маршруты */}
            <Route
              path="/home"
              element={
                <PrivateRoute roles={['customer']}>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-employees"
              element={
                <PrivateRoute roles={['admin']}>
                  <EmployeesManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-services"
              element={
                <PrivateRoute roles={['admin']}>
                  <ServicesManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-appointments"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminAppointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-schedule"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminScheduleManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-feedback"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminFeedbackManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute roles={['employee']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />

            {/* Новый защищённый маршрут для записей клиентов и админов */}
            <Route
              path="/appointments"
              element={
                <PrivateRoute roles={['customer', 'admin']}>
                  <Appointments />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<h2 className="text-center">Страница не найдена</h2>} />
          </Routes>
        </div>
        <ToastContainer />
    </Router>
  );
}

export default App;