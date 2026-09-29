// frontend/src/pages/Rooms.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBed } from 'react-icons/fa';
import { roomAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { StatsSkeleton } from '../components/ui/LoadingSkeleton';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getRooms();
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomAPI.deleteRoom(id);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete room');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchTerm || 
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.roomType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const roomTypes = [...new Set(rooms.map(r => r.roomType))];

  if (loading) {
    return (
      <div className="content-wrapper">
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: '260px' }} />
        </div>
        <StatsSkeleton count={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="content-wrapper">
        <PageHeader 
          title="Rooms" 
          subtitle="Manage room inventory, availability and status."
        >
          <button onClick={() => navigate('/rooms/new')} className="btn btn-primary">
            <FaPlus /> Add Room
          </button>
        </PageHeader>

        {/* Filters */}
        <div className="filters">
          <div className="filter-row">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search room number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '180px' }}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Order">Out of Order</option>
            </select>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ maxWidth: '180px' }}
            >
              <option value="all">All Types</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState 
            icon={FaBed}
            title="No rooms found"
            message={searchTerm || statusFilter !== 'all' ? "Try adjusting your filters." : "Add your first room to get started."}
            action={
              !searchTerm && statusFilter === 'all' && (
                <button onClick={() => navigate('/rooms/new')} className="btn btn-primary">
                  <FaPlus /> Add Room
                </button>
              )
            }
          />
        ) : (
          <div className="room-cards-grid">
            {filteredRooms.map((room) => (
              <div key={room._id} className="room-card">
                <div className="room-card-header">
                  <div className="room-card-number">#{room.roomNumber}</div>
                  <StatusBadge status={room.status} />
                </div>
                <div className="room-card-type">{room.roomType}</div>
                <div className="room-card-info">
                  <span>Floor {room.floor}</span>
                  <span>{room.bedConfiguration}</span>
                  {room.capacity && <span>Max {room.capacity.maxOccupancy} guests</span>}
                </div>
                {room.cleaningStatus && room.cleaningStatus !== 'Clean' && (
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <StatusBadge status={room.cleaningStatus} />
                  </div>
                )}
                <div className="room-card-footer">
                  <div className="room-card-price">
                    ₹{room.basePrice?.toLocaleString()}
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 400 }}>/night</span>
                  </div>
                  <div className="table-actions">
                    <button
                      onClick={() => navigate(`/rooms/${room._id}/edit`)}
                      className="btn btn-icon btn-ghost btn-sm"
                      title="Edit Room"
                      aria-label="Edit room"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="btn btn-icon btn-ghost btn-sm"
                      title="Delete Room"
                      aria-label="Delete room"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;