import React from 'react';
import {
  Pickaxe,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Layers,
  Award,
} from 'lucide-react';
import { MaterialMetallurgy, MetalFraction } from '../../lib/metallurgicalComposition';
import { AppLanguage } from '../../types/database';

interface MetallurgyCardProps {
  metallurgy: MaterialMetallurgy;
  approxWeightKg?: number;
  lang?: AppLanguage;
  compact?: boolean;
}

export const MetallurgyCard: React.FC<MetallurgyCardProps> = ({
  metallurgy,
  approxWeightKg = 10,
  lang = 'en',
  compact = false,
}) => {
  const preciousMetals = metallurgy.metals.filter(
    (m) => m.category === 'precious' || m.category === 'critical'
  );
  const baseMetals = metallurgy.metals.filter(
    (m) => m.category === 'base' || m.category === 'ferrous'
  );
  const polymers = metallurgy.metals.filter((m) => m.category === 'polymer');

  const getLocalizedMetalName = (m: MetalFraction) => {
    if (lang === 'mr' && m.name_mr) return m.name_mr;
    if (lang === 'hi' && m.name_hi) return m.name_hi;
    return m.name;
  };

  return (
    <div className="rounded-2xl bg-slate-900/95 border-2 border-emerald-500/40 p-4 space-y-3.5 shadow-xl text-left overflow-hidden relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
              <Pickaxe className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              AI Metallurgical Analysis • Urban Mine
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-100 mt-0.5">
            {metallurgy.title}
          </h4>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
            {metallurgy.purityGrade}
          </span>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">
            Circularity
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {metallurgy.totalRecyclabilityPercent}%
          </span>
        </div>
      </div>

      {/* Urban Mining Richness Highlight */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-850 to-emerald-500/15 border border-amber-500/30 flex items-start gap-2 text-xs">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <p className="text-[11px] text-amber-200/95 font-medium leading-relaxed">
          <strong>Urban Mining Value:</strong> {metallurgy.urbanMiningRichness}
        </p>
      </div>

      {/* Metal Concentrations with Percentage Bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          <span>Recoverable Metals & Elements</span>
          <span className="text-slate-400 font-mono font-normal">
            For {approxWeightKg} kg Scrap Lot
          </span>
        </div>

        <div className="space-y-2">
          {metallurgy.metals.map((metal) => {
            const yieldAmount = (
              (metal.gramsPerKg * approxWeightKg) /
              (metal.gramsPerKg >= 100 ? 1000 : 1)
            ).toFixed(metal.gramsPerKg >= 100 ? 2 : 1);
            const unit = metal.gramsPerKg >= 100 ? 'kg' : 'g';

            return (
              <div key={metal.symbol} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] text-slate-950 shadow-sm"
                      style={{ backgroundColor: metal.color }}
                    >
                      {metal.symbol}
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {getLocalizedMetalName(metal)}
                    </span>
                    {metal.category === 'precious' && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold uppercase">
                        Precious
                      </span>
                    )}
                    {metal.category === 'critical' && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-bold uppercase">
                        Critical
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-400">
                      ~{yieldAmount} {unit}
                    </span>
                    <span className="text-xs font-black text-slate-100">
                      {metal.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(metal.percentage * 2, 4))}%`,
                      backgroundColor: metal.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environmental & Carbon Offset Strip */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <Leaf className="w-3.5 h-3.5" />
          <span>
            Carbon Avoidance: ~{(metallurgy.carbonOffsetKgPerKg * approxWeightKg).toFixed(1)} kg CO₂
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>CPCB Form 6 Certified</span>
        </div>
      </div>
    </div>
  );
};
