import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { MedicineSearchPage } from './pages/MedicineSearchPage.jsx';
import { SearchResultsPage } from './pages/SearchResultsPage.jsx';
import { PharmaciesDirectoryPage } from './pages/PharmaciesDirectoryPage.jsx';
import { PharmacyDetailsPage } from './pages/PharmacyDetailsPage.jsx';
import { AiHistoryPage } from './pages/AiHistoryPage.jsx';
import { PatientDashboard } from './pages/PatientDashboard.jsx';
import { PharmacyDashboard } from './pages/PharmacyDashboard.jsx';
import { InventoryManagementPage } from './pages/InventoryManagementPage.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/search" element={<MedicineSearchPage />} />
                <Route path="/search-results" element={<SearchResultsPage />} />
                <Route path="/pharmacies" element={<PharmaciesDirectoryPage />} />
                <Route path="/pharmacies/:id" element={<PharmacyDetailsPage />} />
                <Route path="/ai-history" element={<AiHistoryPage />} />

                {/* Patient Protected Dashboard */}
                <Route
                  path="/patient"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'admin']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Pharmacy Protected Console */}
                <Route
                  path="/pharmacy"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
                      <PharmacyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
                      <InventoryManagementPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* User Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Error Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
