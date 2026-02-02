// frontend/src/pages/HousekeepingEnhanced.js
import React, { useState, useEffect } from 'react';
import { FaBroom, FaCheck, FaClipboardCheck, FaBox } from 'react-icons/fa';
import { roomAPI } from '../services/api';
import { toast } from 'react-toastify';

const HousekeepingEnhanced = () => {
  const [tasks, setTasks] = useState({
    dirty: [],
    pickup: [],
    inspection: []
  });
  const [loading, setLoading] = useState(true);
  const [showLostItemsModal, setShowLostItemsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lostItemData, setLostItemData] = useState({
    itemDescription: '',
    location: '',
    foundBy: '',
    notes: ''
  });

  useEffect(() => {
    fetchHousekeepingTasks();
  }, []);

  const fetchHousekeepingTasks = async () => {
    try {
      const response = await roomAPI.getHousekeepingTasks();
      const data = response.data || { dirty: [], pickup: [], inspection: [], inspected: [], available: [] };
      setTasks({
        dirty: data.dirty || [],
        pickup: data.pickup || [],
        inspection: data.inspection || [],
        inspected: data.inspected || [],
        available: data.available || []
      });
    } catch (error) {
      toast.error('Failed to load housekeeping tasks');
      setTasks({ dirty: [], pickup: [], inspection: [], inspected: [], available: [] });
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

  const updateCleaningStatus = async (roomId, cleaningStatus) => {
    try {
      await roomAPI.updateRoomStatus(roomId, { 
        cleaningStatus 
      });
      toast.success('Cleaning status updated');
      fetchHousekeepingTasks();
    } catch (error) {
      toast.error('Failed to update cleaning status');
    }
  };

  const markAsClean = (roomId) => {
    setSelectedRoom(roomId);
    setShowLostItemsModal(true);
  };

  const handleCleanWithItems = async () => {
    try {
      const hasLostItems = lostItemData.itemDescription.trim() !== '';
      
      await roomAPI.updateRoomStatus(selectedRoom, { 
        status: 'Cleaning',
        cleaningStatus: 'Clean',
        ...(hasLostItems && {
          lostItems: [{
            itemDescription: lostItemData.itemDescription,
            location: lostItemData.location,
            foundBy: lostItemData.foundBy,
            foundDate: new Date(),
            notes: lostItemData.notes,
            status: 'Found'
          }]
        })
      });
      
      toast.success(hasLostItems ? 'Room marked clean and lost item recorded' : 'Room marked clean');
      setShowLostItemsModal(false);
      setLostItemData({ itemDescription: '', location: '', foundBy: '', notes: '' });
      setSelectedRoom(null);
      fetchHousekeepingTasks();
    } catch (error) {
      toast.error('Failed to update room');
    }
  };

  const markAsInspected = (roomId) => {
    updateRoomStatus(roomId, 'Cleaning', 'Inspected');
  };

  const markAsAvailable = async (roomId) => {
    try {
      await roomAPI.updateRoomStatus(roomId, { 
        status: 'Available',
        cleaningStatus: 'Clean'
      });
      toast.success('Room marked as available');
      fetchHousekeepingTasks();
    } catch (error) {
      toast.error('Failed to update room status');
    }
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
                    <th>Cleaning Status</th>
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
                        <select
                          className="form-control"
                          value={room.cleaningStatus || 'Dirty'}
                          onChange={(e) => updateCleaningStatus(room._id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="Dirty">Dirty</option>
                          <option value="Cleaning">In Progress</option>
                          <option value="Clean">Clean</option>
                          <option value="Inspected">Inspected</option>
                        </select>
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
                    <th>Cleaning Status</th>
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
                        <select
                          className="form-control"
                          value={room.cleaningStatus || 'Pickup'}
                          onChange={(e) => updateCleaningStatus(room._id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="Pickup">Pickup</option>
                          <option value="Cleaning">In Progress</option>
                          <option value="Clean">Clean</option>
                          <option value="Inspected">Inspected</option>
                        </select>
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
                    <th>Cleaning Status</th>
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
                        <select
                          className="form-control"
                          value={room.cleaningStatus || 'Clean'}
                          onChange={(e) => updateCleaningStatus(room._id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="Clean">Clean</option>
                          <option value="Inspected">Inspected</option>
                        </select>
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

        {/* For Inspected Section */}
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#3b82f6' }}>
              <FaClipboardCheck style={{ marginRight: '0.5rem' }} />
              Inspected
            </h3>
            <span className="badge badge-info">{tasks.inspection.length}</span>
          </div>

          {tasks.inspected.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p>No rooms inspected.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Cleaning Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.inspected.map((room) => (
                    <tr key={room._id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{room.floor}</td>
                      <td>
                        <select
                          className="form-control"
                          value={room.cleaningStatus || 'Clean'}
                          onChange={(e) => updateCleaningStatus(room._id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="Clean">Clean</option>
                          <option value="Inspected">Inspected</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
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

        {/* For Inspected Section */}
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#3b82f6' }}>
              <FaClipboardCheck style={{ marginRight: '0.5rem' }} />
              Available
            </h3>
            <span className="badge badge-info">{tasks.inspection.length}</span>
          </div>

          {tasks.available.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p>No rooms inspected.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room Number</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Cleaning Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.available.map((room) => (
                    <tr key={room._id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{room.floor}</td>
                      <td>{room.cleaningStatus}</td>
                        
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lost Items Modal */}
        {showLostItemsModal && (
          <div className="modal-overlay" onClick={() => setShowLostItemsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1.5rem' }}>
                <FaBox style={{ marginRight: '0.5rem' }} />
                Mark Room as Clean
              </h3>
              
              <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                Were any lost items found in this room?
              </p>

              <div className="form-group">
                <label className="form-label">Item Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={lostItemData.itemDescription}
                  onChange={(e) => setLostItemData({ ...lostItemData, itemDescription: e.target.value })}
                  placeholder="e.g., Black wallet, Phone charger (optional)"
                />
              </div>

              {lostItemData.itemDescription && (
                <>
                  <div className="form-group">
                    <label className="form-label">Location Found</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lostItemData.location}
                      onChange={(e) => setLostItemData({ ...lostItemData, location: e.target.value })}
                      placeholder="e.g., Under bed, In bathroom"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Found By</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lostItemData.foundBy}
                      onChange={(e) => setLostItemData({ ...lostItemData, foundBy: e.target.value })}
                      placeholder="Staff name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      value={lostItemData.notes}
                      onChange={(e) => setLostItemData({ ...lostItemData, notes: e.target.value })}
                      rows="2"
                      placeholder="Additional details"
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={handleCleanWithItems} className="btn btn-success">
                  {lostItemData.itemDescription ? 'Record Item & Mark Clean' : 'Mark as Clean'}
                </button>
                <button onClick={() => {
                  setShowLostItemsModal(false);
                  setLostItemData({ itemDescription: '', location: '', foundBy: '', notes: '' });
                }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default HousekeepingEnhanced;