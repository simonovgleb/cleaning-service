// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { toast } from 'react-toastify';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Badge } from 'react-bootstrap';

// React-icons
import { 
  FaSignOutAlt, 
  FaUserAlt, 
  FaClipboardList, 
  FaUserShield, 
  FaUserTie, 
  FaHome, 
  FaUserPlus, 
  FaUserLock,
  FaCashRegister
} from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Вы успешно вышли из системы');
    navigate('/login');
  };

  // Вариант для стилизации через inline-объекты
  const navLinkStyle = {
    transition: 'transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const navLinkHover = {
    transform: 'scale(1.05)',
  };

  // Для использования hover-эффектов прямо в компоненте, 
  // можно либо применить CSS-классы, либо воспользоваться 
  // «onMouseEnter/onMouseLeave» и управлять состоянием.
  // Ниже — упрощённый пример с псевдоклассом :hover в CSS.
  // Здесь же ограничимся style={{ ...navLinkStyle }}

  return (
    <nav className="navbar navbar-expand-lg" 
      style={{
        background: 'linear-gradient(to right, #2c3e50, #4ca1af)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }}
    >
      <div className="container">
        {/* Бренд и логотип */}
        <Link
          className="navbar-brand fw-bold text-white"
          to="/"
          style={{ 
            fontSize: '1.5rem',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Можно вставить иконку «Cleaning» или что-то своё, 
              но здесь для примера вставляем обычную */}
          <FaHome />
          Fatal-Cleaning
        </Link>

        {/* Кнопка тогглера (для мобильных устройств) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: '#ccc' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Основной блок навигации */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Если нет token, значит пользователь не авторизован */}
            {!token ? (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link text-white"
                    to="/register"
                    style={navLinkStyle}
                  >
                    <FaUserPlus />
                    Регистрация клиента
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link text-white"
                    to="/admin-register"
                    style={navLinkStyle}
                  >
                    <FaCashRegister />
                    Регистрация администратора
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link text-white"
                    to="/login"
                    style={navLinkStyle}
                  >
                    <FaUserLock />
                    Авторизация
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Ссылки зависят от роли пользователя */}
                {user?.role === 'customer' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white"
                      to="/appointments"
                      style={navLinkStyle}
                    >
                      <FaClipboardList />
                      Мои Записи
                    </Link>
                  </li>
                )}

                {user?.role === 'admin' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white"
                      to="/admin-dashboard"
                      style={navLinkStyle}
                    >
                      <FaUserShield />
                      Админ Дашборд
                    </Link>
                  </li>
                )}

                {user?.role === 'customer' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white"
                      to="/home"
                      style={navLinkStyle}
                    >
                      <FaHome />
                      Главная
                    </Link>
                  </li>
                )}

                {user?.role === 'employee' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white"
                      to="/employee-dashboard"
                      style={navLinkStyle}
                    >
                      <FaUserTie />
                      Дашборд сотрудника
                    </Link>
                  </li>
                )}

                {/* Приветствие + роль (optional) */}
                <li className="nav-item">
                  <span
                    className="nav-link text-white d-flex align-items-center"
                    style={{ cursor: 'default', gap: '5px' }}
                  >
                    <FaUserAlt />
                    {user?.firstName ? `Привет, ${user.firstName}` : user?.login}
                    {user?.role && (
                      <Badge
                        bg="warning"
                        text="dark"
                        className="ms-2"
                      >
                        {user.role}
                      </Badge>
                    )}
                  </span>
                </li>

                {/* Кнопка «Выйти» */}
                <li className="nav-item">
                  <Button
                    variant="link"
                    onClick={handleLogout}
                    className="nav-link text-white"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FaSignOutAlt />
                    Выйти
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;