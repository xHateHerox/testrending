
import React from 'react';
import { formatNumber, formatIdToName } from '../utils';

interface OfflineReport {
  durationMs: number;
  xpGained: Record<string, number>;
  itemsGained: Record<string, number>;
  kills: number;
}

interface OfflineModalProps {
  report: OfflineReport;
  onClose: () => void;
}

const OfflineModal: React.FC<OfflineModalProps> = ({ report, onClose }) => {
  const hours = Math.floor(report.durationMs / 3600000);
  const mins = Math.floor((report.durationMs % 3600000) / 60000);
  
  const hasGains = Object.keys(report.xpGained).length > 0 || Object.keys(report.itemsGained).length > 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
      <div className="w-full max-w-2xl bg-[#0a0c10] border border-cyan-500/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,229,255,0.15)] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-[2.5rem] pointer-events-none"></div>
        
        <div className="p-10">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-3xl text-cyan-400">
              <i className="fa-solid fa-hourglass-start animate-spin-slow"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Welcome Back</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Time Elapsed: {hours}h {mins}m</p>
            </div>
          </div>

          {!hasGains ? (
            <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl mb-8">
              <p className="text-slate-600 font-black text-xs uppercase tracking-widest">No activities were active while you were away.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* XP GAINS */}
              <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-1">Experience Gains</span>
                <div className="space-y-2">
                  {/* Fix: Explicitly cast entries to [string, number][] to avoid 'unknown' type errors for xp */}
                  {(Object.entries(report.xpGained) as [string, number][]).map(([skill, xp]) => (
                    <div key={skill} className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{skill}</span>
                      <span className="text-sm font-black text-cyan-400 mono">+{formatNumber(xp)} XP</span>
                    </div>
                  ))}
                  {report.kills > 0 && (
                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 flex justify-between items-center">
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-tight">Foes Defeated</span>
                      <span className="text-sm font-black text-red-500 mono">{report.kills} Kills</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ITEM GAINS */}
              <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-1">Items Gathered</span>
                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Fix: Explicitly cast entries to [string, number][] to avoid 'unknown' type errors for qty */}
                  {(Object.entries(report.itemsGained) as [string, number][]).map(([id, qty]) => (
                    <div key={id} className="bg-slate-950/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase truncate pr-4">{formatIdToName(id)}</span>
                      <span className="text-xs font-black text-white mono">x{formatNumber(qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full py-5 bg-cyan-500 text-slate-950 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-[0.98]"
          >
            Collect Rewards
          </button>
        </div>

        <div className="bg-slate-950/50 p-6 border-t border-white/5 text-center">
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">Progress Saved Successfully</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineModal;
