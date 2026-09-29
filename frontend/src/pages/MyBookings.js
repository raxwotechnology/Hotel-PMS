// frontend/src/pages/MyBookings.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaBed, 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaBan, 
  FaReceipt,
  FaArrowRight,
  FaHotel,
  FaTimes,
  FaMoneyBillWave
} from 'react-icons/fa';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import roomDeluxePhoto from '../assets/room-deluxe.jpg';
import roomSuitePhoto from '../assets/room-suite.jpg';
import './CustomerPortal.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      toast.error('Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? This will free up the room.')) {
      return;
    }

    try {
      setCancellingBookingId(bookingId);
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Reservation has been cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel reservation');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter((b) => {
    const checkIn = new Date(b.checkInDate);
    const isCancelled = b.bookingStatus === 'cancelled';
    const isCheckedOut = b.bookingStatus === 'checked-out';
    return checkIn >= today && !isCancelled && !isCheckedOut;
  });

  const pastBookings = bookings.filter((b) => {
    const checkIn = new Date(b.checkInDate);
    const isCancelled = b.bookingStatus === 'cancelled';
    const isCheckedOut = b.bookingStatus === 'checked-out';
    return checkIn < today || isCancelled || isCheckedOut;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return <span className="badge badge-success"><FaCheckCircle size={10} /> Confirmed</span>;
      case 'checked-in':
        return <span className="badge badge-info"><FaClock size={10} /> Checked-In</span>;
      case 'checked-out':
        return <span className="badge badge-secondary"><FaCheckCircle size={10} /> Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger"><FaBan size={10} /> Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getRoomImage = (room) => {
    if (room?.images && room.images.length > 0 && room.images[0]) {
      return room.images[0];
    }
    const type = (room?.roomType || '').toLowerCase();
    if (type.includes('suite')) return roomSuitePhoto;
    return roomDeluxePhoto;
  };

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="portal-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="portal-section-tag">Guest Reservations</span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0.25rem 0 0.5rem 0' }}>
          My Reservations
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', margin: 0 }}>
          View, manage, and review your upcoming stays and past reservation history.
        </p>
      </div>

      {/* Metrics Strip */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', boxShadow: 'var(--portal-shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Total Reservations
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E3A8A', marginTop: '0.25rem' }}>
            {bookings.length}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', boxShadow: 'var(--portal-shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Upcoming Stays
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {upcomingBookings.length}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0', boxShadow: 'var(--portal-shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Past / Completed
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#475569', marginTop: '0.25rem' }}>
            {pastBookings.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        borderBottom: '1px solid #E2E8F0', 
        marginBottom: '2rem' 
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'upcoming' ? '3px solid #1E3A8A' : '3px solid transparent',
            color: activeTab === 'upcoming' ? '#1E3A8A' : '#64748B',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaCalendarAlt />
          <span>Upcoming Stays ({upcomingBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'past' ? '3px solid #1E3A8A' : '3px solid transparent',
            color: activeTab === 'past' ? '#1E3A8A' : '#64748B',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaClock />
          <span>Past Stays & History ({pastBookings.length})</span>
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
          <p>Loading your reservations...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          background: '#FFFFFF', 
          borderRadius: '1rem', 
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--portal-shadow-sm)'
        }}>
          <FaHotel size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            {activeTab === 'upcoming' ? 'No Upcoming Reservations' : 'No Past Stays Recorded'}
          </h3>
          <p style={{ color: '#64748B', maxWidth: '450px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            {activeTab === 'upcoming'
              ? 'You do not have any upcoming stays scheduled. Browse our available rooms and book your next luxury retreat!'
              : 'You have no previous stays or past reservation records.'}
          </p>
          <Link to="/customer-home#rooms" className="portal-btn-book">
            <span>Explore Rooms & Book Now</span>
            <FaArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {displayedList.map((booking) => {
            const room = booking.room;
            const resNumber = booking.reservationNumber || booking.reservation?.reservationNumber || `RES-${booking._id.slice(-6).toUpperCase()}`;
            const checkInFormatted = format(new Date(booking.checkInDate), 'EEE, MMM d, yyyy');
            const checkOutFormatted = format(new Date(booking.checkOutDate), 'EEE, MMM d, yyyy');
            const diffDays = Math.max(1, Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)));
            const isCancellable = booking.bookingStatus === 'confirmed' && new Date(booking.checkInDate) >= today;

            return (
              <div 
                key={booking._id} 
                style={{ 
                  background: '#FFFFFF', 
                  borderRadius: '1rem', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: 'var(--portal-shadow-sm)',
                  display: 'grid',
                  gridTemplateColumns: '260px 1fr auto',
                  gap: '1.5rem',
                  padding: '1.25rem',
                  alignItems: 'center'
                }}
              >
                {/* Room Image */}
                <div style={{ height: '170px', borderRadius: '0.75rem', overflow: 'hidden' }}>
                  <img 
                    src={getRoomImage(room)} 
                    alt={room?.roomType || 'Room'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      letterSpacing: '0.05em', 
                      background: '#EFF6FF', 
                      color: '#1E3A8A', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '0.375rem' 
                    }}>
                      {resNumber}
                    </span>
                    {getStatusBadge(booking.bookingStatus)}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.4rem 0' }}>
                    {room?.roomType || 'Hotel'} Room {room?.roomNumber || ''}
                  </h3>

                  <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FaCalendarAlt size={12} style={{ color: '#D97706' }} />
                      <span>{checkInFormatted} &rarr; {checkOutFormatted} ({diffDays} Night{diffDays > 1 ? 's' : ''})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FaUsers size={12} style={{ color: '#64748B' }} />
                      <span>{booking.numberOfGuests} Guest(s)</span>
                      &bull;
                      <FaBed size={12} style={{ color: '#64748B' }} />
                      <span>{room?.bedConfiguration || 'Double Bed'}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.4rem', fontStyle: 'italic' }}>
                      Note: "{booking.specialRequests}"
                    </div>
                  )}
                </div>

                {/* Pricing & Actions */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '160px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Price</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E3A8A' }}>
                      Rs. {Number(booking.totalPrice || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'capitalize' }}>
                      Payment: {booking.paymentMethod || 'Cash'} &bull; {booking.paymentStatus || 'Pending'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="portal-btn-details"
                      onClick={() => setSelectedBookingDetails(booking)}
                    >
                      View Details
                    </button>

                    {isCancellable && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingBookingId === booking._id}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.8rem', justifyContent: 'center' }}
                      >
                        {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel Stay'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedBookingDetails && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedBookingDetails(null)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">
                Reservation Details: {selectedBookingDetails.reservationNumber || `RES-${selectedBookingDetails._id.slice(-6).toUpperCase()}`}
              </h3>
              <button 
                type="button" 
                className="portal-modal-close"
                onClick={() => setSelectedBookingDetails(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="portal-modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <img 
                  src={getRoomImage(selectedBookingDetails.room)} 
                  alt={selectedBookingDetails.room?.roomType} 
                  style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '0.5rem' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0F172A' }}>
                    {selectedBookingDetails.room?.roomType} Room {selectedBookingDetails.room?.roomNumber}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Floor {selectedBookingDetails.room?.floor || 1} &bull; {selectedBookingDetails.room?.building || 'Main Building'}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#F8FAFC', 
                borderRadius: '0.75rem', 
                padding: '1.25rem', 
                border: '1px solid #E2E8F0',
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                marginBottom: '1.25rem'
              }}>
                <div><strong>Check-In Date:</strong> {format(new Date(selectedBookingDetails.checkInDate), 'MMMM d, yyyy')} (2:00 PM)</div>
                <div><strong>Check-Out Date:</strong> {format(new Date(selectedBookingDetails.checkOutDate), 'MMMM d, yyyy')} (11:00 AM)</div>
                <div><strong>Guests:</strong> {selectedBookingDetails.numberOfGuests} Guest(s)</div>
                <div><strong>Status:</strong> {selectedBookingDetails.bookingStatus}</div>
                <div><strong>Payment Method:</strong> {selectedBookingDetails.paymentMethod}</div>
                <div><strong>Payment Status:</strong> {selectedBookingDetails.paymentStatus}</div>
              </div>

              {selectedBookingDetails.specialRequests && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#FEF3C7', borderRadius: '0.5rem', color: '#92400E', fontSize: '0.875rem' }}>
                  <strong>Special Requests:</strong> {selectedBookingDetails.specialRequests}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                background: '#EFF6FF', 
                borderRadius: '0.75rem', 
                fontWeight: 800,
                fontSize: '1.15rem',
                color: '#1E3A8A'
              }}>
                <span>Total Amount:</span>
                <span>Rs. {Number(selectedBookingDetails.totalPrice || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setSelectedBookingDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;