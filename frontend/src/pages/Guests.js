// frontend/src/pages/Guests.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaUser } from 'react-icons/fa';
import { guestAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

const Guests = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await guestAPI.getGuests();
      setGuests(response.data);
    } catch (error) {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
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

  const filteredGuests = guests.filter(guest => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      guest.firstName?.toLowerCase().includes(term) ||
      guest.lastName?.toLowerCase().includes(term) ||
      guest.email?.toLowerCase().includes(term) ||
      guest.phone?.includes(term) ||
      guest.nationalIdNumber?.includes(term)
    );
  });

  return (
    <div>
      <div className="content-wrapper">
        <PageHeader 
          title="Guests" 
          subtitle="Manage guest profiles, contact details and stay history."
        >
          <button onClick={() => navigate('/guests/new')} className="btn btn-primary">
            <FaPlus /> Add Guest
          </button>
        </PageHeader>

        {/* Search */}
        <div className="filters">
          <div className="filter-row">
            <div className="search-box" style={{ maxWidth: '400px' }}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search by name, email, phone or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filteredGuests.length === 0 ? (
          <EmptyState 
            icon={FaUser}
            title="No guests found"
            message={searchTerm ? "Try adjusting your search." : "Add your first guest to get started."}
            action={
              !searchTerm && (
                <button onClick={() => navigate('/guests/new')} className="btn btn-primary">
                  <FaPlus /> Add Guest
                </button>
              )
            }
          />
        ) : (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Nationality</th>
                    <th>ID Type</th>
                    <th>Type</th>
                    <th>Stays</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <tr key={guest._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {guest.firstName} {guest.lastName}
                        </div>
                        {guest.company && (
                          <div className="table-cell-sub">{guest.company}</div>
                        )}
                      </td>
                      <td>
                        <div>{guest.phone}</div>
                        {guest.email && (
                          <div className="table-cell-sub">{guest.email}</div>
                        )}
                      </td>
                      <td>{guest.nationality}</td>
                      <td>
                        <div>{guest.nationalIdType}</div>
                        <div className="table-cell-sub">{guest.nationalIdNumber}</div>
                      </td>
                      <td>
                        <StatusBadge status={guest.guestType || 'Regular'} />
                        {guest.blacklisted && (
                          <StatusBadge status="Blacklisted" className="ml-1" />
                        )}
                      </td>
                      <td>
                        <strong>{guest.totalStays || 0}</strong>
                        <div className="table-cell-sub">
                          ₹{(guest.totalSpent || 0).toLocaleString()} spent
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => navigate(`/guests/${guest._id}`)}
                            className="btn btn-icon btn-ghost btn-sm"
                            title="View Details"
                            aria-label="View guest details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => navigate(`/guests/${guest._id}/edit`)}
                            className="btn btn-icon btn-ghost btn-sm"
                            title="Edit"
                            aria-label="Edit guest"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(guest._id)}
                            className="btn btn-icon btn-ghost btn-sm"
                            title="Delete"
                            aria-label="Delete guest"
                            style={{ color: 'var(--color-danger)' }}
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