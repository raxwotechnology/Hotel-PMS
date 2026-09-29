// frontend/src/pages/Reservations.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaCheck, FaTimes, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { reservationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
        toast.success('Invoice generated. Please process payment.');
        navigate(`/invoices/${response.data.invoice._id}`);
      } else {
        toast.success('Guest checked out successfully');
        fetchReservations();
      }
    } catch (error) {
      if (error.response?.data?.invoiceId) {
        toast.warning(error.response.data.error);
        navigate(`/invoices/${error.response.data.invoiceId}`);
      } else {
        toast.error(error.response?.data?.error || 'Check-out failed');
      }
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.reservationNumber?.toLowerCase().includes(term) ||
      r.guest?.firstName?.toLowerCase().includes(term) ||
      r.guest?.lastName?.toLowerCase().includes(term) ||
      r.guest?.phone?.includes(term) ||
      r.room?.roomNumber?.includes(term)
    );
  });

  return (
    <div>
      <div className="content-wrapper">
        <PageHeader 
          title="Reservations" 
          subtitle="Manage bookings, arrivals, departures and guest stays."
        >
          <button onClick={() => navigate('/reservations/new')} className="btn btn-primary">
            <FaPlus /> New Reservation
          </button>
        </PageHeader>

        {/* Filters */}
        <div className="filters">
          <div className="filter-row">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search reservation, guest or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '180px' }}
            >
              <option value="all">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Checked-Out">Checked-Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : filteredReservations.length === 0 ? (
          <EmptyState 
            icon={FaCalendarAlt}
            title="No reservations found"
            message={searchTerm ? "Try adjusting your search or filters." : "Create a new reservation to get started."}
            action={
              !searchTerm && (
                <button onClick={() => navigate('/reservations/new')} className="btn btn-primary">
                  <FaPlus /> New Reservation
                </button>
              )
            }
          />
        ) : (
          <div className="card" style={{ marginBottom: 0 }}>
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
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td><strong>{reservation.reservationNumber}</strong></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {reservation.guest?.firstName} {reservation.guest?.lastName}
                        </div>
                        <div className="table-cell-sub">
                          {reservation.guest?.phone}
                        </div>
                      </td>
                      <td>
                        {reservation.room ? (
                          <>
                            <div style={{ fontWeight: 500 }}>{reservation.room.roomType}</div>
                            <div className="table-cell-sub">
                              Room {reservation.room.roomNumber}
                            </div>
                          </>
                        ) : (
                          <span className="badge badge-warning">Not Assigned</span>
                        )}
                      </td>
                      <td>{format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}</td>
                      <td>{format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}</td>
                      <td><StatusBadge status={reservation.bookingSource} /></td>
                      <td><StatusBadge status={reservation.status} /></td>
                      <td><strong>₹{reservation.totalAmount?.toLocaleString()}</strong></td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => navigate(`/reservations/${reservation._id}`)}
                            className="btn btn-icon btn-ghost btn-sm"
                            title="View Details"
                            aria-label="View reservation details"
                          >
                            <FaEye />
                          </button>
                          {reservation.status === 'Confirmed' && (
                            <button
                              onClick={() => handleCheckIn(reservation._id)}
                              className="btn btn-icon btn-sm btn-success"
                              title="Check In"
                              aria-label="Check in guest"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {reservation.status === 'Checked-In' && (
                            <button
                              onClick={() => handleCheckOut(reservation._id)}
                              className="btn btn-icon btn-sm btn-warning"
                              title="Check Out"
                              aria-label="Check out guest"
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