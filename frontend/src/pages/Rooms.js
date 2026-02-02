// frontend/src/pages/Rooms.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaBed } from 'react-icons/fa';
import { roomAPI } from '../services/api';
import { toast } from 'react-toastify';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [statusFilter, typeFilter, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getRooms();
      setRooms(response.data);
      setFilteredRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(room => room.roomType === typeFilter);
    }
    
    setFilteredRooms(filtered);
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

  const updateRoomStatus = async (id, status) => {
    try {
      await roomAPI.updateRoomStatus(id, { status });
      toast.success('Room status updated');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Available': 'badge-success',
      'Occupied': 'badge-danger',
      'Reserved': 'badge-warning',
      'Maintenance': 'badge-secondary',
      'Out of Order': 'badge-danger',
      'Cleaning': 'badge-info'
    };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Rooms</h1>
        <div className="topbar-actions">
          <button onClick={() => navigate('/rooms/new')} className="btn btn-primary">
            <FaPlus /> Add New Room
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="filters">
          <div className="filter-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                className="form-control"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Twin">Twin</option>
                <option value="Suite">Suite</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Presidential">Presidential</option>
              </select>
            </div>
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="empty-state">
            <FaBed />
            <h3>No rooms found</h3>
            <p>Adjust filters or add a new room</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Base Price</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Cleaning</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room._id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{room.floor}</td>
                      <td>Rs. {room.basePrice.toLocaleString()}/night</td>
                      <td>{room.capacity.maxOccupancy} guests</td>
                      <td>{getStatusBadge(room.status)}</td>
                      <td>
                        <span className={`badge ${
                          room.cleaningStatus === 'Clean' ? 'badge-success' : 
                          room.cleaningStatus === 'Dirty' ? 'badge-danger' : 
                          'badge-warning'
                        }`}>
                          {room.cleaningStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => navigate(`/rooms/${room._id}/edit`)}
                            className="btn btn-sm btn-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          
                          {room.status === 'Maintenance' && (
                            <button
                              onClick={() => updateRoomStatus(room._id, 'Available')}
                              className="btn btn-sm btn-success"
                              title="Mark Available"
                            >
                              Available
                            </button>
                          )}
                          
                          {room.status === 'Available' && (
                            <button
                              onClick={() => updateRoomStatus(room._id, 'Maintenance')}
                              className="btn btn-sm btn-warning"
                              title="Maintenance"
                            >
                              Maintenance
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(room._id)}
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

export default Rooms;