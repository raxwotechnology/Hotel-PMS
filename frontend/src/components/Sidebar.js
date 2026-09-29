// frontend/src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUser, 
  FaBed, 
  FaCalendarAlt, 
  FaFileInvoiceDollar,
  FaChartBar,
  FaPlane,
  FaReceipt,
  FaBroom,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const userRole = (user?.role || '').toLowerCase().trim();
  const isCustomerRole = userRole === 'customer';
  const STAFF_ROLES = ['admin', 'staff', 'manager', 'finance', 'housekeeping', 'maintenance'];
  const isStaffRole = STAFF_ROLES.includes(userRole);

  const menuSections = isCustomerRole
    ? [
        {
          title: 'Guest Portal',
          items: [
            { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
            { path: '/my-bookings', icon: <FaCalendarAlt />, label: 'My Reservations' },
            { path: '/profile', icon: <FaUser />, label: 'My Profile' },
          ]
        }
      ]
    : isStaffRole
    ? [
        {
          title: 'Main',
          items: [
            { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
          ]
        },
        {
          title: 'Operations',
          items: [
            { path: '/reservations', icon: <FaCalendarAlt />, label: 'Reservations' },
            { path: '/rooms', icon: <FaBed />, label: 'Rooms' },
            { path: '/housekeeping', icon: <FaBroom />, label: 'Housekeeping' },
            { path: '/guests', icon: <FaUser />, label: 'Guests' },
            { path: '/expenses', icon: <FaReceipt />, label: 'Guest Expenses' },
          ]
        },
        {
          title: 'Finance',
          items: [
            { path: '/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
            { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
          ]
        },
        {
          title: 'Partners',
          items: [
            { path: '/travel-agents', icon: <FaPlane />, label: 'Travel Agents' },
          ]
        },
        {
          title: 'Account',
          items: [
            { path: '/profile', icon: <FaUser />, label: 'My Profile' },
          ]
        }
      ]
    : [
        {
          title: 'Account',
          items: [
            { path: '/profile', icon: <FaUser />, label: 'My Profile' },
          ]
        }
      ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand" onClick={handleNavClick}>
            <div className="sidebar-logo">🏨</div>
            <div className="sidebar-brand-text">
              <span>HotelPMS</span>
              <span className="sidebar-brand-sub">Management System</span>
            </div>
          </Link>
        </div>

        <div className="sidebar-menu">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-user" onClick={handleNavClick} style={{ textDecoration: 'none', color: 'inherit' }} title="View Profile">
            <div className="sidebar-user-avatar">
              {getUserInitials()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </Link>
          <button onClick={logout} className="sidebar-logout-btn">
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;