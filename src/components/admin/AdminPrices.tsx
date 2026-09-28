import React, { useState } from 'react';
import { IndianRupee, ShieldCheck, Edit3, Save, X, Plus } from 'lucide-react';
import { PriceRecord } from '../../types/database';
import { EkatraDB } from '../../lib/supabase';

interface AdminPricesProps {
  prices: PriceRecord[];
  onRefresh: () => void;
}

export const AdminPrices: React.FC<AdminPricesProps> = ({ prices, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [buyingRate, setBuyingRate] = useState<number>(0);
  const [minRate, setMinRate] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(0);

  const startEdit = (p: PriceRecord) => {
    setEditingId(p.id);
    setBuyingRate(p.buying_price_per_kg);
    setMinRate(p.market_min_price);
    setMaxRate(p.market_max_price);
  };

  const handleSave = (id: string) => {
    try {
      EkatraDB.updatePriceRecord(id, buyingRate, minRate, maxRate);
      setEditingId(null);
      onRefresh();
      alert('Price record verified and published to collectors.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-1">
        <h2 className="text-lg font-bold text-slate-100">
          State E-Waste Buying Price Registry & Provenance Index
        </h2>
        <p className="text-xs text-slate-400">
          Statutory benchmark rates updated daily in coordination with CPCB and authorized metal recovery smelters
        </p>
      </div>

      <div className="space-y-3">
        {prices.map((p) => {
          const isEditing = editingId === p.id;

          return (
            <div
              key={p.id}
              className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-md"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{p.category?.name_en}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Verified
                  </span>
                </div>
                <p className="text-slate-400 mt-0.5">{p.sub_category_name}</p>
                <div className="text-[11px] text-slate-500 mt-1">
                  Source: {p.price_source} • Effective Date: {p.effective_date}
                </div>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Rate (₹/kg)</span>
                    <input
                      type="number"
                      value={buyingRate}
                      onChange={(e) => setBuyingRate(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Min</span>
                    <input
                      type="number"
                      value={minRate}
                      onChange={(e) => setMinRate(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Max</span>
                    <input
                      type="number"
                      value={maxRate}
                      onChange={(e) => setMaxRate(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(p.id)}
                    className="p-2 rounded-xl bg-emerald-600 text-white mt-4"
                    title="Save"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 rounded-xl bg-slate-700 text-slate-300 mt-4"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400">
                      ₹{p.buying_price_per_kg} / {p.unit}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Range: ₹{p.market_min_price} – ₹{p.market_max_price}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                    title="Edit Benchmark Price"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
