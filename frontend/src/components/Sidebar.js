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
  FaUsers,
  FaPlane,
  FaReceipt,
  FaBroom,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/reservations', icon: <FaCalendarAlt />, label: 'Reservations' },
    { path: '/guests', icon: <FaUser />, label: 'Guests' },
    { path: '/rooms', icon: <FaBed />, label: 'Rooms' },
    { path: '/expenses', icon: <FaReceipt />, label: 'Guest Expenses' },
    { path: '/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
    { path: '/travel-agents', icon: <FaPlane />, label: 'Travel Agents' },
    { path: '/housekeeping', icon: <FaBroom />, label: 'Housekeeping' },
    // { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand">
          🏨 HotelPMS
        </Link>
      </div>

      <div className="sidebar-menu">
        <div className="sidebar-section">Main Menu</div>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
          <strong>{user?.name}</strong>
          <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </div>
        </div>
        <button onClick={logout} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;