// frontend/src/pages/HousekeepingEnhanced.js
import React, { useState, useEffect } from 'react';
import { FaBroom, FaCheck, FaClipboardCheck, FaBox, FaSyncAlt } from 'react-icons/fa';
import { roomAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { StatsSkeleton } from '../components/ui/LoadingSkeleton';

const RoomTable = ({ rooms, title, icon: Icon, color, badgeCount, emptyMessage, renderActions }) => (
  <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
    <div className="card-header">
      <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color }}>
        <Icon />
        {title}
      </h3>
      <span className="badge" style={{ 
        background: `${color}15`, 
        color,
        fontWeight: 600 
      }}>
        {badgeCount}
      </span>
    </div>
    {rooms.length === 0 ? (
      <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>
        <p>{emptyMessage}</p>
      </div>
    ) : (
      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Type</th>
              <th>Floor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id}>
                <td><strong>#{room.roomNumber}</strong></td>
                <td>{room.roomType}</td>
                <td>Floor {room.floor}</td>
                <td><StatusBadge status={room.cleaningStatus || 'Dirty'} /></td>
                <td>
                  <div className="table-actions">
                    {renderActions(room)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const HousekeepingEnhanced = () => {
  const [tasks, setTasks] = useState({
    dirty: [],
    pickup: [],
    inspection: [],
    inspected: [],
    available: []
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
    return (
      <div className="content-wrapper">
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: '300px' }} />
        </div>
        <StatsSkeleton count={3} />
      </div>
    );
  }

  return (
    <div>
      <div className="content-wrapper">
        <PageHeader 
          title="Housekeeping" 
          subtitle="Track room cleaning status and manage housekeeping tasks."
        >
          <button onClick={fetchHousekeepingTasks} className="btn btn-outline">
            <FaSyncAlt /> Refresh
          </button>
        </PageHeader>

        {/* Summary Stats */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="stat-card">
            <div className="stat-icon red"><FaBroom /></div>
            <div className="stat-content">
              <div className="stat-label">Dirty Rooms</div>
              <div className="stat-value">{tasks.dirty.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><FaCheck /></div>
            <div className="stat-content">
              <div className="stat-label">Ready for Pickup</div>
              <div className="stat-value">{tasks.pickup.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FaClipboardCheck /></div>
            <div className="stat-content">
              <div className="stat-label">Pending Inspection</div>
              <div className="stat-value">{tasks.inspection.length}</div>
            </div>
          </div>
        </div>

        {/* Dirty Rooms */}
        <RoomTable
          rooms={tasks.dirty}
          title="Dirty Rooms — Needs Cleaning"
          icon={FaBroom}
          color="var(--color-danger)"
          badgeCount={tasks.dirty.length}
          emptyMessage="All rooms are clean! ✨"
          renderActions={(room) => (
            <button onClick={() => markAsClean(room._id)} className="btn btn-sm btn-success">
              <FaCheck /> Mark Clean
            </button>
          )}
        />

        {/* Pickup Rooms */}
        <RoomTable
          rooms={tasks.pickup}
          title="Ready for Pickup"
          icon={FaCheck}
          color="var(--color-warning)"
          badgeCount={tasks.pickup.length}
          emptyMessage="No rooms ready for pickup."
          renderActions={(room) => (
            <button onClick={() => markAsClean(room._id)} className="btn btn-sm btn-success">
              <FaCheck /> Mark Clean
            </button>
          )}
        />

        {/* Inspection Rooms */}
        <RoomTable
          rooms={tasks.inspection}
          title="Pending Inspection"
          icon={FaClipboardCheck}
          color="var(--color-info)"
          badgeCount={tasks.inspection.length}
          emptyMessage="No rooms pending inspection."
          renderActions={(room) => (
            <>
              <button onClick={() => markAsInspected(room._id)} className="btn btn-sm btn-info">
                <FaClipboardCheck /> Inspected
              </button>
              <button onClick={() => markAsAvailable(room._id)} className="btn btn-sm btn-success">
                <FaCheck /> Available
              </button>
            </>
          )}
        />

        {/* Inspected Rooms */}
        {tasks.inspected && tasks.inspected.length > 0 && (
          <RoomTable
            rooms={tasks.inspected}
            title="Inspected"
            icon={FaClipboardCheck}
            color="var(--color-success)"
            badgeCount={tasks.inspected.length}
            emptyMessage="No inspected rooms."
            renderActions={(room) => (
              <button onClick={() => markAsAvailable(room._id)} className="btn btn-sm btn-success">
                <FaCheck /> Mark Available
              </button>
            )}
          />
        )}

        {/* Available Rooms */}
        {tasks.available && tasks.available.length > 0 && (
          <div className="card" style={{ borderLeft: '3px solid var(--color-success)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)' }}>
                <FaCheck /> Available
              </h3>
              <span className="badge badge-success">{tasks.available.length}</span>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.available.map(room => (
                    <tr key={room._id}>
                      <td><strong>#{room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>Floor {room.floor}</td>
                      <td><StatusBadge status={room.cleaningStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lost Items Modal */}
        {showLostItemsModal && (
          <div className="modal-overlay" onClick={() => setShowLostItemsModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <FaBox /> Mark Room as Clean
                  </div>
                  <p className="modal-description">Were any lost items found in this room?</p>
                </div>
                <button 
                  className="modal-close" 
                  onClick={() => {
                    setShowLostItemsModal(false);
                    setLostItemData({ itemDescription: '', location: '', foundBy: '', notes: '' });
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lostItemData.itemDescription}
                    onChange={(e) => setLostItemData({ ...lostItemData, itemDescription: e.target.value })}
                    placeholder="e.g., Black wallet, Phone charger (leave empty if none)"
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
              </div>
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    setShowLostItemsModal(false);
                    setLostItemData({ itemDescription: '', location: '', foundBy: '', notes: '' });
                  }} 
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button onClick={handleCleanWithItems} className="btn btn-success">
                  {lostItemData.itemDescription ? 'Record Item & Mark Clean' : 'Mark as Clean'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingEnhanced;