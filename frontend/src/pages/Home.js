// frontend/src/pages/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Home = () => {
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000));

  const handleSearch = () => {
    navigate(`/rooms?checkIn=${checkInDate.toISOString()}&checkOut=${checkOutDate.toISOString()}`);
  };

  return (
    <div>
      <div className="hero">
        <div className="container">
          <h1>Welcome to Our Hotel</h1>
          <p>Experience luxury and comfort at its finest</p>
          
          <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h3 className="card-title">Book Your Stay</h3>
            <div className="form-group">
              <label className="form-label">Check-in Date</label>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                minDate={new Date()}
                className="form-control"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check-out Date</label>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                minDate={checkInDate}
                className="form-control"
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary" style={{ width: '100%' }}>
              Search Available Rooms
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 20px' }}>
        <h2 className="text-center mb-4">Why Choose Us?</h2>
        <div className="grid grid-3">
          <div className="card text-center">
            <h3>🏊 Luxury Amenities</h3>
            <p>Enjoy world-class facilities including pool, spa, and fitness center</p>
          </div>
          <div className="card text-center">
            <h3>🍽️ Fine Dining</h3>
            <p>Experience exquisite cuisine at our award-winning restaurants</p>
          </div>
          <div className="card text-center">
            <h3>🌟 Excellent Service</h3>
            <p>Our dedicated staff ensures your stay is memorable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;