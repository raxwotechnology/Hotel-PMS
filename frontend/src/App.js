// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import CustomerLayout from './components/CustomerLayout';
import { FaBars } from 'react-icons/fa';

// Import all pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerHome from './pages/CustomerHome';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';

// Staff PMS Pages
import Guests from './pages/Guests';
import GuestForm from './pages/GuestForm';
import GuestDetails from './pages/GuestDetails';
import Reservations from './pages/Reservations';
import ReservationForm from './pages/ReservationForm';
import ReservationDetails from './pages/ReservationDetails';
import Rooms from './pages/Rooms';
import RoomForm from './pages/RoomForm';
import TravelAgents from './pages/TravelAgents';
import TravelAgentForm from './pages/TravelAgentForm';
import GuestExpenses from './pages/GuestExpenses';
import ExpenseForm from './pages/ExpenseForm';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import Housekeeping from './pages/HousekeepingEnhanced';
import Reports from './pages/Reports';

const STAFF_ROLES = ['admin', 'staff', 'manager', 'finance', 'housekeeping', 'maintenance'];

// Customer-Facing Route Wrapper (Uses CustomerLayout with topbar/footer, NO PMS sidebar)
const CustomerRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <CustomerLayout>{children}</CustomerLayout>;
};

// Staff-Only Protected Route Component (Renders internal PMS Sidebar + Topbar)
const StaffRoute = ({ children, allowedRoles = STAFF_ROLES }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || '').toLowerCase().trim();

  // If customer attempts to access staff routes, redirect to customer portal home
  if (userRole === 'customer') {
    return <Navigate to="/customer-home" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!hasRole) {
      return <Navigate to="/admin-dashboard" replace />;
    }
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
          </div>
          <div className="topbar-actions">
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

// Role-aware Dashboard Component
const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || '').toLowerCase().trim();

  // 1. Customer -> Customer Home Portal ONLY
  if (role === 'customer') {
    return <Navigate to="/customer-home" replace />;
  }

  // 2. Staff / Admin -> Internal Hotel PMS Dashboard
  if (STAFF_ROLES.includes(role)) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // 3. Unknown or unauthorized role -> Safe error screen (NEVER treat as admin!)
  return (
    <div className="content-wrapper" style={{ padding: '3rem', textAlign: 'center' }}>
      <h2>Unauthorized Account Role</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
        Your account role ({user.role || 'Unknown'}) does not have permission to access the internal hotel management dashboard.
      </p>
    </div>
  );
};

// Unified Profile Route (Adapts layout depending on role)
const UnifiedProfileRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || '').toLowerCase().trim();
  if (role === 'customer') {
    return (
      <CustomerLayout>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
          <Profile />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <StaffRoute allowedRoles={STAFF_ROLES}>
      <Profile />
    </StaffRoute>
  );
};

// Unified My Bookings Route (Customer gets modern portal layout)
const UnifiedBookingsRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || '').toLowerCase().trim();
  if (role === 'customer') {
    return (
      <CustomerLayout>
        <MyBookings />
      </CustomerLayout>
    );
  }

  return (
    <StaffRoute allowedRoles={STAFF_ROLES}>
      <MyBookings />
    </StaffRoute>
  );
};

// Public Route Component (Redirects authenticated users to their respective home)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const role = (user.role || '').toLowerCase().trim();
    if (role === 'customer') {
      return <Navigate to="/customer-home" replace />;
    }
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Dynamic /dashboard Resolver */}
        <Route 
          path="/dashboard" 
          element={<RoleBasedDashboard />} 
        />

        {/* Customer Dedicated Portal Routes */}
        <Route 
          path="/customer-home" 
          element={
            <CustomerRoute>
              <CustomerHome />
            </CustomerRoute>
          } 
        />
        <Route 
          path="/customer-dashboard" 
          element={<Navigate to="/customer-home" replace />} 
        />

        {/* Internal Staff / Admin Dedicated Dashboard */}
        <Route 
          path="/admin-dashboard" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Dashboard />
            </StaffRoute>
          } 
        />

        {/* Self-Service Profile (Role-adaptive Layout) */}
        <Route 
          path="/profile" 
          element={<UnifiedProfileRoute />} 
        />

        {/* My Reservations (Customer Portal Layout) */}
        <Route 
          path="/my-bookings" 
          element={<UnifiedBookingsRoute />} 
        />

        {/* Staff-Only Internal Management Routes */}
        <Route 
          path="/guests" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Guests />
            </StaffRoute>
          } 
        />
        <Route 
          path="/guests/new" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <GuestForm />
            </StaffRoute>
          } 
        />
        <Route 
          path="/guests/:id" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <GuestDetails />
            </StaffRoute>
          } 
        />
        <Route 
          path="/guests/:id/edit" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <GuestForm />
            </StaffRoute>
          } 
        />

        {/* Reservation Routes (Staff/Admin only) */}
        <Route 
          path="/reservations" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Reservations />
            </StaffRoute>
          } 
        />
        <Route 
          path="/reservations/new" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <ReservationForm />
            </StaffRoute>
          } 
        />
        <Route 
          path="/reservations/:id" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <ReservationDetails />
            </StaffRoute>
          } 
        />
        <Route 
          path="/reservations/:id/edit" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <ReservationForm />
            </StaffRoute>
          } 
        />

        {/* Room Routes (Staff/Admin only) */}
        <Route 
          path="/rooms" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Rooms />
            </StaffRoute>
          } 
        />
        <Route 
          path="/rooms/new" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <RoomForm />
            </StaffRoute>
          } 
        />
        <Route 
          path="/rooms/:id/edit" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <RoomForm />
            </StaffRoute>
          } 
        />

        {/* Travel Agent Routes (Staff/Admin only) */}
        <Route 
          path="/travel-agents" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <TravelAgents />
            </StaffRoute>
          } 
        />
        <Route 
          path="/travel-agents/new" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <TravelAgentForm />
            </StaffRoute>
          } 
        />
        <Route 
          path="/travel-agents/:id/edit" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <TravelAgentForm />
            </StaffRoute>
          } 
        />

        {/* Expense Routes (Staff/Admin only) */}
        <Route 
          path="/expenses" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <GuestExpenses />
            </StaffRoute>
          } 
        />
        <Route 
          path="/expenses/new" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <ExpenseForm />
            </StaffRoute>
          } 
        />
        <Route 
          path="/expenses/:id/edit" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <ExpenseForm />
            </StaffRoute>
          } 
        />

        {/* Invoice Routes (Staff/Admin only) */}
        <Route 
          path="/invoices" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Invoices />
            </StaffRoute>
          } 
        />
        <Route 
          path="/invoices/:id" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <InvoiceDetails />
            </StaffRoute>
          } 
        />

        {/* Housekeeping Route (Staff/Admin only) */}
        <Route 
          path="/housekeeping" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Housekeeping />
            </StaffRoute>
          } 
        />

        {/* Reports Route (Staff/Admin only) */}
        <Route 
          path="/reports" 
          element={
            <StaffRoute allowedRoles={STAFF_ROLES}>
              <Reports />
            </StaffRoute>
          } 
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="Toastify__toast"
      />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;