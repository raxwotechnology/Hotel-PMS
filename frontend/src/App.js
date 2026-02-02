// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Import all pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import GuestForm from './pages/GuestForm';
import GuestDetails from './pages/GuestDetails';
import Reservations from './pages/Reservations';
import ReservationForm from './pages/ReservationForm';
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
import ReservationDetails from './pages/ReservationDetails';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isStaff } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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

        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Guest Routes */}
        <Route 
          path="/guests" 
          element={
            <ProtectedRoute>
              <Guests />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guests/new" 
          element={
            <ProtectedRoute>
              <GuestForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guests/:id" 
          element={
            <ProtectedRoute>
              <GuestDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guests/:id/edit" 
          element={
            <ProtectedRoute>
              <GuestForm />
            </ProtectedRoute>
          } 
        />

        {/* Reservation Routes */}
        <Route 
          path="/reservations" 
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservations/new" 
          element={
            <ProtectedRoute>
              <ReservationForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservations/:id" 
          element={
            <ProtectedRoute>
              <ReservationDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservations/:id/edit" 
          element={
            <ProtectedRoute>
              <ReservationForm />
            </ProtectedRoute>
          } 
        />

        {/* Room Routes */}
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rooms/new" 
          element={
            <ProtectedRoute>
              <RoomForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rooms/:id/edit" 
          element={
            <ProtectedRoute>
              <RoomForm />
            </ProtectedRoute>
          } 
        />

        {/* Travel Agent Routes */}
        <Route 
          path="/travel-agents" 
          element={
            <ProtectedRoute>
              <TravelAgents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/travel-agents/new" 
          element={
            <ProtectedRoute>
              <TravelAgentForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/travel-agents/:id/edit" 
          element={
            <ProtectedRoute>
              <TravelAgentForm />
            </ProtectedRoute>
          } 
        />

        {/* Expense Routes */}
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute>
              <GuestExpenses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses/new" 
          element={
            <ProtectedRoute>
              <ExpenseForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses/:id/edit" 
          element={
            <ProtectedRoute>
              <ExpenseForm />
            </ProtectedRoute>
          } 
        />

        {/* Invoice Routes */}
        <Route 
          path="/invoices" 
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invoices/:id" 
          element={
            <ProtectedRoute>
              <InvoiceDetails />
            </ProtectedRoute>
          } 
        />

        {/* Housekeeping Route */}
        <Route 
          path="/housekeeping" 
          element={
            <ProtectedRoute>
              <Housekeeping />
            </ProtectedRoute>
          } 
        />

        {/* Reports Route */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* Default Routes */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
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