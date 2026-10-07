import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('medifind_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('medifind_token');
    if (!savedToken) {
      setUser(null);
      setPharmacy(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        setPharmacy(data.pharmacy || null);
      } else {
        localStorage.removeItem('medifind_token');
        setUser(null);
        setPharmacy(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      localStorage.removeItem('medifind_token');
      setUser(null);
      setPharmacy(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('medifind_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPharmacy(res.pharmacy || null);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    if (res.success && res.token) {
      localStorage.setItem('medifind_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPharmacy(res.pharmacy || null);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('medifind_token');
    setToken(null);
    setUser(null);
    setPharmacy(null);
    api.post('/auth/logout').catch(() => {});
  };

  const updateProfile = async (payload) => {
    const res = await api.put('/auth/profile', payload);
    if (res.success) {
      if (res.user) setUser(res.user);
      if (res.pharmacy) setPharmacy(res.pharmacy);
      return res;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        pharmacy,
        token,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
