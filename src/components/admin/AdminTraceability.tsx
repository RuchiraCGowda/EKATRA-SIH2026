import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Scale,
  IndianRupee,
  FileText,
  User,
  Factory,
  Camera,
  Layers,
} from 'lucide-react';
import { Lot, Handover, Payment, RecyclerProfile } from '../../types/database';

interface AdminTraceabilityProps {
  lots: Lot[];
  handovers: Handover[];
  payments: Payment[];
  recyclers: RecyclerProfile[];
}

export const AdminTraceability: React.FC<AdminTraceabilityProps> = ({
  lots,
  handovers,
  payments,
  recyclers,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('LOT-2026-0921-001');

  // Search by Lot Code, Handover Code, or Transaction Code
  const selectedLot = lots.find(
    (l) =>
      l.lot_code.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      l.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
      l.handover?.handover_code.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      l.payment?.transaction_code.toLowerCase().includes(searchQuery.trim().toLowerCase())
  ) || lots[0];

  const matchedHandover = handovers.find((h) => h.lot_id === selectedLot?.id);
  const matchedPayment = payments.find((p) => p.lot_id === selectedLot?.id);
  const matchedRecycler = recyclers.find(
    (r) => r.id === selectedLot?.selected_recycler_id
  );

  const steps = [
    {
      key: 'collected',
      title: '1. Material Collected',
      desc: 'Informal collector aggregated scrap and created digital lot with photo evidence.',
      time: selectedLot ? new Date(selectedLot.created_at).toLocaleString() : '—',
      completed: true,
    },
    {
      key: 'valued',
      title: '2. Valuation & Benchmark',
      desc: `Approx weight ${selectedLot?.approx_weight_kg} kg evaluated at ₹${selectedLot?.category?.benchmark_price_per_kg}/kg benchmark.`,
      time: selectedLot ? new Date(selectedLot.created_at).toLocaleString() : '—',
      completed: true,
    },
    {
      key: 'matched',
      title: '3. Recycler Matching',
      desc: 'Automated geospatial matching with SPCB licensed aggregators within operational radius.',
      time: selectedLot ? new Date(selectedLot.created_at).toLocaleString() : '—',
      completed: true,
    },
    {
      key: 'offer',
      title: '4. Offer Received & Accepted',
      desc: selectedLot?.agreed_rate_per_kg
        ? `Collector accepted formal quote of ₹${selectedLot.agreed_rate_per_kg}/kg from ${matchedRecycler?.company_name || 'Authorized Recycler'}.`
        : 'Offers received from authorized aggregators.',
      time: selectedLot ? new Date(selectedLot.updated_at).toLocaleString() : '—',
      completed: selectedLot?.status !== 'collected',
    },
    {
      key: 'handover',
      title: '5. Calibrated Handover',
      desc: matchedHandover
        ? `Handover verified with electronic crane scale. Verified weight: ${matchedHandover.verified_weight_kg} kg.`
        : 'Awaiting physical collection vehicle arrival.',
      time: matchedHandover ? new Date(matchedHandover.handover_timestamp).toLocaleString() : '—',
      completed: Boolean(matchedHandover),
    },
    {
      key: 'payment',
      title: '6. Payment Settlement',
      desc: matchedPayment
        ? `Payout of ₹${matchedPayment.amount_inr} settled via ${matchedPayment.payment_mode.toUpperCase()}. Voucher: ${matchedPayment.payment_reference}.`
        : 'Pending settlement.',
      time: matchedPayment ? new Date(matchedPayment.completed_at).toLocaleString() : '—',
      completed: Boolean(matchedPayment),
    },
    {
      key: 'recycling',
      title: '7. Formal Recycling & Material Re-entry',
      desc: matchedRecycler
        ? `Delivered to licensed facility (${matchedRecycler.facility_address}) under CPCB Form 6 Manifest.`
        : 'Scheduled for dismantling & copper/PCB recovery.',
      time: matchedPayment ? new Date(matchedPayment.completed_at).toLocaleString() : '—',
      completed: Boolean(matchedPayment),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100">
            End-to-End E-Waste Lifecycle Traceability Engine
          </h2>
          <p className="text-xs text-slate-400">
            Audit verifiable chain of custody from informal collector scrap pickup to authorized facility recycling
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Lot ID (e.g. LOT-2026-0921-001) or Handover Code..."
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {selectedLot && (
        <div className="space-y-6">
          {/* Key Lot Metadata Card */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={selectedLot.primary_image_url}
                  alt={selectedLot.category?.name_en}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Lot Reference</span>
                <span className="font-mono text-sm font-extrabold text-emerald-400">
                  {selectedLot.lot_code}
                </span>
                <div className="font-bold text-slate-100 mt-0.5">
                  {selectedLot.category?.name_en}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Origin Location & Geotag</span>
              <div className="font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {selectedLot.location_name}
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                {selectedLot.latitude.toFixed(4)}°N, {selectedLot.longitude.toFixed(4)}°E
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Collector & Recycler</span>
              <div className="text-slate-200 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Collector: {selectedLot.collector_id}
              </div>
              <div className="text-slate-200 font-semibold flex items-center gap-1">
                <Factory className="w-3.5 h-3.5 text-teal-400" />
                {matchedRecycler?.company_name || 'Aggregator pending'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Payout & Settlement</span>
              <div className="text-lg font-black text-emerald-400">
                ₹{selectedLot.final_sale_value_inr || selectedLot.estimated_value_inr}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {matchedPayment?.payment_reference || 'In Progress'}
              </div>
            </div>
          </div>

          {/* Circular Economy Flow Diagram (Section 25) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Circular Economy Closed-Loop Traceability
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Zero Landfill Diversion
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
              {[
                { title: 'Collector', desc: 'Informal Pickup' },
                { title: 'Collection', desc: 'Pre-sorting & Photo' },
                { title: 'Digital Lot', desc: 'Benchmark Rate' },
                { title: 'Auth Recycler', desc: 'SPCB Matched' },
                { title: 'Handover', desc: 'Calibrated Scale' },
                { title: 'Recovery', desc: 'Hydrometallurgy' },
                { title: 'Material Re-entry', desc: 'Secondary Metal' },
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-center"
                >
                  <span className="font-extrabold text-slate-200 text-xs">{c.title}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Step-by-Step Lifecycle Audit Trail */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">
              Lifecycle Stage Verification & Manifest Records
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-700">
              {steps.map((st, idx) => (
                <div key={idx} className="relative flex items-start gap-4 text-xs">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 font-bold ${
                      st.completed
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-slate-800'
                        : 'bg-slate-700 text-slate-400 ring-4 ring-slate-800'
                    }`}
                  >
                    {st.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">{st.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {st.time}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
