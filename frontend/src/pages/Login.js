// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaHotel, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight, 
  FaKey, 
  FaShieldAlt, 
  FaBolt, 
  FaStar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaImages,
  FaConciergeBell
} from 'react-icons/fa';

import resortPhoto from '../assets/hotel-resort-cinematic.jpg';
import lobbyPhoto from '../assets/hotel-lobby-cinematic.jpg';
import './Login.css';

const SCENES = {
  resort: {
    id: 'resort',
    title: 'Twilight Oceanfront Resort',
    location: 'Mirage Bay & Marina, Coastal Pavilion',
    image: resortPhoto,
    badge: 'Live Aerial Cam • 24°C Calm Breeze',
    occupancy: '96.4%',
    rooms: '144 / 150 Rooms',
    arrivals: '18 Today'
  },
  lobby: {
    id: 'lobby',
    title: 'Grand Atrium & Royal Lounge',
    location: 'Central Tower • Level 1 Concierge',
    image: lobbyPhoto,
    badge: 'Front Desk Live • Butler Service Active',
    occupancy: '92.8%',
    rooms: '139 / 150 Rooms',
    arrivals: '24 Today'
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeScene, setActiveScene] = useState('resort');

  const currentSceneData = SCENES[activeScene];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful!');
      const userRole = (result.user?.role || '').toLowerCase().trim();
      if (userRole === 'customer') {
        navigate('/customer-home');
      } else {
        navigate('/admin-dashboard');
      }
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  // Quick 1-click demo filler - Admin
  const handleFillDemo = () => {
    setFormData({
      email: 'admin@hotel.com',
      password: 'admin123'
    });
    toast.info('Demo Admin credentials populated!');
  };

  // Quick 1-click demo filler - Customer
  const handleFillCustomerDemo = () => {
    setFormData({
      email: 'customer@hotel.com',
      password: 'password123'
    });
    toast.info('Demo Customer credentials populated!');
  };

  const handleForgotPassword = () => {
    toast.info('Please contact your hotel administrator or IT desk to reset credentials.');
  };

  return (
    <div className="cinematic-login-wrapper">
      {/* ----------------------------------------------------
          Left Pane: Immersive Cinematic Photography Showcase
          ---------------------------------------------------- */}
      <div className="cinematic-photo-pane">
        {/* Dynamic Background Image Layer with Ken Burns Motion */}
        <div 
          className="cinematic-bg-layer"
          style={{ backgroundImage: `url(${currentSceneData.image})` }}
          aria-hidden="true"
        />

        {/* Ambient Shading & Vignettes */}
        <div className="cinematic-overlay-vignette" aria-hidden="true" />
        <div className="cinematic-gold-flare" aria-hidden="true" />

        {/* Top Header: Brand Crest + Photo Scene Switcher */}
        <div className="cinematic-pane-header">
          <div className="cinematic-brand-group">
            <div className="cinematic-brand-crest">
              <FaHotel />
            </div>
            <div className="cinematic-brand-info">
              <h1>Hotel<span>PMS</span></h1>
              <div className="cinematic-brand-tagline">
                Luxury Hospitality Suite
              </div>
            </div>
          </div>

          {/* Interactive Scene Switcher */}
          <div className="cinematic-switcher-pills" title="Switch Hotel View">
            <button
              type="button"
              className={`switcher-pill-btn ${activeScene === 'resort' ? 'active' : ''}`}
              onClick={() => setActiveScene('resort')}
            >
              <FaImages size={11} /> Sunset Resort
            </button>
            <button
              type="button"
              className={`switcher-pill-btn ${activeScene === 'lobby' ? 'active' : ''}`}
              onClick={() => setActiveScene('lobby')}
            >
              <FaConciergeBell size={11} /> Grand Lobby
            </button>
          </div>
        </div>

        {/* Center: Cinematic Narrative & Live PMS HUD */}
        <div className="cinematic-pane-content">
          <div className="cinematic-location-badge">
            <FaMapMarkerAlt size={12} /> {currentSceneData.location}
          </div>

          <h2 className="cinematic-main-title">
            Exceptional Stays. <br />
            <span className="cinematic-title-gold">Effortless Operations.</span>
          </h2>

          <p className="cinematic-lead-text">
            Command reservations, housekeeping flows, dynamic billing, 
            and real-time room inventory with five-star precision.
          </p>

          {/* Live Glass HUD Cards */}
          <div className="cinematic-floating-hud">
            {/* Occupancy Card */}
            <div className="hud-glass-card">
              <div className="hud-card-top">
                <div className="hud-status-badge">
                  <span className="hud-pulse-dot" /> Live Occupancy
                </div>
                <span style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>{currentSceneData.badge}</span>
              </div>
              <div className="hud-stat-number">{currentSceneData.occupancy}</div>
              <div className="hud-stat-label">{currentSceneData.rooms} occupied</div>
              <div className="hud-bar-track">
                <div 
                  className="hud-bar-fill" 
                  style={{ width: currentSceneData.occupancy }} 
                />
              </div>
            </div>

            {/* Quick Highlights Card */}
            <div className="hud-glass-card">
              <div className="hud-features-list">
                <div className="hud-feature-item">
                  <FaCheckCircle /> Express Folio Billing
                </div>
                <div className="hud-feature-item">
                  <FaCheckCircle /> Smart Keycard & Check-in
                </div>
                <div className="hud-feature-item">
                  <FaCheckCircle /> Multi-Property Synchronization
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Trust & Social Proof */}
        <div className="cinematic-pane-footer">
          <div className="cinematic-stars">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            <span style={{ color: '#F8FAFC', fontWeight: 700, marginLeft: '0.45rem' }}>
              5-Star Hospitality Standard
            </span>
          </div>
          <span>Enterprise Cloud Architecture • 99.99% Uptime</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          Right Pane: Modern Frosted Glass Login Portal
          ---------------------------------------------------- */}
      <div className="cinematic-form-pane">
        <div className="cinematic-form-card">
          <div className="portal-badge-pill">
            <FaKey size={11} /> Staff Access Portal
          </div>

          <h2 className="portal-welcome-heading">Welcome Back</h2>
          <p className="portal-welcome-sub">
            Please enter your authenticated hotel credentials to enter the system.
          </p>

          <form onSubmit={handleSubmit} noValidate={false}>
            {/* Email Field */}
            <div className="portal-field-group">
              <div className="portal-field-label">
                <span>Email Address <span className="req-star">*</span></span>
              </div>
              <div className="portal-input-container">
                <FaEnvelope className="portal-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="portal-input-text"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="admin@hotel.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="portal-field-group">
              <div className="portal-field-label">
                <span>Password <span className="req-star">*</span></span>
              </div>
              <div className="portal-input-container">
                <FaLock className="portal-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="portal-input-text"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="portal-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="portal-options-bar">
              <label className="portal-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="portal-forgot-btn"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              className="portal-submit-btn" 
              disabled={loading}
              id="login-submit-button"
            >
              {loading ? (
                <>
                  <span className="portal-spinner" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <FaArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Interactive Demo Credentials HUD */}
          <div className="portal-demo-card">
            <div className="portal-demo-head">
              <div className="portal-demo-title">
                <FaBolt /> Demo Credentials
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="portal-demo-autofill-btn"
                  onClick={handleFillDemo}
                  title="Click to fill Admin demo account"
                >
                  ⚡ Admin Demo
                </button>
                <button 
                  type="button" 
                  className="portal-demo-autofill-btn"
                  onClick={handleFillCustomerDemo}
                  style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93C5FD' }}
                  title="Click to fill Customer demo account"
                >
                  👤 Customer Demo
                </button>
              </div>
            </div>

            <div className="portal-demo-grid">
              <div className="portal-demo-box">
                <span className="portal-demo-key">Email</span>
                <span className="portal-demo-val">admin@hotel.com</span>
              </div>
              <div className="portal-demo-box">
                <span className="portal-demo-key">Password</span>
                <span className="portal-demo-val">admin123</span>
              </div>
            </div>
          </div>

          {/* Registration Link */}
          <div className="portal-register-prompt">
            New customer?{' '}
            <Link to="/register">Create customer account</Link>
          </div>

          {/* Security Stamp */}
          <div className="portal-security-badge">
            <FaShieldAlt />
            <span>256-Bit SSL Encrypted • ISO 27001 Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;