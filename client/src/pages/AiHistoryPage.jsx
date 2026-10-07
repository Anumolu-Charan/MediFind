import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Sparkles,
  Search,
  Clock,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';

export function AiHistoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/ai/history');
        if (res.success) {
          setHistory(res.data || []);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load AI query history', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [showToast]);

  const handleRerun = (prompt) => {
    navigate(`/search?ai=true&q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-emerald-600" />
              <span>AI Search & Entity Extraction History</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Historical logs of natural language requests parsed by Google Gemini AI
            </p>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Safety Directive:</span> All historical AI searches adhere to strict entity extraction protocols. The AI resolver never diagnoses medical conditions, never prescribes treatments, and never advises on dosages.
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-semibold">Loading AI history records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No AI Search Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              Try searching with plain English phrases like "I have fever and body pain" or "Need antibiotic for throat".
            </p>
            <button
              onClick={() => navigate('/search?ai=true')}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Start Natural Language Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {item.intent || 'medicine_search'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    "{item.raw_prompt}"
                  </h3>

                  {/* Extracted Details */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Medicine Identified:</span>
                      <span className="font-semibold text-slate-800">{item.medicine_name || 'Generic query'}</span>
                    </div>
                    {item.generic_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Generic Compound:</span>
                        <span className="font-semibold text-slate-800">{item.generic_name}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/50">
                      <span className="text-slate-400 shrink-0">Search Keywords:</span>
                      <span className="font-mono text-[11px] text-emerald-700 text-right truncate">
                        {Array.isArray(item.search_terms) ? item.search_terms.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Results found: <strong className="text-slate-700">{item.results_count || 0}</strong>
                  </span>
                  <button
                    onClick={() => handleRerun(item.raw_prompt)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <span>Re-run Query</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
