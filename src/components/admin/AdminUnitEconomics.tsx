import React, { useState } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  ArrowRight,
  IndianRupee,
  CheckCircle,
} from 'lucide-react';
import { FieldResearchRecord, AnomalyRecord, Lot } from '../../types/database';
import { calculateUnitEconomics, UnitEconomicsModel } from '../../lib/unitEconomics';
import { EkatraDB } from '../../lib/supabase';

interface AdminUnitEconomicsProps {
  fieldResearch: FieldResearchRecord[];
  anomalies: AnomalyRecord[];
  lots: Lot[];
  onRefresh: () => void;
}

export const AdminUnitEconomics: React.FC<AdminUnitEconomicsProps> = ({
  fieldResearch,
  anomalies,
  lots,
  onRefresh,
}) => {
  const [model, setModel] = useState<UnitEconomicsModel>({
    materialCategory: 'High-Grade Telecom & PCB Scrap',
    monthlyVolumeKg: 65,
    informalMiddlemanRatePerKg: 210,
    ekatraPlatformRatePerKg: 320,
    informalTransportCostPerMonth: 850,
    ekatraDoorstepPickupSavingPerMonth: 850,
  });

  const comparison = calculateUnitEconomics(model);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-1">
        <h2 className="text-lg font-bold text-slate-100">
          Informal Collector Unit Economics & Field Research Evidence
        </h2>
        <p className="text-xs text-slate-400">
          Documented economic uplift comparing unregulated middleman extraction versus EKATRA formal aggregator auctioning
        </p>
      </div>

      {/* Interactive Unit Economics Model Simulator */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Live Monthly Income Comparison Calculator
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            +{comparison.percentageUplift}% Net Income Growth
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Monthly Scrap Volume (kg)</label>
            <input
              type="number"
              value={model.monthlyVolumeKg}
              onChange={(e) => setModel({ ...model, monthlyVolumeKg: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Informal Middleman Rate (₹/kg)</label>
            <input
              type="number"
              value={model.informalMiddlemanRatePerKg}
              onChange={(e) =>
                setModel({ ...model, informalMiddlemanRatePerKg: Number(e.target.value) })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-rose-300 font-bold"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">EKATRA Direct Rate (₹/kg)</label>
            <input
              type="number"
              value={model.ekatraPlatformRatePerKg}
              onChange={(e) =>
                setModel({ ...model, ekatraPlatformRatePerKg: Number(e.target.value) })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-bold"
            />
          </div>
        </div>

        {/* Visual Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Unregulated Traditional Pattern */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider block">
              1. Unregulated Middleman Channel
            </span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Gross Material Earnings:</span>
              <span className="font-mono">₹{comparison.traditionalMonthlyGross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Travel & Cart Rental Cost:</span>
              <span className="font-mono text-rose-400">
                -₹{comparison.traditionalTransportCost.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-rose-500/20 flex justify-between items-center">
              <span className="font-bold text-slate-200">Net Collector Take-Home:</span>
              <span className="text-xl font-black text-rose-400">
                ₹{comparison.traditionalNetIncome.toLocaleString()} / mo
              </span>
            </div>
          </div>

          {/* EKATRA Formal Bridge Channel */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">
              2. EKATRA Formal Aggregator Channel
            </span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Gross Material Earnings:</span>
              <span className="font-mono">₹{comparison.ekatraMonthlyGross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Doorstep Pickup Vehicle:</span>
              <span className="font-mono text-emerald-400">Included Free by Recycler</span>
            </div>
            <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center">
              <span className="font-bold text-slate-200">Net Collector Take-Home:</span>
              <span className="text-xl font-black text-emerald-400">
                ₹{comparison.ekatraNetIncome.toLocaleString()} / mo
              </span>
            </div>
          </div>
        </div>

        {/* Delta Callout */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Monthly Net Income Uplift:</span>
            <span className="text-lg font-black text-emerald-400">
              +₹{comparison.monthlyIncomeDifference.toLocaleString()} per collector
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Projected Annual Family Benefit:</span>
            <span className="text-lg font-black text-teal-300">
              +₹{comparison.annualAdditionalEarnings.toLocaleString()} / yr
            </span>
          </div>
        </div>
      </div>

      {/* Field Research Documentation Section (Section 48) */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-100 text-sm">
            Ground Field Research Records (Dharavi & Kurla Informal Collector Interviews)
          </h3>
        </div>

        <div className="space-y-3">
          {fieldResearch.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 text-sm">
                  {item.informal_collector_pseudonym}
                </span>
                <span className="text-slate-400">
                  {item.years_in_scrap_collection} years in informal collection • {item.hub_area}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed italic">"{item.notes}"</p>
              <div className="text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20 text-[11px]">
                <span className="font-bold block">Occupational Hazard Reported:</span>
                {item.health_issues_reported}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Detection Log (Section 35) */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Transparent Transaction Anomaly Detection
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Rule-based triggers with neutral review status
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">{anom.rule_triggered}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Transaction requires review
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{anom.details}</p>
              {anom.review_notes && (
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 text-[11px]">
                  <span className="font-bold text-emerald-400 block">Auditor Review:</span>
                  {anom.review_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
