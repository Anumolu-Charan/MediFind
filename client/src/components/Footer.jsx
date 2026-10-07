import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Shield, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Pill className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-xl font-bold text-white">MediFind</span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              Empowering patients and caregivers to instantly discover real-time medicine availability, verify stock status across local pharmacies, and get Google Maps directions.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Supabase PostgreSQL + Realtime & Google Gemini AI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition-colors">
                  Medicine Catalog Search
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" className="hover:text-emerald-400 transition-colors">
                  Registered Pharmacies Directory
                </Link>
              </li>
              <li>
                <Link to="/ai-history" className="hover:text-emerald-400 transition-colors">
                  Natural Language AI Logs
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Pharmacy Portal Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Safety Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Safety Disclaimer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              MediFind is strictly an inventory and availability finder. Our AI models never provide medical diagnoses, treatment advice, or dosage prescriptions. Always consult a licensed medical professional.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} MediFind. Production-ready Full-Stack Web Application.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for patients & healthcare providers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
