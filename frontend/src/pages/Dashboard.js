// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaBed, 
  FaCalendarCheck,
  FaDollarSign 
} from 'react-icons/fa';
import { reservationAPI, roomAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [roomStats, setRoomStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, roomsRes] = await Promise.all([
        reservationAPI.getDashboardStats(),
        roomAPI.getRoomStats()
      ]);
      setStats(dashboardRes.data);
      setRoomStats(roomsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Dashboard</h1>
        <div className="topbar-actions">
          <Link to="/reservations/new" className="btn btn-primary">
            + New Reservation
          </Link>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">
              <FaUserCheck />
            </div>
            <div className="stat-content">
              <div className="stat-label">Checking In Today</div>
              <div className="stat-value">{stats?.checkingInToday || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <FaUserTimes />
            </div>
            <div className="stat-content">
              <div className="stat-label">Checking Out Today</div>
              <div className="stat-value">{stats?.checkingOutToday || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FaBed />
            </div>
            <div className="stat-content">
              <div className="stat-label">Current Occupancy</div>
              <div className="stat-value">{stats?.currentOccupancy || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <FaCalendarCheck />
            </div>
            <div className="stat-content">
              <div className="stat-label">Confirmed Reservations</div>
              <div className="stat-value">{stats?.confirmedReservations || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-label">Revenue Today</div>
              <div className="stat-value">Rs. {stats?.revenueToday?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Room Statistics</h2>
            <Link to="/rooms" className="btn btn-outline btn-sm">
              View All Rooms
            </Link>
          </div>
          
          <div className="stats-grid">
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {roomStats?.totalRooms || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Rooms</div>
            </div>

            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {roomStats?.availableRooms || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Available</div>
            </div>

            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                {roomStats?.occupiedRooms || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Occupied</div>
            </div>

            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {roomStats?.occupancyRate || 0}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Occupancy Rate</div>
            </div>

            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {roomStats?.cleaningRooms || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Cleaning</div>
            </div>

            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>
                {roomStats?.maintenanceRooms || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Maintenance</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link to="/reservations/new" className="btn btn-primary">
              + New Reservation
            </Link>
            <Link to="/guests/new" className="btn btn-success">
              + New Guest
            </Link>
            <Link to="/expenses/new" className="btn btn-warning">
              + Add Expense
            </Link>
            <Link to="/housekeeping" className="btn btn-secondary">
              View Housekeeping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;