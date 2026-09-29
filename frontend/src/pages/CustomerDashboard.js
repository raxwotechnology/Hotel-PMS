// frontend/src/pages/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaBed, 
  FaArrowRight, 
  FaCheckCircle, 
  FaClock, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load my bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const checkIn = new Date(b.checkInDate);
    return checkIn >= today && b.bookingStatus !== 'cancelled';
  });

  const previousBookings = bookings.filter(b => {
    const checkIn = new Date(b.checkInDate);
    return checkIn < today || b.bookingStatus === 'checked-out' || b.bookingStatus === 'cancelled';
  });

  const getStatusBadge = (status) => {
    const map = {
      confirmed: 'badge-success',
      'checked-in': 'badge-info',
      'checked-out': 'badge-warning',
      cancelled: 'badge-danger'
    };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
  };

  return (
    <div className="content-wrapper">
      {/* Welcome Banner */}
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name || 'Valued Guest'}</h1>
        <p>Manage your reservations, view stay history, and update your profile details.</p>
      </div>

      {/* Overview Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Reservations</div>
            <div className="stat-value">{bookings.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-label">Upcoming Stays</div>
            <div className="stat-value">{upcomingBookings.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accent">
            <FaUser />
          </div>
          <div className="stat-content">
            <div className="stat-label">Account Role</div>
            <div className="stat-value" style={{ textTransform: 'capitalize', fontSize: '1.25rem' }}>
              {user?.role || 'Customer'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Profile Summary Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <FaUser style={{ color: 'var(--color-primary)' }} />
              My Profile
            </h2>
            <Link to="/profile" className="btn btn-outline btn-sm">
              Edit Profile
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaUser style={{ color: 'var(--text-muted)' }} />
                <span><strong>Full Name:</strong> {user?.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaEnvelope style={{ color: 'var(--text-muted)' }} />
                <span><strong>Email:</strong> {user?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaPhone style={{ color: 'var(--text-muted)' }} />
                <span><strong>Phone:</strong> {user?.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaMapMarkerAlt style={{ color: 'var(--text-muted)' }} />
                <span><strong>Address:</strong> {user?.address || 'Not provided'}</span>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/profile" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                View & Change Password
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions-grid">
              <Link to="/my-bookings" className="quick-action-card">
                <div className="quick-action-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                  <FaCalendarAlt />
                </div>
                My Reservations
              </Link>
              <Link to="/profile" className="quick-action-card">
                <div className="quick-action-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                  <FaUser />
                </div>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Reservations List */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FaBed style={{ color: 'var(--color-primary)' }} />
            Upcoming Reservations
          </h2>
          <Link to="/my-bookings" className="btn btn-outline btn-sm">
            View All ({bookings.length})
          </Link>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading reservations...
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>You have no upcoming reservations.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                When you make a reservation with our hotel, it will appear here.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Type</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map((b) => (
                    <tr key={b._id}>
                      <td><strong>{b.room?.roomType || 'Standard Room'}</strong></td>
                      <td>{format(new Date(b.checkInDate), 'MMM d, yyyy')}</td>
                      <td>{format(new Date(b.checkOutDate), 'MMM d, yyyy')}</td>
                      <td>{b.numberOfGuests} Guests</td>
                      <td>Rs. {b.totalPrice?.toLocaleString() || 0}</td>
                      <td>{getStatusBadge(b.bookingStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Previous Stays Section */}
      {previousBookings.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Previous Stays ({previousBookings.length})</h2>
          </div>
          <div className="card-body">
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Type</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previousBookings.slice(0, 5).map((b) => (
                    <tr key={b._id}>
                      <td>{b.room?.roomType || 'Room'}</td>
                      <td>
                        {format(new Date(b.checkInDate), 'MMM d, yyyy')} — {format(new Date(b.checkOutDate), 'MMM d, yyyy')}
                      </td>
                      <td>Rs. {b.totalPrice?.toLocaleString() || 0}</td>
                      <td>{getStatusBadge(b.bookingStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
