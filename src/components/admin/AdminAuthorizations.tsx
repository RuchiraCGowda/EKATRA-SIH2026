import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Ban, Clock, FileText, MapPin } from 'lucide-react';
import { RecyclerProfile, AuthorizationStatus } from '../../types/database';
import { EkatraDB } from '../../lib/supabase';

interface AdminAuthorizationsProps {
  recyclers: RecyclerProfile[];
  onRefresh: () => void;
}

export const AdminAuthorizations: React.FC<AdminAuthorizationsProps> = ({
  recyclers,
  onRefresh,
}) => {
  const [selectedRecycler, setSelectedRecycler] = useState<RecyclerProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const handleUpdateStatus = (recId: string, status: AuthorizationStatus) => {
    try {
      EkatraDB.updateRecyclerAuthorization(
        recId,
        status,
        adminNotes || `Status updated to ${status} by Regulatory Authority.`
      );
      setSelectedRecycler(null);
      setAdminNotes('');
      onRefresh();
      alert(`Recycler license status updated to: ${status.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      alert('Error updating authorization status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-1">
        <h2 className="text-lg font-bold text-slate-100">
          SPCB & CPCB Recycler License Authorization Registry
        </h2>
        <p className="text-xs text-slate-400">
          Verify, monitor, suspend, or renew aggregator facility credentials according to statutory E-Waste Management Rules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recyclers.map((rec) => {
          const isVerified = rec.authorization_status === 'verified';
          const isUnderReview = rec.authorization_status === 'under_review';

          return (
            <div
              key={rec.id}
              className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">{rec.company_name}</h3>
                  <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {rec.facility_address}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isVerified
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : isUnderReview
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {rec.authorization_status.toUpperCase()}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">SPCB License:</span>
                  <span className="text-slate-200 font-bold">{rec.spcb_license_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CPCB Reg No:</span>
                  <span className="text-slate-200 font-bold">{rec.cpcb_registration_no || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Capacity:</span>
                  <span className="text-teal-400 font-bold">{rec.capacity_per_month_mt} MT</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400 text-[11px]">
                  Pickup Service: {rec.pickup_available ? 'Available' : 'No'}
                </span>
                <button
                  onClick={() => setSelectedRecycler(rec)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs"
                >
                  Manage Status
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedRecycler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-100">
              Update License Status: {selectedRecycler.company_name}
            </h3>
            <p className="text-xs text-slate-400">
              Setting status will immediately update the recycler's profile and broadcast notifications to all matching algorithms.
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Administrative Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. SPCB renewal inspection approved on Sep 23, 2026..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleUpdateStatus(selectedRecycler.id, 'verified')}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Verify
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRecycler.id, 'under_review')}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold"
              >
                Under Review
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRecycler.id, 'suspended')}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Suspend
              </button>
            </div>

            <button
              onClick={() => setSelectedRecycler(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
