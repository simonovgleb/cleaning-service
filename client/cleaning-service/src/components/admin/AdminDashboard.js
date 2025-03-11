// src/components/admin/AdminDashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toast } from 'react-toastify';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// React Icons
import { 
  FaSignOutAlt, 
  FaUserTie, 
  FaTools, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaCommentDots, 
  FaUserShield 
} from 'react-icons/fa';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Обработчик выхода из системы
  const handleLogout = () => {
    dispatch(logout());
    toast.success('Вы успешно вышли из системы');
    navigate('/login');
  };

  // --- Стили ---
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #bdc3c7, #2c3e50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '800px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  };

  const cardHeaderStyle = {
    background: 'linear-gradient(135deg, #007bff, #00a8ff)',
    color: '#fff',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={containerStyle}>
      <div className="card" style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <FaUserShield />
            Административная панель
          </h2>
          <button 
            className="btn btn-danger d-flex align-items-center gap-2 fw-bold"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Выйти
          </button>
        </div>

        <div className="card-body p-4">
          {/* Навигация по разделам админского дашборда */}
          <nav className="mb-4">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <Link className="nav-link text-dark" style={navLinkStyle} to="/admin-employees">
                  <FaUserTie />
                  Управление сотрудниками
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" style={navLinkStyle} to="/admin-services">
                  <FaTools />
                  Управление услугами
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" style={navLinkStyle} to="/admin-appointments">
                  <FaClipboardList />
                  Управление записями
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" style={navLinkStyle} to="/admin-schedule">
                  <FaCalendarAlt />
                  Управление расписанием
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" style={navLinkStyle} to="/admin-feedback">
                  <FaCommentDots />
                  Управление отзывами
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;