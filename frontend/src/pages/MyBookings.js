// frontend/src/pages/MyBookings.js
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
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

  if (loading) return <div className="loading">Loading your bookings...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 className="mb-4">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card text-center">
          <p>You don't have any bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {bookings.map((booking) => (
            <div key={booking._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 className="card-title">
                  {booking.room.roomType} - Room {booking.room.roomNumber}
                </h3>
                <div>
                  {getStatusBadge(booking.bookingStatus)}
                </div>
              </div>

              {booking.room.images && booking.room.images[0] && (
                <img 
                  src={booking.room.images[0]} 
                  alt={booking.room.roomType}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                />
              )}

              <div>
                <p><strong>Check-in:</strong> {format(new Date(booking.checkInDate), 'MMMM d, yyyy')}</p>
                <p><strong>Check-out:</strong> {format(new Date(booking.checkOutDate), 'MMMM d, yyyy')}</p>
                <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
                <p><strong>Total Price:</strong> Rs. {booking.totalPrice}</p>
                <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {getPaymentStatusBadge(booking.paymentStatus)}</p>
                
                {booking.specialRequests && (
                  <p><strong>Special Requests:</strong> {booking.specialRequests}</p>
                )}

                <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  Booked on: {format(new Date(booking.createdAt), 'MMMM d, yyyy h:mm a')}
                </p>

                {booking.bookingStatus === 'confirmed' && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    className="btn btn-danger"
                    style={{ marginTop: '1rem' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;