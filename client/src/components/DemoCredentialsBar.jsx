import React from 'react';
import { Shield, Store, UserCheck, KeyRound } from 'lucide-react';

export function DemoCredentialsBar({ onSelect }) {
  const credentials = [
    {
      role: 'Admin',
      email: 'admin@medifind.com',
      pass: 'Admin@123',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      icon: Shield,
    },
    {
      role: 'Pharmacy',
      email: 'careplus@medifind.com',
      pass: 'Pharmacy@123',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      icon: Store,
    },
    {
      role: 'Patient',
      email: 'patient@medifind.com',
      pass: 'Patient@123',
      color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
      icon: UserCheck,
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <KeyRound className="w-3.5 h-3.5" />
        <span>Demo Evaluation Quick Credentials (Click to fill)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {credentials.map((cred) => {
          const Icon = cred.icon;
          return (
            <button
              key={cred.role}
              type="button"
              onClick={() => onSelect(cred.email, cred.pass)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${cred.color}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-bold">{cred.role}</span>
              </div>
              <span className="text-[11px] opacity-75 font-mono">{cred.email.split('@')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
