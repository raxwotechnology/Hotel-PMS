// frontend/src/components/CustomerFooter.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHotel, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const CustomerFooter = () => {
  return (
    <footer className="portal-footer">
      <div className="portal-footer-grid">
        {/* Brand Column */}
        <div className="portal-footer-brand">
          <h4>🏨 HotelPMS</h4>
          <p>
            Experience premium hospitality, serene coastal and city accommodations, 
            and effortless reservation management through our dedicated Guest Portal.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#94A3B8' }}>
            <FaShieldAlt style={{ color: '#10B981' }} />
            <span>Guaranteed Direct Booking Rate & Instant Confirmation</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="portal-footer-col">
          <h5>Guest Portal</h5>
          <ul>
            <li><Link to="/customer-home">Home</Link></li>
            <li><a href="/customer-home#rooms">Explore Rooms</a></li>
            <li><a href="/customer-home#about">About Hotel</a></li>
            <li><Link to="/my-bookings">My Reservations</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
          </ul>
        </div>

        {/* Front Desk & Operations */}
        <div className="portal-footer-col">
          <h5>Guest Services</h5>
          <ul>
            <li>Check-in: 2:00 PM onwards</li>
            <li>Check-out: 11:00 AM</li>
            <li>Front Desk: 24/7 Available</li>
            <li>Daily Housekeeping Included</li>
            <li>High-Speed Wi-Fi Included</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="portal-footer-col">
          <h5>Reception Desk</h5>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaMapMarkerAlt style={{ color: '#D97706' }} />
              <span>Coastal Pavilions & Central Tower</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPhoneAlt style={{ color: '#D97706' }} />
              <span>+1 (800) 555-HOTEL</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaEnvelope style={{ color: '#D97706' }} />
              <span>reservations@hotelpms.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="portal-footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} HotelPMS Property Management System. All rights reserved.
        </div>
        <div>
          ISO 27001 Protocol &bull; 256-Bit SSL Encrypted Booking
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
