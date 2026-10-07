import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Pill,
  Search,
  MapPin,
  Sparkles,
  User,
  LogOut,
  LayoutDashboard,
  Boxes,
  ShieldCheck,
  Menu,
  X,
  Radio,
} from 'lucide-react';

export function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                MediFind
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                Live Stock
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/search"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/search')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Find Medicine
            </Link>

            <Link
              to="/pharmacies"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/pharmacies')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Pharmacies
            </Link>

            <Link
              to="/ai-history"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/ai-history')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              AI Searches
            </Link>

            {/* Role-specific dashboards */}
            {isAuthenticated && role === 'patient' && (
              <Link
                to="/patient"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/patient')
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            )}

            {isAuthenticated && role === 'pharmacy' && (
              <>
                <Link
                  to="/pharmacy"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/pharmacy')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Pharmacy
                </Link>
                <Link
                  to="/pharmacy/inventory"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/pharmacy/inventory')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  Inventory
                </Link>
              </>
            )}

            {isAuthenticated && role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Section: Realtime badge & Auth state */}
          <div className="hidden md:flex items-center gap-3">
            {/* Realtime Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Realtime Sync</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">{user.name}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                      {role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Search className="w-4 h-4 text-emerald-600" />
            Find Medicine
          </Link>
          <Link
            to="/pharmacies"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            Pharmacies
          </Link>
          <Link
            to="/ai-history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AI Search History
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Logged in as {user.name} ({role})
              </div>
              {role === 'patient' && (
                <Link
                  to="/patient"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Patient Dashboard
                </Link>
              )}
              {role === 'pharmacy' && (
                <>
                  <Link
                    to="/pharmacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Pharmacy Dashboard
                  </Link>
                  <Link
                    to="/pharmacy/inventory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Boxes className="w-4 h-4" />
                    Manage Inventory
                  </Link>
                </>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <User className="w-4 h-4" />
                Profile & Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
