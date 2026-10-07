import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
          <Pill className="w-10 h-10 -rotate-45" />
        </div>

        <div>
          <span className="text-4xl font-black text-slate-900 tracking-tight">404</span>
          <h1 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h1>
          <p className="text-xs text-slate-500 mt-1">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Search Medicines</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
