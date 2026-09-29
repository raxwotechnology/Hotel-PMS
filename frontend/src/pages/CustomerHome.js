// frontend/src/pages/CustomerHome.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBed, 
  FaCalendarAlt, 
  FaUsers, 
  FaCheckCircle, 
  FaShieldAlt, 
  FaConciergeBell, 
  FaClock, 
  FaStar, 
  FaWifi, 
  FaTimes, 
  FaArrowRight, 
  FaSearch,
  FaPhoneAlt,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { roomAPI, bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format, addDays } from 'date-fns';

import resortPhoto from '../assets/hotel-resort-cinematic.jpg';
import lobbyPhoto from '../assets/hotel-lobby-cinematic.jpg';
import roomDeluxePhoto from '../assets/room-deluxe.jpg';
import roomSuitePhoto from '../assets/room-suite.jpg';
import './CustomerPortal.css';

const CustomerHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search parameters
  const [checkInDate, setCheckInDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [checkOutDate, setCheckOutDate] = useState(() => format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [guestsCount, setGuestsCount] = useState(1);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Rooms state
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Selected room for Details Modal
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  // Reservation Flow Modal state
  const [bookingModalRoom, setBookingModalRoom] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    checkInDate: format(new Date(), 'yyyy-MM-dd'),
    checkOutDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    numberOfGuests: 1,
    specialRequests: '',
    paymentMethod: 'Cash'
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (inDate = checkInDate, outDate = checkOutDate, type = selectedTypeFilter) => {
    try {
      setLoadingRooms(true);
      const typeParam = type === 'All' ? undefined : type;
      const response = await roomAPI.getAvailableRooms(inDate, outDate, typeParam);
      setRooms(response.data || []);
    } catch (err) {
      console.error('Failed to load rooms', err);
      toast.error('Unable to fetch available rooms at this time');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    fetchRooms(checkInDate, checkOutDate, selectedTypeFilter);
    toast.success('Updated room availability for your dates');
    const roomsEl = document.getElementById('rooms');
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterClick = (type) => {
    setSelectedTypeFilter(type);
    fetchRooms(checkInDate, checkOutDate, type);
  };

  // Open booking modal for a specific room
  const handleOpenBookingModal = (room) => {
    setSelectedRoomDetails(null); // Close details modal if open
    setBookingModalRoom(room);
    setConfirmedReservation(null);
    setBookingFormData({
      checkInDate,
      checkOutDate,
      numberOfGuests: Math.min(guestsCount, room.capacity?.maxOccupancy || 2),
      specialRequests: '',
      paymentMethod: 'Cash'
    });
  };

  // Calculate pricing breakdown
  const calculateTotal = (room, inDate, outDate) => {
    if (!room) return 0;
    const start = new Date(inDate);
    const end = new Date(outDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const rate = Number(room.basePrice || room.price || 0);
    return {
      days,
      rate,
      total: days * rate
    };
  };

  // Submit Reservation
  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!bookingModalRoom) return;

    if (new Date(bookingFormData.checkInDate) >= new Date(bookingFormData.checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      setSubmittingBooking(true);
      const payload = {
        roomId: bookingModalRoom._id,
        checkInDate: bookingFormData.checkInDate,
        checkOutDate: bookingFormData.checkOutDate,
        numberOfGuests: Number(bookingFormData.numberOfGuests) || 1,
        specialRequests: bookingFormData.specialRequests,
        paymentMethod: bookingFormData.paymentMethod
      };

      const response = await bookingAPI.createBooking(payload);
      setConfirmedReservation(response.data);
      toast.success('Reservation successfully confirmed!');
      // Refresh room list
      fetchRooms(checkInDate, checkOutDate, selectedTypeFilter);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete reservation');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const getRoomPhoto = (room) => {
    if (room?.images && room.images.length > 0 && room.images[0]) {
      return room.images[0];
    }
    const type = (room?.roomType || '').toLowerCase();
    if (type.includes('suite')) return roomSuitePhoto;
    if (type.includes('deluxe')) return roomDeluxePhoto;
    return roomDeluxePhoto;
  };

  const pricing = bookingModalRoom
    ? calculateTotal(bookingModalRoom, bookingFormData.checkInDate, bookingFormData.checkOutDate)
    : { days: 1, rate: 0, total: 0 };

  return (
    <div className="guest-portal-page">
      {/* ============================================================
          1. Hero Section
          ============================================================ */}
      <section 
        className="portal-hero" 
        style={{ backgroundImage: `url(${resortPhoto})` }}
        id="home"
      >
        <div className="portal-hero-overlay" />
        <div className="portal-hero-content">
          <div className="portal-hero-badge">
            <FaStar /> Direct Guest Portal &bull; Best Rate Guarantee
          </div>

          <h1 className="portal-hero-title">
            Welcome to <span>HotelPMS</span> Luxury Retreat
          </h1>

          <p className="portal-hero-subtitle">
            Welcome back, <strong>{user?.name || 'Valued Guest'}</strong>. Enjoy bespoke accommodations, 
            peaceful ocean and city views, personalized service, and effortless reservation management.
          </p>

          <div className="portal-hero-ctas">
            <a href="#rooms" className="portal-hero-btn-primary">
              <FaCalendarAlt />
              <span>Book Your Stay</span>
            </a>
            <a href="#about" className="portal-hero-btn-secondary">
              <span>Explore Our Hotel</span>
              <FaArrowRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. Floating Availability Search Bar
          ============================================================ */}
      <div className="portal-search-wrapper">
        <div className="portal-search-card">
          <form onSubmit={handleSearchSubmit} className="portal-search-form">
            <div className="portal-search-field">
              <label className="portal-search-label" htmlFor="search-check-in">
                <FaCalendarAlt size={12} /> Check-In Date
              </label>
              <input
                id="search-check-in"
                type="date"
                className="portal-search-input"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>

            <div className="portal-search-field">
              <label className="portal-search-label" htmlFor="search-check-out">
                <FaCalendarAlt size={12} /> Check-Out Date
              </label>
              <input
                id="search-check-out"
                type="date"
                className="portal-search-input"
                min={checkInDate || format(new Date(), 'yyyy-MM-dd')}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>

            <div className="portal-search-field">
              <label className="portal-search-label" htmlFor="search-guests">
                <FaUsers size={12} /> Guests
              </label>
              <select
                id="search-guests"
                className="portal-search-input"
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>

            <div className="portal-search-field">
              <label className="portal-search-label" htmlFor="search-type">
                <FaBed size={12} /> Room Category
              </label>
              <select
                id="search-type"
                className="portal-search-input"
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Deluxe">Deluxe Room</option>
                <option value="Suite">Executive Suite</option>
                <option value="Double">Double Room</option>
                <option value="Single">Single Room</option>
              </select>
            </div>

            <button type="submit" className="portal-search-btn">
              <FaSearch size={14} />
              <span>Check Availability</span>
            </button>
          </form>
        </div>
      </div>

      <div className="portal-container">
        {/* ============================================================
            3. Hotel Highlights Section
            ============================================================ */}
        <section className="portal-highlights-section">
          <div className="portal-section-header">
            <span className="portal-section-tag">Why Choose Us</span>
            <h2 className="portal-section-title">Designed for Your Comfort</h2>
            <p className="portal-section-desc">
              From seamless direct reservations to attentive concierge service, 
              every stay at HotelPMS is curated for tranquility and convenience.
            </p>
          </div>

          <div className="portal-highlights-grid">
            <div className="portal-highlight-card">
              <div className="portal-highlight-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <FaBed />
              </div>
              <h3>Refined Accommodations</h3>
              <p>
                Spacious rooms featuring plush king and double beds, high-thread-count linens, 
                and soothing aesthetic interiors.
              </p>
            </div>

            <div className="portal-highlight-card">
              <div className="portal-highlight-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <FaCalendarAlt />
              </div>
              <h3>Instant Reservations</h3>
              <p>
                Direct booking confirmation with zero reservation fees, transparent rates, 
                and flexible self-service access.
              </p>
            </div>

            <div className="portal-highlight-card">
              <div className="portal-highlight-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                <FaConciergeBell />
              </div>
              <h3>Attentive Hospitality</h3>
              <p>
                Around-the-clock reception desk, personalized guest assistance, and dedicated 
                daily housekeeping services.
              </p>
            </div>

            <div className="portal-highlight-card">
              <div className="portal-highlight-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                <FaShieldAlt />
              </div>
              <h3>Secure & Verified</h3>
              <p>
                Encrypted account management, guaranteed room availability, and verified 
                front desk payment processing.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            4. About Our Hotel Section
            ============================================================ */}
        <section className="portal-about-section" id="about">
          <div className="portal-about-grid">
            <div className="portal-about-content">
              <span className="portal-section-tag">About Our Hotel</span>
              <h2>A Sanctuary of Calm, Elegance, and Hospitality</h2>
              <p>
                HotelPMS offers an elevated stay experience designed for both leisure 
                and business travelers. Located in an accessible and scenic setting, our property combines 
                modern architecture with warm, attentive hospitality.
              </p>
              <p>
                Whether you are relaxing in our grand atrium lounge, unwinding in a private ocean-view balcony, 
                or resting in a quiet executive suite, we ensure your stay is effortless from arrival to departure.
              </p>

              <div className="portal-about-features">
                <div className="portal-about-feat-item">
                  <FaCheckCircle /> 24/7 Front Desk & Concierge
                </div>
                <div className="portal-about-feat-item">
                  <FaCheckCircle /> High-Speed Complimentary Wi-Fi
                </div>
                <div className="portal-about-feat-item">
                  <FaCheckCircle /> Daily Room Housekeeping
                </div>
                <div className="portal-about-feat-item">
                  <FaCheckCircle /> Express Check-in & Check-out
                </div>
                <div className="portal-about-feat-item">
                  <FaCheckCircle /> Climate Controlled Rooms
                </div>
                <div className="portal-about-feat-item">
                  <FaCheckCircle /> Direct Booking Best Price Guarantee
                </div>
              </div>

              <div>
                <a href="#rooms" className="portal-btn-book">
                  <span>Explore Available Rooms</span>
                  <FaArrowRight size={12} />
                </a>
              </div>
            </div>

            <div className="portal-about-image-wrapper">
              <img 
                src={lobbyPhoto} 
                alt="HotelPMS Grand Lobby and Lounge" 
                className="portal-about-image" 
              />
            </div>
          </div>
        </section>

        {/* ============================================================
            5. Rooms Showcase Section ("Explore Our Rooms")
            ============================================================ */}
        <section className="portal-rooms-section" id="rooms">
          <div className="portal-section-header">
            <span className="portal-section-tag">Accommodations</span>
            <h2 className="portal-section-title">Explore Our Rooms & Suites</h2>
            <p className="portal-section-desc">
              Choose from our curated collection of luxury rooms, suites, and comfort guestrooms. 
              All rooms feature premium bedding, modern en-suite amenities, and high-speed Wi-Fi.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="portal-rooms-filter-bar">
            {['All', 'Deluxe', 'Suite', 'Double', 'Single'].map((type) => (
              <button
                key={type}
                type="button"
                className={`portal-filter-pill ${selectedTypeFilter === type ? 'active' : ''}`}
                onClick={() => handleFilterClick(type)}
              >
                {type === 'All' ? 'All Rooms' : `${type} Rooms`}
              </button>
            ))}
          </div>

          {/* Rooms Grid */}
          {loadingRooms ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
              <p>Finding available rooms for your dates...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              background: '#FFFFFF', 
              borderRadius: '1rem', 
              border: '1px solid #E2E8F0' 
            }}>
              <FaBed size={40} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
              <h3>No rooms available for the selected dates or category</h3>
              <p style={{ color: '#64748B', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>
                Try adjusting your check-in or check-out dates, or select "All Rooms" to view other available options.
              </p>
              <button 
                type="button" 
                className="portal-btn-book"
                onClick={() => handleFilterClick('All')}
              >
                Show All Available Rooms
              </button>
            </div>
          ) : (
            <div className="portal-rooms-grid">
              {rooms.map((room) => {
                const photo = getRoomPhoto(room);
                const maxAdults = room.capacity?.maxAdults || 2;
                const maxOcc = room.capacity?.maxOccupancy || 2;

                return (
                  <div key={room._id} className="portal-room-card">
                    {/* Thumbnail */}
                    <div className="portal-room-thumb">
                      <img 
                        src={photo} 
                        alt={`${room.roomType} ${room.roomNumber}`} 
                        className="portal-room-img" 
                      />
                      <div className="portal-room-type-badge">
                        {room.roomType}
                      </div>
                      <div className="portal-room-status-badge">
                        Available
                      </div>
                    </div>

                    {/* Content */}
                    <div className="portal-room-content">
                      <div className="portal-room-header">
                        <h3 className="portal-room-name">
                          {room.roomType} Room {room.roomNumber}
                        </h3>
                        <div className="portal-room-price">
                          <span className="portal-room-price-val">
                            Rs. {Number(room.basePrice || room.price || 0).toLocaleString()}
                          </span>
                          <span className="portal-room-price-unit"> / night</span>
                        </div>
                      </div>

                      <p className="portal-room-desc">
                        {room.description || `${room.roomType} accommodation offering modern comforts, peaceful views, and upscale hospitality.`}
                      </p>

                      <div className="portal-room-meta">
                        <div className="portal-room-meta-item">
                          <FaUsers size={12} />
                          <span>Up to {maxOcc} Guests ({maxAdults} Adults)</span>
                        </div>
                        <div className="portal-room-meta-item">
                          <FaBed size={12} />
                          <span>{room.bedConfiguration || 'Double Bed'}</span>
                        </div>
                      </div>

                      {/* Amenities snippet */}
                      <div className="portal-room-amenities">
                        {room.view && (
                          <span className="portal-amenity-pill" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                            {room.view}
                          </span>
                        )}
                        <span className="portal-amenity-pill">High-Speed Wi-Fi</span>
                        <span className="portal-amenity-pill">Air Conditioning</span>
                        {room.features?.balcony && (
                          <span className="portal-amenity-pill">Balcony</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="portal-room-actions">
                        <button
                          type="button"
                          className="portal-btn-details"
                          onClick={() => setSelectedRoomDetails(room)}
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="portal-btn-reserve"
                          onClick={() => handleOpenBookingModal(room)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ============================================================
          6. Room Details Modal
          ============================================================ */}
      {selectedRoomDetails && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedRoomDetails(null)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">
                {selectedRoomDetails.roomType} Room {selectedRoomDetails.roomNumber}
              </h3>
              <button 
                type="button" 
                className="portal-modal-close"
                onClick={() => setSelectedRoomDetails(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="portal-modal-body">
              <div style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '260px', marginBottom: '1.25rem' }}>
                <img 
                  src={getRoomPhoto(selectedRoomDetails)} 
                  alt={selectedRoomDetails.roomType}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                    {selectedRoomDetails.building || 'Main Building'} &bull; Floor {selectedRoomDetails.floor || 1}
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                    {selectedRoomDetails.bedConfiguration || 'Double Bed'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A' }}>
                    Rs. {Number(selectedRoomDetails.basePrice || selectedRoomDetails.price || 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>per night (taxes included)</span>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {selectedRoomDetails.description || 'Chic guestroom featuring custom furnishings, ergonomic workspace, and peaceful views.'}
              </p>

              {/* Room Specifications Table */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.75rem', 
                padding: '1rem', 
                background: '#F8FAFC', 
                borderRadius: '0.75rem', 
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem'
              }}>
                <div><strong>Max Occupancy:</strong> {selectedRoomDetails.capacity?.maxOccupancy || 2} Guests</div>
                <div><strong>Max Adults:</strong> {selectedRoomDetails.capacity?.maxAdults || 2} Adults</div>
                <div><strong>View:</strong> {selectedRoomDetails.view || 'Scenic View'}</div>
                <div><strong>Room Size:</strong> {selectedRoomDetails.roomSize ? `${selectedRoomDetails.roomSize} sq ft` : 'Standard'}</div>
              </div>

              {/* Amenities */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0F172A' }}>
                  Room Amenities & Inclusions
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(selectedRoomDetails.amenities && selectedRoomDetails.amenities.length > 0) ? (
                    selectedRoomDetails.amenities.map((item, idx) => (
                      <span key={idx} className="portal-amenity-pill">
                        &bull; {item}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="portal-amenity-pill">&bull; High-Speed Wi-Fi</span>
                      <span className="portal-amenity-pill">&bull; Smart TV</span>
                      <span className="portal-amenity-pill">&bull; Air Conditioning</span>
                      <span className="portal-amenity-pill">&bull; En-suite Bathroom</span>
                      <span className="portal-amenity-pill">&bull; Daily Housekeeping</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedRoomDetails(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="portal-btn-book"
                onClick={() => handleOpenBookingModal(selectedRoomDetails)}
              >
                Reserve This Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          7. Customer Reservation Flow Modal
          ============================================================ */}
      {bookingModalRoom && (
        <div className="portal-modal-backdrop" onClick={() => !submittingBooking && setBookingModalRoom(null)}>
          <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">
                {confirmedReservation ? 'Reservation Status' : `Book ${bookingModalRoom.roomType} Room ${bookingModalRoom.roomNumber}`}
              </h3>
              {!submittingBooking && (
                <button 
                  type="button" 
                  className="portal-modal-close"
                  onClick={() => setBookingModalRoom(null)}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="portal-modal-body">
              {confirmedReservation ? (
                /* Success Confirmation View */
                <div className="portal-success-card">
                  <div className="portal-success-icon">
                    <FaCheck />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Reservation Confirmed!
                  </h3>
                  <p style={{ color: '#64748B', marginBottom: '1.25rem' }}>
                    Your room is reserved and guaranteed. A confirmation record has been added to your profile.
                  </p>

                  <div className="portal-success-num">
                    Reservation #: {confirmedReservation.reservationNumber || `RES-${confirmedReservation._id.slice(-6).toUpperCase()}`}
                  </div>

                  <div style={{ 
                    textAlign: 'left', 
                    background: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '0.75rem', 
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.925rem',
                    lineHeight: 1.8
                  }}>
                    <div><strong>Room:</strong> {bookingModalRoom.roomType} (Room {bookingModalRoom.roomNumber})</div>
                    <div><strong>Check-In:</strong> {format(new Date(confirmedReservation.checkInDate), 'EEEE, MMMM d, yyyy')} (2:00 PM)</div>
                    <div><strong>Check-Out:</strong> {format(new Date(confirmedReservation.checkOutDate), 'EEEE, MMMM d, yyyy')} (11:00 AM)</div>
                    <div><strong>Guests:</strong> {confirmedReservation.numberOfGuests} Guest(s)</div>
                    <div><strong>Total Amount:</strong> Rs. {confirmedReservation.totalPrice?.toLocaleString()}</div>
                    <div><strong>Status:</strong> <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{confirmedReservation.bookingStatus || 'Confirmed'}</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link to="/my-bookings" className="btn btn-primary" onClick={() => setBookingModalRoom(null)}>
                      View in My Reservations
                    </Link>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setBookingModalRoom(null)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Step-by-Step Reservation Form */
                <form onSubmit={handleConfirmReservation}>
                  {/* Room Overview Strip */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'center', 
                    background: '#F8FAFC', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '0.75rem', 
                    marginBottom: '1.25rem',
                    border: '1px solid #E2E8F0'
                  }}>
                    <img 
                      src={getRoomPhoto(bookingModalRoom)} 
                      alt={bookingModalRoom.roomType}
                      style={{ width: '70px', height: '55px', objectFit: 'cover', borderRadius: '0.5rem' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>
                        {bookingModalRoom.roomType} Room {bookingModalRoom.roomNumber}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        {bookingModalRoom.bedConfiguration || 'Double Bed'} &bull; Rs. {pricing.rate.toLocaleString()} / night
                      </div>
                    </div>
                  </div>

                  {/* Dates Selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Check-In Date *</label>
                      <input 
                        type="date"
                        className="form-input"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        value={bookingFormData.checkInDate}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, checkInDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Check-Out Date *</label>
                      <input 
                        type="date"
                        className="form-input"
                        min={bookingFormData.checkInDate || format(new Date(), 'yyyy-MM-dd')}
                        value={bookingFormData.checkOutDate}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, checkOutDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Guests Count & Payment Method */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Number of Guests *</label>
                      <select
                        className="form-select"
                        value={bookingFormData.numberOfGuests}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, numberOfGuests: e.target.value })}
                      >
                        {Array.from({ length: bookingModalRoom.capacity?.maxOccupancy || 2 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Payment Option</label>
                      <select
                        className="form-select"
                        value={bookingFormData.paymentMethod}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, paymentMethod: e.target.value })}
                      >
                        <option value="Cash">Pay at Front Desk (Cash)</option>
                        <option value="Card">Pay at Front Desk (Card)</option>
                        <option value="Online">Online Authorization</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Special Requests (Optional)</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Early check-in request, quiet room, extra pillow, etc."
                      value={bookingFormData.specialRequests}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, specialRequests: e.target.value })}
                    />
                  </div>

                  {/* Guest Information Review */}
                  <div style={{ 
                    padding: '0.875rem 1rem', 
                    background: '#F1F5F9', 
                    borderRadius: '0.625rem', 
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Guest Information (from Profile)
                    </div>
                    <div style={{ color: '#475569' }}>
                      <span><strong>Guest Name:</strong> {user?.name} &bull; </span>
                      <span><strong>Email:</strong> {user?.email} &bull; </span>
                      <span><strong>Phone:</strong> {user?.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  {/* Price Calculation Summary */}
                  <div style={{ 
                    padding: '1rem', 
                    background: '#EFF6FF', 
                    border: '1px solid #BFDBFE', 
                    borderRadius: '0.75rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      <span>Nightly Room Rate:</span>
                      <span>Rs. {pricing.rate.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>Duration of Stay:</span>
                      <span>{pricing.days} Night(s)</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      paddingTop: '0.5rem', 
                      borderTop: '1px solid #DBEAFE', 
                      fontWeight: 800, 
                      fontSize: '1.15rem', 
                      color: '#1E3A8A' 
                    }}>
                      <span>Total Estimated Cost:</span>
                      <span>Rs. {pricing.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="portal-modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={submittingBooking}
                      onClick={() => setBookingModalRoom(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="portal-btn-book"
                      disabled={submittingBooking}
                    >
                      {submittingBooking ? 'Reserving...' : 'Confirm Reservation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
