// frontend/src/pages/GuestDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaUser, FaIdCard, FaMapMarkerAlt, FaBed } from 'react-icons/fa';
import { guestAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const GuestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuest();
  }, [id]);

  const fetchGuest = async () => {
    try {
      const response = await guestAPI.getGuest(id);
      setGuest(response.data);
    } catch (error) {
      toast.error('Failed to load guest details');
      navigate('/guests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;

    try {
      await guestAPI.deleteGuest(id);
      toast.success('Guest deleted successfully');
      navigate('/guests');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete guest');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!guest) {
    return <div className="empty-state"><h3>Guest not found</h3></div>;
  }

  const getGuestTypeBadge = (type) => {
    const classes = {
      'VIP': 'badge-warning',
      'Corporate': 'badge-info',
      'Group': 'badge-secondary',
      'Regular': 'badge-success'
    };
    return <span className={`badge ${classes[type] || 'badge-secondary'}`}>{type}</span>;
  };

  return (
    <div>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/guests')} className="btn btn-outline">
            <FaArrowLeft /> Back
          </button>
          <h1 className="topbar-title">Guest Details</h1>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate(`/guests/${id}/edit`)} className="btn btn-primary">
            <FaEdit /> Edit
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Guest Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                {guest.firstName} {guest.lastName}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getGuestTypeBadge(guest.guestType)}
                {guest.blacklisted && (
                  <span className="badge badge-danger">Blacklisted</span>
                )}
              </div>
            </div>
            <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
            </div>
          </div>

          <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                {guest.totalStays}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Stays</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                Rs. {guest.totalSpent?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Spent</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {guest.loyaltyPoints || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Loyalty Points</div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUser style={{ marginRight: '0.5rem' }} />
              Personal Information
            </h3>
          </div>
          <div className="form-grid">
            <div>
              <label className="form-label">Email</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                {guest.email || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="form-label">Phone</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>{guest.phone}</div>
            </div>
            <div>
              <label className="form-label">Alternate Phone</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                {guest.alternatePhone || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                {guest.dateOfBirth ? format(new Date(guest.dateOfBirth), 'MMM dd, yyyy') : 'Not provided'}
              </div>
            </div>
            <div>
              <label className="form-label">Gender</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                {guest.gender || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="form-label">Nationality</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>{guest.nationality}</div>
            </div>
            <div>
              <label className="form-label">Company</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                {guest.company || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* ID Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaIdCard style={{ marginRight: '0.5rem' }} />
              ID Information
            </h3>
          </div>
          <div className="form-grid">
            <div>
              <label className="form-label">ID Type</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>{guest.nationalIdType}</div>
            </div>
            <div>
              <label className="form-label">ID Number</label>
              <div style={{ padding: '0.625rem 0', color: '#1e293b', fontWeight: '600' }}>
                {guest.nationalIdNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        {guest.address && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
                Address
              </h3>
            </div>
            <div className="form-grid">
              <div className="full-width">
                <label className="form-label">Street</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.address.street || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="form-label">City</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.address.city || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="form-label">State</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.address.state || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="form-label">Country</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.address.country || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="form-label">Zip Code</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.address.zipCode || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        {guest.preferences && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FaBed style={{ marginRight: '0.5rem' }} />
                Preferences
              </h3>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Room Type</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.preferences.roomType || 'No preference'}
                </div>
              </div>
              <div>
                <label className="form-label">Floor</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.preferences.floor || 'No preference'}
                </div>
              </div>
              <div>
                <label className="form-label">Bed Type</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.preferences.bedType || 'No preference'}
                </div>
              </div>
              <div>
                <label className="form-label">Smoking</label>
                <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                  {guest.preferences.smoking ? 'Yes' : 'No'}
                </div>
              </div>
              {guest.preferences.otherPreferences && (
                <div className="full-width">
                  <label className="form-label">Other Preferences</label>
                  <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
                    {guest.preferences.otherPreferences}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {guest.notes && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Notes</h3>
            </div>
            <div style={{ padding: '0.625rem 0', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
              {guest.notes}
            </div>
          </div>
        )}

        {/* Blacklist Info */}
        {guest.blacklisted && guest.blacklistReason && (
          <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: '#ef4444' }}>Blacklist Information</h3>
            </div>
            <div style={{ padding: '0.625rem 0', color: '#1e293b' }}>
              <strong>Reason:</strong> {guest.blacklistReason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDetails;