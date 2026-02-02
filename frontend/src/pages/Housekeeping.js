// frontend/src/pages/Housekeeping.js
import React, { useState, useEffect } from 'react';
import { FaBroom, FaCheck, FaClipboardCheck } from 'react-icons/fa';
import { roomAPI } from '../services/api';
import { toast } from 'react-toastify';

const Housekeeping = () => {
  const [tasks, setTasks] = useState({
    dirty: [],
    pickup: [],
    inspection: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHousekeepingTasks();
  }, []);

  const fetchHousekeepingTasks = async () => {
    try {
      const response = await roomAPI.getHousekeepingTasks();
      // Ensure we have the correct structure
      const data = response.data || { dirty: [], pickup: [], inspection: [] };
      setTasks({
        dirty: data.dirty || [],
        pickup: data.pickup || [],
        inspection: data.inspection || []
      });
    } catch (error) {
      toast.error('Failed to load housekeeping tasks');
      // Set empty arrays on error
      setTasks({ dirty: [], pickup: [], inspection: [] });
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (roomId, status, cleaningStatus) => {
    try {
      await roomAPI.updateRoomStatus(roomId, { 
        status,
        cleaningStatus 
      });
      toast.success('Room status updated');
      fetchHousekeepingTasks();
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

  const markAsClean = (roomId) => {
    updateRoomStatus(roomId, 'Cleaning', 'Clean');
  };

  const markAsInspected = (roomId) => {
    updateRoomStatus(roomId, 'Cleaning', 'Inspected');
  };

  const markAsAvailable = (roomId) => {
    updateRoomStatus(roomId, 'Available', 'Clean');
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Housekeeping Dashboard</h1>
        <div className="topbar-actions">
          <button onClick={fetchHousekeepingTasks} className="btn btn-outline">
            Refresh
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Summary Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon red">
              <FaBroom />
            </div>
            <div className="stat-content">
              <div className="stat-label">Dirty Rooms</div>
              <div className="stat-value">{tasks.dirty.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <FaCheck />
            </div>
            <div className="stat-content">
              <div className="stat-label">Ready for Pickup</div>
              <div className="stat-value">{tasks.pickup.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FaClipboardCheck />
            </div>
            <div className="stat-content">
              <div className="stat-label">For Inspection</div>
              <div className="stat-value">{tasks.inspection.length}</div>
            </div>
          </div>
        </div>

        {/* Dirty Rooms Section */}
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#ef4444' }}>
              <FaBroom style={{ marginRight: '0.5rem' }} />
              Dirty Rooms - Needs Cleaning
            </h3>
            <span className="badge badge-danger">{tasks.dirty.length}</span>
          </div>

          {tasks.dirty.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p>No dirty rooms. All cleaned! 🎉</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.dirty.map((room) => (
                    <tr key={room._id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{room.floor}</td>
                      <td>
                        <span className="badge badge-danger">Dirty</span>
                      </td>
                      <td>
                        <button
                          onClick={() => markAsClean(room._id)}
                          className="btn btn-sm btn-success"
                        >
                          <FaCheck /> Mark as Clean
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ready for Pickup Section */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#f59e0b' }}>
              <FaCheck style={{ marginRight: '0.5rem' }} />
              Ready for Pickup
            </h3>
            <span className="badge badge-warning">{tasks.pickup.length}</span>
          </div>

          {tasks.pickup.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p>No rooms ready for pickup.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.pickup.map((room) => (
                    <tr key={room._id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{room.floor}</td>
                      <td>
                        <span className="badge badge-warning">Pickup</span>
                      </td>
                      <td>
                        <button
                          onClick={() => markAsClean(room._id)}
                          className="btn btn-sm btn-success"
                        >
                          <FaCheck /> Mark as Clean
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* For Inspection Section */}
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#3b82f6' }}>
              <FaClipboardCheck style={{ marginRight: '0.5rem' }} />
              For Inspection
            </h3>
            <span className="badge badge-info">{tasks.inspection.length}</span>
          </div>

          {tasks.inspection.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p>No rooms pending inspection.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.inspection.map((room) => (
                    <tr key={room._id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{room.floor}</td>
                      <td>
                        <span className="badge badge-success">Clean</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => markAsInspected(room._id)}
                            className="btn btn-sm btn-info"
                          >
                            <FaClipboardCheck /> Inspected
                          </button>
                          <button
                            onClick={() => markAsAvailable(room._id)}
                            className="btn btn-sm btn-success"
                          >
                            <FaCheck /> Mark Available
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Housekeeping;