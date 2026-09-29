// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        const userData = response.data;
        if (userData && userData.role) {
          userData.role = userData.role.toLowerCase().trim();
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const userData = response.data;
      if (userData && userData.role) {
        userData.role = userData.role.toLowerCase().trim();
      }
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userDataInput) => {
    try {
      const response = await authAPI.register(userDataInput);
      const userData = response.data;
      if (userData && userData.role) {
        userData.role = userData.role.toLowerCase().trim();
      }
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = prev ? { ...prev, ...updatedData } : updatedData;
      if (merged && merged.role) {
        merged.role = merged.role.toLowerCase().trim();
      }
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const role = (user?.role || '').toLowerCase().trim();
  const isCustomer = role === 'customer';
  const isAdmin = role === 'admin';
  const isStaff = ['admin', 'staff', 'manager', 'finance', 'housekeeping', 'maintenance'].includes(role);

  const value = {
    user,
    role,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin,
    isCustomer,
    isStaff
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};