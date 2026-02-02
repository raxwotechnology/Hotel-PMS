// frontend/src/pages/admin/ManageRooms.js
import React, { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Single',
    price: '',
    capacity: '',
    floor: '',
    amenities: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAllRooms();
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      roomType: 'Single',
      price: '',
      capacity: '',
      floor: '',
      amenities: '',
      description: '',
      status: 'available'
    });
    setEditingRoom(null);
    setShowAddModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const roomData = {
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      floor: parseInt(formData.floor),
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a)
    };

    try {
      if (editingRoom) {
        await roomAPI.updateRoom(editingRoom._id, roomData);
        toast.success('Room updated successfully');
      } else {
        await roomAPI.addRoom(roomData);
        toast.success('Room added successfully');
      }
      fetchRooms();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      floor: room.floor.toString(),
      amenities: room.amenities.join(', '),
      description: room.description || '',
      status: room.status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await roomAPI.deleteRoom(roomId);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete room');
    }
  };

  if (loading) return <div className="loading">Loading rooms...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Rooms</h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          Add New Room
        </button>
      </div>

      {showAddModal && (
        <div className="card mb-4">
          <h3 className="card-title">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  className="form-control"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select
                  name="roomType"
                  className="form-control"
                  value={formData.roomType}
                  onChange={handleChange}
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price per Night (Rs. )</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (Guests)</label>
                <input
                  type="number"
                  name="capacity"
                  className="form-control"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Floor</label>
                <input
                  type="number"
                  name="floor"
                  className="form-control"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amenities (comma separated)</label>
              <input
                type="text"
                name="amenities"
                className="form-control"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="WiFi, AC, TV, Mini Bar"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Type</th>
                <th>Price</th>
                <th>Capacity</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Amenities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.roomType}</td>
                  <td>Rs. {room.price}</td>
                  <td>{room.capacity}</td>
                  <td>{room.floor}</td>
                  <td>
                    <span className={`badge ${
                      room.status === 'available' ? 'badge-success' :
                      room.status === 'occupied' ? 'badge-danger' :
                      room.status === 'maintenance' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td>{room.amenities.join(', ')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(room)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="btn btn-danger"
                        style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRooms;