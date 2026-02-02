// frontend/src/pages/Invoices.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FaEye, FaPlus, FaFileInvoiceDollar } from 'react-icons/fa';
import { invoiceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [statusFilter, dateFilter, invoices]);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceAPI.getInvoices();
      setInvoices(response.data);
      setFilteredInvoices(response.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.paymentStatus === statusFilter);
    }

    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
      filtered = filtered.filter(invoice => {
        const invoiceDate = format(new Date(invoice.invoiceDate), 'yyyy-MM-dd');
        return invoiceDate === filterDate;
      });
    }

    setFilteredInvoices(filtered);
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Unpaid': 'badge-danger',
      'Partial': 'badge-warning',
      'Paid': 'badge-success',
      'Refunded': 'badge-secondary'
    };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  };

  const getTotalPaid = () => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.totalPaid, 0);
  };

  const getTotalDue = () => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1 className="topbar-title">Invoices</h1>
      </div>

      <div className="content-wrapper">
        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon blue">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Invoices</div>
              <div className="stat-value">{filteredInvoices.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Amount</div>
              <div className="stat-value">₹{getTotalAmount().toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Paid</div>
              <div className="stat-value">₹{getTotalPaid().toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-content">
              <div className="stat-label">Balance Due</div>
              <div className="stat-value">₹{getTotalDue().toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-row">
            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
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

            {(statusFilter !== 'all' || dateFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter(null);
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <FaFileInvoiceDollar />
            <h3>No invoices found</h3>
            <p>Invoices will appear here after checkout</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Reservation #</th>
                    <th>Guest</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td><strong>{invoice.invoiceNumber}</strong></td>
                      <td>{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</td>
                      <td>{invoice.reservation?.reservationNumber || 'N/A'}</td>
                      <td>
                        {invoice.guest?.firstName} {invoice.guest?.lastName}
                      </td>
                      <td>₹{invoice.totalAmount.toLocaleString()}</td>
                      <td>₹{invoice.totalPaid.toLocaleString()}</td>
                      <td>
                        <strong style={{ color: invoice.balanceDue > 0 ? '#f59e0b' : '#10b981' }}>
                          ₹{invoice.balanceDue.toLocaleString()}
                        </strong>
                      </td>
                      <td>{getStatusBadge(invoice.paymentStatus)}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/invoices/${invoice._id}`)}
                          className="btn btn-sm btn-primary"
                          title="View Details"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 'bold', background: '#f8fafc' }}>
                    <td colSpan="4" style={{ textAlign: 'right' }}>Total:</td>
                    <td>₹{getTotalAmount().toLocaleString()}</td>
                    <td>₹{getTotalPaid().toLocaleString()}</td>
                    <td>₹{getTotalDue().toLocaleString()}</td>
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

export default Invoices;