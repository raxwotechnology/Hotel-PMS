// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData)
};

// Guest API
export const guestAPI = {
  getGuests: () => api.get('/guests'),
  searchGuests: (query) => api.get('/guests/search', { params: { query } }),
  getGuest: (id) => api.get(`/guests/${id}`),
  createGuest: (guestData) => api.post('/guests', guestData),
  updateGuest: (id, guestData) => api.put(`/guests/${id}`, guestData),
  deleteGuest: (id) => api.delete(`/guests/${id}`),
  getGuestStats: () => api.get('/guests/stats')
};

// Travel Agent API
export const travelAgentAPI = {
  getAgents: () => api.get('/travel-agents'),
  getActiveAgents: () => api.get('/travel-agents/active'),
  getAgent: (id) => api.get(`/travel-agents/${id}`),
  createAgent: (agentData) => api.post('/travel-agents', agentData),
  updateAgent: (id, agentData) => api.put(`/travel-agents/${id}`, agentData),
  deleteAgent: (id) => api.delete(`/travel-agents/${id}`),
  updateBalance: (id, data) => api.put(`/travel-agents/${id}/balance`, data),
  getAgentStats: () => api.get('/travel-agents/stats')
};

// Reservation API
export const reservationAPI = {
  getReservations: () => api.get('/reservations'),
  getReservationsByStatus: (status) => api.get('/reservations/status', { params: { status } }),
  getReservationsByDateRange: (startDate, endDate) => api.get('/reservations/date-range', { params: { startDate, endDate } }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  createReservation: (reservationData) => api.post('/reservations', reservationData),
  updateReservation: (id, reservationData) => api.put(`/reservations/${id}`, reservationData),
  checkIn: (id, data) => api.put(`/reservations/${id}/check-in`, data),
  checkOut: (id, data) => api.put(`/reservations/${id}/check-out`, data),
  cancelReservation: (id, data) => api.put(`/reservations/${id}/cancel`, data),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
  getDashboardStats: () => api.get('/reservations/dashboard-stats')
};

// Room API
export const roomAPI = {
  getRooms: () => api.get('/rooms'),
  getRoomsByStatus: (status) => api.get('/rooms/status', { params: { status } }),
  getAvailableRooms: (checkIn, checkOut, roomType) => api.get('/rooms/available', { params: { checkInDate: checkIn, checkOutDate: checkOut, roomType } }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  updateRoomStatus: (id, statusData) => api.put(`/rooms/${id}/status`, statusData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  getRoomStats: () => api.get('/rooms/stats'),
  getHousekeepingTasks: () => api.get('/rooms/housekeeping')
};

// Guest Expense API
export const guestExpenseAPI = {
  getExpenses: () => api.get('/guest-expenses'),
  getExpensesByReservation: (reservationId) => api.get('/guest-expenses/reservation', { params: { reservationId } }),
  getExpensesByDate: (date) => api.get('/guest-expenses/date', { params: { date } }),
  getExpense: (id) => api.get(`/guest-expenses/${id}`),
  createExpense: (expenseData) => api.post('/guest-expenses', expenseData),
  updateExpense: (id, expenseData) => api.put(`/guest-expenses/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/guest-expenses/${id}`),
  getExpenseSummary: (startDate, endDate) => api.get('/guest-expenses/summary', { params: { startDate, endDate } })
};

// Invoice API
export const invoiceAPI = {
  getInvoices: () => api.get('/invoices'),
  getInvoicesByDate: (date) => api.get('/invoices/date', { params: { date } }),
  getInvoicesByReservation: (reservationId) => api.get('/invoices/reservation', { params: { reservationId } }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  generateInvoice: (reservationId) => api.post('/invoices/generate', { reservationId }),
  addPayment: (id, paymentData) => api.put(`/invoices/${id}/payment`, paymentData),
  updateInvoice: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  getInvoiceStats: (startDate, endDate) => api.get('/invoices/stats', { params: { startDate, endDate } })
};

export default api;