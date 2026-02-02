// frontend/src/pages/BookRoom.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { roomAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    numberOfGuests: 1,
    specialRequests: '',
    paymentMethod: 'Cash'
  });

  const checkInDate = new Date(searchParams.get('checkIn'));
  const checkOutDate = new Date(searchParams.get('checkOut'));

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book a room');
      navigate('/login');
      return;
    }
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getRoom(roomId);
      setRoom(response.data);
    } catch (error) {
      toast.error('Failed to load room details');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!room) return 0;
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return room.price * nights;
  };

  const calculateNights = () => {
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  };

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bookingData.numberOfGuests > room.capacity) {
      toast.error(`This room can accommodate maximum ${room.capacity} guests`);
      return;
    }

    try {
      const booking = {
        roomId: roomId,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        numberOfGuests: parseInt(bookingData.numberOfGuests),
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod
      };

      await bookingAPI.createBooking(booking);
      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!room) return <div className="error">Room not found</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 className="mb-4">Book Your Room</h1>

      <div className="grid grid-2">
        <div>
          <div className="card">
            <h3 className="card-title">Room Details</h3>
            <div className="room-image mb-3">
              {room.images && room.images[0] ? (
                <img src={room.images[0]} alt={room.roomType} style={{ width: '100%', borderRadius: '8px' }} />
              ) : (
                <div style={{ 
                  height: '300px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#ecf0f1',
                  borderRadius: '8px',
                  fontSize: '4rem'
                }}>
                  🏨
                </div>
              )}
            </div>
            <h3>{room.roomType} - Room {room.roomNumber}</h3>
            <p><strong>Capacity:</strong> {room.capacity} guests</p>
            <p><strong>Floor:</strong> {room.floor}</p>
            <p><strong>Price:</strong> Rs. {room.price} per night</p>
            
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <strong>Amenities:</strong>
                <ul>
                  {room.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {room.description && (
              <p className="mt-2">{room.description}</p>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="card-title">Booking Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Check-in Date</label>
                <input
                  type="text"
                  className="form-control"
                  value={checkInDate.toLocaleDateString()}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Check-out Date</label>
                <input
                  type="text"
                  className="form-control"
                  value={checkOutDate.toLocaleDateString()}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Nights</label>
                <input
                  type="text"
                  className="form-control"
                  value={calculateNights()}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Guests</label>
                <input
                  type="number"
                  name="numberOfGuests"
                  className="form-control"
                  min="1"
                  max={room.capacity}
                  value={bookingData.numberOfGuests}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  name="paymentMethod"
                  className="form-control"
                  value={bookingData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea
                  name="specialRequests"
                  className="form-control"
                  rows="3"
                  value={bookingData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests or requirements..."
                ></textarea>
              </div>

              <div className="card" style={{ background: '#f8f9fa', padding: '1rem' }}>
                <h3>Total Price</h3>
                <p style={{ fontSize: '2rem', color: '#27ae60', fontWeight: 'bold' }}>
                  Rs. {calculateTotalPrice()}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                  Rs. {room.price} × {calculateNights()} night(s)
                </p>
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }}>
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRoom;