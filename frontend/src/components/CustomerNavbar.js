// frontend/src/components/CustomerNavbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHotel, FaBars, FaTimes, FaSignOutAlt, FaCalendarCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CustomerNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserInitials = () => {
    if (!user?.name) return 'G';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="portal-navbar">
      <div className="portal-navbar-inner">
        {/* Brand Crest */}
        <Link to="/customer-home" className="portal-brand" onClick={handleLinkClick}>
          <div className="portal-brand-crest">
            <FaHotel />
          </div>
          <div className="portal-brand-text">
            <div className="portal-brand-name">
              Hotel<span>PMS</span>
            </div>
            <div className="portal-brand-tagline">
              Luxury Hospitality Suite
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="portal-nav-links">
          <li className="portal-nav-item">
            <Link to="/customer-home" className={isActive('/customer-home') ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li className="portal-nav-item">
            <a href="/customer-home#rooms">
              Rooms
            </a>
          </li>
          <li className="portal-nav-item">
            <a href="/customer-home#about">
              About
            </a>
          </li>
          <li className="portal-nav-item">
            <Link to="/my-bookings" className={isActive('/my-bookings') ? 'active' : ''}>
              My Reservations
            </Link>
          </li>
          <li className="portal-nav-item">
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
              My Profile
            </Link>
          </li>
        </ul>

        {/* Actions & User Profile */}
        <div className="portal-nav-actions">
          <a href="/customer-home#rooms" className="portal-btn-book">
            <FaCalendarCheck />
            <span>Book Now</span>
          </a>

          {/* User Profile Pill */}
          <Link to="/profile" className="portal-user-badge" title="View Profile">
            <div className="portal-avatar-circle">
              {getUserInitials()}
            </div>
            <span className="portal-user-name">
              {user?.name?.split(' ')[0] || 'Guest'}
            </span>
          </Link>

          {/* Logout Button */}
          <button 
            type="button" 
            onClick={logout} 
            className="portal-btn-logout" 
            title="Sign Out"
            aria-label="Sign Out"
          >
            <FaSignOutAlt />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="portal-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`portal-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/customer-home" onClick={handleLinkClick}>Home</Link>
        <a href="/customer-home#rooms" onClick={handleLinkClick}>Explore Rooms</a>
        <a href="/customer-home#about" onClick={handleLinkClick}>About Our Hotel</a>
        <Link to="/my-bookings" onClick={handleLinkClick}>My Reservations</Link>
        <Link to="/profile" onClick={handleLinkClick}>My Profile</Link>
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={logout} 
            className="btn btn-outline btn-sm" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
