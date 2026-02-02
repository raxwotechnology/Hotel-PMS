// frontend/src/pages/GuestExpenses.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaPlus, FaEdit, FaTrash, FaReceipt } from 'react-icons/fa';
import { guestExpenseAPI, reservationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const GuestExpenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reservationFilter, setReservationFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
    fetchActiveReservations();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [categoryFilter, dateFilter, reservationFilter, expenses]);

  const fetchExpenses = async () => {
    try {
      const response = await guestExpenseAPI.getExpenses();
      setExpenses(response.data);
      setFilteredExpenses(response.data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveReservations = async () => {
    try {
      const response = await reservationAPI.getReservationsByStatus('Checked-In');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to load reservations');
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
      filtered = filtered.filter(expense => {
        const expenseDate = format(new Date(expense.expenseDate), 'yyyy-MM-dd');
        return expenseDate === filterDate;
      });
    }

    if (reservationFilter !== 'all') {
      filtered = filtered.filter(expense => expense.reservation?._id === reservationFilter);
    }

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await guestExpenseAPI.deleteExpense(id);
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete expense');
    }
  };

  const getCategoryBadge = (category) => {
    const classes = {
      'Room Service': 'badge-info',
      'Restaurant': 'badge-success',
      'Bar': 'badge-warning',
      'Laundry': 'badge-secondary',
      'Spa': 'badge-info',
      'Minibar': 'badge-warning'
    };
    return <span className={`badge ${classes[category] || 'badge-secondary'}`}>{category}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const classes = {
      'Pending': 'badge-warning',
      'Paid': 'badge-success',
      'Added to Bill': 'badge-info'
    };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Guest Expenses</h1>
        <div className="topbar-actions">
          <button onClick={() => navigate('/expenses/new')} className="btn btn-primary">
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Summary Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="stats-grid">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                {filteredExpenses.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Expenses</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                ₹{getTotalAmount().toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Amount</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-row">
            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <select
                className="form-control"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Room Service">Room Service</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Bar">Bar</option>
                <option value="Laundry">Laundry</option>
                <option value="Spa">Spa</option>
                <option value="Gym">Gym</option>
                <option value="Minibar">Minibar</option>
                <option value="Telephone">Telephone</option>
                <option value="Internet">Internet</option>
                <option value="Parking">Parking</option>
                <option value="Transportation">Transportation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <select
                className="form-control"
                value={reservationFilter}
                onChange={(e) => setReservationFilter(e.target.value)}
              >
                <option value="all">All Reservations</option>
                {reservations.map(res => (
                  <option key={res._id} value={res._id}>
                    {res.reservationNumber} - {res.guest?.firstName} {res.guest?.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <DatePicker
                selected={dateFilter}
                onChange={(date) => setDateFilter(date)}
                className="form-control"
                dateFormat="MMM dd, yyyy"
                isClearable
                placeholderText="Filter by date"
              />
            </div>

            {(categoryFilter !== 'all' || dateFilter || reservationFilter !== 'all') && (
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setDateFilter(null);
                  setReservationFilter('all');
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <FaReceipt />
            <h3>No expenses found</h3>
            <p>Add expenses for checked-in guests</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reservation</th>
                    <th>Guest</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</td>
                      <td>
                        <strong>{expense.reservation?.reservationNumber}</strong>
                      </td>
                      <td>
                        {expense.guest?.firstName} {expense.guest?.lastName}
                      </td>
                      <td>{getCategoryBadge(expense.category)}</td>
                      <td>{expense.description}</td>
                      <td>{expense.quantity}</td>
                      <td>₹{expense.unitPrice.toLocaleString()}</td>
                      <td>₹{expense.taxAmount.toLocaleString()}</td>
                      <td><strong>₹{expense.totalAmount.toLocaleString()}</strong></td>
                      <td>{getPaymentStatusBadge(expense.paymentStatus)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => navigate(`/expenses/${expense._id}/edit`)}
                            className="btn btn-sm btn-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
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
                <tfoot>
                  <tr style={{ fontWeight: 'bold', background: '#f8fafc' }}>
                    <td colSpan="8" style={{ textAlign: 'right' }}>Total:</td>
                    <td>₹{getTotalAmount().toLocaleString()}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestExpenses;