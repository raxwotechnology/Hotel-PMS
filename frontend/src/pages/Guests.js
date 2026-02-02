// frontend/src/pages/Guests.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { guestAPI } from '../services/api';
import { toast } from 'react-toastify';

const Guests = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchGuests();
    } else {
      setFilteredGuests(guests);
    }
  }, [searchQuery, guests]);

  const fetchGuests = async () => {
    try {
      const response = await guestAPI.getGuests();
      setGuests(response.data);
      setFilteredGuests(response.data);
    } catch (error) {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const searchGuests = async () => {
    if (searchQuery.length < 2) return;
    
    try {
      const response = await guestAPI.searchGuests(searchQuery);
      setFilteredGuests(response.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;

    try {
      await guestAPI.deleteGuest(id);
      toast.success('Guest deleted successfully');
      fetchGuests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete guest');
    }
  };

  const getGuestTypeBadge = (type) => {
    const classes = {
      'VIP': 'badge-warning',
      'Corporate': 'badge-info',
      'Group': 'badge-secondary',
      'Regular': 'badge-success'
    };
    return <span className={`badge ${classes[type] || 'badge-secondary'}`}>{type}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Guests</h1>
        <div className="topbar-actions">
          <button onClick={() => navigate('/guests/new')} className="btn btn-primary">
            <FaPlus /> Add New Guest
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="filters">
          <div className="filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, phone, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
              />
              <FaSearch />
            </div>
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="empty-state">
            <FaSearch />
            <h3>No guests found</h3>
            <p>Try adjusting your search or add a new guest</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>ID Type</th>
                    <th>ID Number</th>
                    <th>Nationality</th>
                    <th>Guest Type</th>
                    <th>Total Stays</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <tr key={guest._id}>
                      <td>
                        <strong>{guest.firstName} {guest.lastName}</strong>
                        {guest.blacklisted && (
                          <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>
                            Blacklisted
                          </span>
                        )}
                      </td>
                      <td>
                        <div>{guest.email}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{guest.phone}</div>
                      </td>
                      <td>{guest.nationalIdType}</td>
                      <td>{guest.nationalIdNumber}</td>
                      <td>{guest.nationality}</td>
                      <td>{getGuestTypeBadge(guest.guestType)}</td>
                      <td>{guest.totalStays}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => navigate(`/guests/${guest._id}`)}
                            className="btn btn-sm btn-outline"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/guests/${guest._id}/edit`)}
                            className="btn btn-sm btn-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(guest._id)}
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
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

export default Guests;