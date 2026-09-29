// frontend/src/components/CustomerLayout.js
import React from 'react';
import CustomerNavbar from './CustomerNavbar';
import CustomerFooter from './CustomerFooter';
import '../pages/CustomerPortal.css';

const CustomerLayout = ({ children }) => {
  return (
    <div className="guest-portal-root">
      <CustomerNavbar />
      <main className="guest-portal-main">
        {children}
      </main>
      <CustomerFooter />
    </div>
  );
};

export default CustomerLayout;
