// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaBed, 
  FaCalendarCheck,
  FaDollarSign,
  FaPlus,
  FaReceipt,
  FaBroom,
  FaUser
} from 'react-icons/fa';
import { reservationAPI, roomAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { StatsSkeleton } from '../components/ui/LoadingSkeleton';

const STAFF_ROLES = ['admin', 'staff', 'manager', 'finance', 'housekeeping', 'maintenance'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [roomStats, setRoomStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = (user?.role || '').toLowerCase().trim();

  useEffect(() => {
    if (STAFF_ROLES.includes(role)) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (role === 'customer') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!STAFF_ROLES.includes(role)) {
    return (
      <div className="content-wrapper" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Unauthorized Access</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Your account does not have internal hotel management permissions.
        </p>
      </div>
    );
  }

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="content-wrapper">
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: '300px' }} />
        </div>
        <StatsSkeleton count={5} />
        <div className="skeleton skeleton-card" style={{ height: '200px', marginBottom: '1.5rem' }} />
        <div className="skeleton skeleton-card" style={{ height: '120px' }} />
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
        <p>{today} — Here's what's happening at your hotel today.</p>
      </div>

      {/* KPI Cards */}
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
          <div className="stat-icon accent">
            <FaDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-label">Revenue Today</div>
            <div className="stat-value">Rs. {stats?.revenueToday?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>

      {/* Room Statistics */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h2 className="card-title">Room Overview</h2>
          <Link to="/rooms" className="btn btn-outline btn-sm">
            View All Rooms
          </Link>
        </div>
        <div className="card-body">
          <div className="room-stats-grid">
            <div className="room-stat-item">
              <div className="room-stat-value" style={{ color: 'var(--color-info)' }}>
                {roomStats?.totalRooms || 0}
              </div>
              <div className="room-stat-label">Total Rooms</div>
            </div>
            <div className="room-stat-item">
              <div className="room-stat-value" style={{ color: 'var(--color-success)' }}>
                {roomStats?.availableRooms || 0}
              </div>
              <div className="room-stat-label">Available</div>
            </div>
            <div className="room-stat-item">
              <div className="room-stat-value" style={{ color: 'var(--color-danger)' }}>
                {roomStats?.occupiedRooms || 0}
              </div>
              <div className="room-stat-label">Occupied</div>
            </div>
            <div className="room-stat-item">
              <div className="room-stat-value" style={{ color: 'var(--color-warning)' }}>
                {roomStats?.occupancyRate || 0}%
              </div>
              <div className="room-stat-label">Occupancy Rate</div>
            </div>
            <div className="room-stat-item">
              <div className="room-stat-value" style={{ color: '#7C3AED' }}>
                {roomStats?.cleaningRooms || 0}
              </div>
              <div className="room-stat-label">Cleaning</div>
            </div>
            <div className="room-stat-item">
              <div className="room-stat-value" style={{ color: 'var(--text-muted)' }}>
                {roomStats?.maintenanceRooms || 0}
              </div>
              <div className="room-stat-label">Maintenance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="quick-actions-grid">
            <Link to="/reservations/new" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                <FaPlus />
              </div>
              New Reservation
            </Link>
            <Link to="/guests/new" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <FaUser />
              </div>
              Add Guest
            </Link>
            <Link to="/expenses/new" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <FaReceipt />
              </div>
              Add Expense
            </Link>
            <Link to="/housekeeping" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                <FaBroom />
              </div>
              Housekeeping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;