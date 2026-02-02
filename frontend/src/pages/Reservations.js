// frontend/src/pages/Reservations.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { reservationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      let response;
      if (statusFilter === 'all') {
        response = await reservationAPI.getReservations();
      } else {
        response = await reservationAPI.getReservationsByStatus(statusFilter);
      }
      setReservations(response.data);
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    if (!window.confirm('Check in this guest?')) return;
    try {
      await reservationAPI.checkIn(id, { actualCheckInDate: new Date() });
      toast.success('Guest checked in successfully');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    if (!window.confirm('Check out this guest?')) return;
    try {
      const response = await reservationAPI.checkOut(id, { actualCheckOutDate: new Date() });
      
      if (response.data.invoice) {
        // If invoice was created, redirect to it for payment
        toast.success('Invoice generated. Please process payment.');
        navigate(`/invoices/${response.data.invoice._id}`);
      } else {
        toast.success('Guest checked out successfully');
        fetchReservations();
      }
    } catch (error) {
      if (error.response?.data?.invoiceId) {
        // Balance due - redirect to invoice
        toast.warning(error.response.data.error);
        navigate(`/invoices/${error.response.data.invoiceId}`);
      } else {
        toast.error(error.response?.data?.error || 'Check-out failed');
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Confirmed': 'badge-info',
      'Checked-In': 'badge-success',
      'Checked-Out': 'badge-secondary',
      'Cancelled': 'badge-danger',
      'No-Show': 'badge-warning'
    };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  const getSourceBadge = (source) => {
    return <span className="badge badge-secondary">{source}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Reservations</h1>
        <div className="topbar-actions">
          <button onClick={() => navigate('/reservations/new')} className="btn btn-primary">
            <FaPlus /> New Reservation
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="filters">
          <div className="filter-row">
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="all">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Checked-Out">Checked-Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="empty-state">
            <h3>No reservations found</h3>
            <p>Create a new reservation to get started</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reservation #</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td><strong>{reservation.reservationNumber}</strong></td>
                      <td>
                        {reservation.guest?.firstName} {reservation.guest?.lastName}
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {reservation.guest?.phone}
                        </div>
                      </td>
                      <td>
                        {reservation.room ? (
                          <>
                            {reservation.room.roomType}
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              Room {reservation.room.roomNumber}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#f59e0b' }}>Not Assigned</span>
                        )}
                      </td>
                      <td>{format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}</td>
                      <td>{format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}</td>
                      <td>{getSourceBadge(reservation.bookingSource)}</td>
                      <td>{getStatusBadge(reservation.status)}</td>
                      <td><strong>₹{reservation.totalAmount?.toLocaleString()}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => navigate(`/reservations/${reservation._id}`)}
                            className="btn btn-sm btn-outline"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          {reservation.status === 'Confirmed' && (
                            <button
                              onClick={() => handleCheckIn(reservation._id)}
                              className="btn btn-sm btn-success"
                              title="Check In"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {reservation.status === 'Checked-In' && (
                            <button
                              onClick={() => handleCheckOut(reservation._id)}
                              className="btn btn-sm btn-warning"
                              title="Check Out"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;