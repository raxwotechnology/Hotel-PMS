// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🏨 Hotel Booking
          </Link>
          <div className="navbar-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/rooms" className="nav-link">Rooms</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                
                {isStaff && (
                  <>
                    <Link to="/admin/bookings" className="nav-link">Manage Bookings</Link>
                    <Link to="/admin/rooms" className="nav-link">Manage Rooms</Link>
                  </>
                )}
                
                <span className="nav-link">👤 {user?.name}</span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/register" className="btn btn-success">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;