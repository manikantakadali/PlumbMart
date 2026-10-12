import React from 'react';
import { BookOpen, Wrench, Award, CheckCircle2 } from 'lucide-react';

export default function PlumberProductRequirements({ technicalCatalog }) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Product / Technical Requirements
          </h2>
          <p className="text-[11px] text-slate-400">
            Installation guidelines, pressure tolerances &amp; loyalty points
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(technicalCatalog || []).map((prod) => (
          <div
            key={prod.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-purple-400">
                  {prod.sku} • {prod.categoryName}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{prod.name}</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] shrink-0 border border-purple-500/30 flex items-center gap-1">
                <Award className="w-3 h-3" /> +{prod.plumberPoints} Pts
              </span>
            </div>

            {/* Technical Specs */}
            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-slate-400">Engineering Specs:</strong> {prod.specifications}
            </div>

            {/* Installation Guideline Note */}
            <div className="text-[11px] text-amber-200 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/30">
              <strong className="text-amber-300">Plumber Installation Note:</strong> {prod.installationNote}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
