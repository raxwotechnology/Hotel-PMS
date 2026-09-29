// frontend/src/components/ui/StatusBadge.js
import React from 'react';

const STATUS_MAP = {
  // Reservation statuses
  'Confirmed':    'badge-info',
  'Checked-In':   'badge-success',
  'Checked-Out':  'badge-secondary',
  'Cancelled':    'badge-danger',
  'No-Show':      'badge-warning',

  // Room statuses
  'Available':    'badge-success',
  'Occupied':     'badge-danger',
  'Reserved':     'badge-info',
  'Cleaning':     'badge-warning',
  'Maintenance':  'badge-secondary',
  'Out of Order': 'badge-danger',

  // Cleaning statuses
  'Clean':        'badge-success',
  'Dirty':        'badge-danger',
  'Inspected':    'badge-info',
  'Pickup':       'badge-warning',

  // Payment statuses
  'Paid':         'badge-success',
  'Partial':      'badge-warning',
  'Unpaid':       'badge-danger',
  'Pending':      'badge-warning',
  'Overdue':      'badge-danger',
  'Refunded':     'badge-purple',

  // Guest types
  'VIP':          'badge-accent',
  'Corporate':    'badge-info',
  'Regular':      'badge-secondary',
  'Group':        'badge-purple',
  'Blacklisted':  'badge-danger',

  // Agent statuses
  'Active':       'badge-success',
  'Inactive':     'badge-secondary',
  'Suspended':    'badge-danger',

  // Payment status
  'Added to Bill': 'badge-info',

  // Expense payment
  'paid':         'badge-success',
  'pending':      'badge-warning',
  'cancelled':    'badge-danger',
  'refunded':     'badge-purple',

  // Booking
  'confirmed':    'badge-info',
  'checked-in':   'badge-success',
  'checked-out':  'badge-secondary',
};

const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const badgeClass = STATUS_MAP[status] || 'badge-secondary';

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
