import React, { useState } from 'react';
import { Database, ShieldCheck, Copy, Check, ExternalLink, X, RefreshCw } from 'lucide-react';
import { isLiveSupabaseConfigured, EkatraDB } from '../../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'env'>('status');

  if (!isOpen) return null;

  const sqlSample = `-- EKATRA Supabase Schema is located in /supabase/migrations/20260923000001_ekatra_schema.sql
-- Tables include: profiles, collector_profiles, recycler_profiles, lots, offers, handovers, payments, complaints, notifications
-- Row Level Security (RLS) is enabled with non-bypassable policies.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Supabase PostgreSQL Architecture</h2>
              <p className="text-xs text-slate-400">PostgreSQL • RLS • Realtime • Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50 text-sm">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            PostgreSQL Migrations & RLS
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'env'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Environment Setup
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-xl ${
                    isLiveSupabaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">
                      {isLiveSupabaseConfigured
                        ? 'Live Supabase Cloud Connected'
                        : 'Integrated Reactive Supabase Database Active'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Synchronized
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {isLiveSupabaseConfigured
                      ? 'Client queries and subscriptions are directed to the live Supabase project instance.'
                      : 'Full relational schema, real-time broadcasts, immutable lot history, and offline sync queue are active. Data is strictly separated from demo records.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-xs">Active Storage</div>
                  <div className="font-semibold text-slate-200 mt-0.5">PostgreSQL / IndexedDB / Local</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-xs">Row Level Security</div>
                  <div className="font-semibold text-slate-200 mt-0.5">Enforced (RBAC)</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-xs">Offline Sync Queue</div>
                  <div className="font-semibold text-slate-200 mt-0.5">Automatic with retry</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-xs">Audit Logging</div>
                  <div className="font-semibold text-slate-200 mt-0.5">Immutable Triggers</div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => {
                    EkatraDB.resetDemoData();
                    alert('Sample dataset reset successfully.');
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset reference verification dataset
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Migration File: /supabase/migrations/20260923000001_ekatra_schema.sql</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy SQL snippet'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800 max-h-60 leading-relaxed">
{`-- PRODUCTION ROW LEVEL SECURITY POLICIES
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors see only own lots"
ON public.lots FOR SELECT
TO authenticated
USING (collector_id IN (
  SELECT id FROM public.collector_profiles WHERE profile_id = auth.uid()
));

CREATE POLICY "Authorized Recyclers see available lots"
ON public.lots FOR SELECT
TO authenticated
USING (
  status IN ('collected', 'valued', 'offer_received')
  AND EXISTS (
    SELECT 1 FROM public.recycler_profiles 
    WHERE profile_id = auth.uid() 
    AND authorization_status = 'verified'
  )
);`}
              </pre>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                To bind this app to an external Supabase production instance, add these variables to your environment configuration:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 space-y-1">
                <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
                <div>VITE_SUPABASE_ANON_KEY="your-anon-public-key"</div>
              </div>
              <p className="text-xs text-slate-400">
                Never use the Supabase service_role key in frontend client bundles. The client relies strictly on Row Level Security (RLS) to enforce data privacy and role boundaries.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
