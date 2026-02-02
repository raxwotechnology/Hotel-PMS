// frontend/src/pages/admin/ManageBookings.js
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await bookingAPI.updateBooking(bookingId, { bookingStatus: status });
      toast.success('Booking status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const handlePaymentStatusChange = async (bookingId, status) => {
    try {
      await bookingAPI.updateBooking(bookingId, { paymentStatus: status });
      toast.success('Payment status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await bookingAPI.deleteBooking(bookingId);
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: 'badge-success',
      'checked-in': 'badge-info',
      'checked-out': 'badge-warning',
      cancelled: 'badge-danger'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      paid: 'badge-success',
      pending: 'badge-warning',
      cancelled: 'badge-danger',
      refunded: 'badge-info'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 className="mb-4">Manage Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card text-center">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking._id.slice(-6)}</td>
                    <td>
                      {booking.user.name}
                      <br />
                      <small>{booking.user.email}</small>
                    </td>
                    <td>
                      {booking.room.roomType}
                      <br />
                      Room {booking.room.roomNumber}
                    </td>
                    <td>{format(new Date(booking.checkInDate), 'MMM d, yyyy')}</td>
                    <td>{format(new Date(booking.checkOutDate), 'MMM d, yyyy')}</td>
                    <td>{booking.numberOfGuests}</td>
                    <td>Rs. {booking.totalPrice}</td>
                    <td>
                      <select
                        className="form-control"
                        value={booking.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(booking._id, e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.25rem' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={booking.bookingStatus}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.25rem' }}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="checked-in">Checked-in</option>
                        <option value="checked-out">Checked-out</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="btn btn-danger"
                        style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;