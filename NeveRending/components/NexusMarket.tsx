
import React from 'react';
import { SHOP_DATA } from '../constants';
import { formatNumber } from '../utils';

interface NexusMarketProps {
  credits: number;
  ownedUpgrades: string[];
  onBuy: (itemId: string, cost: number, type?: string) => void;
}

const NexusMarket: React.FC<NexusMarketProps> = ({ credits, ownedUpgrades, onBuy }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <div className="bg-[#0d0f14] border border-amber-500/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[120px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center text-5xl shadow-inner relative group">
              <div className="absolute inset-0 bg-amber-500/5 rounded-3xl animate-pulse"></div>
              🛒
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">Nexus Market</h2>
              <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em]">Supply Procurement Protocol</p>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex flex-col items-center min-w-[200px]">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Available Funds</span>
            <span className="text-3xl font-black text-amber-400 mono tracking-tighter">{formatNumber(credits)} Cr</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Supplies & Rations</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="grid gap-3">
            {SHOP_DATA.consumables.map(item => (
              <div key={item.id} className="bg-[#0d0f14] border border-[#1e293b] p-5 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-xl text-slate-600 group-hover:text-amber-500 transition-colors">📦</div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{item.name}</h4>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onBuy(item.id, item.price)}
                  disabled={credits < item.price}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${credits >= item.price ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                >
                  {item.price.toLocaleString()} Cr
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Stockpile Basics</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="grid gap-3">
            {SHOP_DATA.materials.map(item => (
              <div key={item.id} className="bg-[#0d0f14] border border-[#1e293b] p-5 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-xl text-slate-600 group-hover:text-amber-500 transition-colors">💎</div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{item.name}</h4>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onBuy(item.id, item.price)}
                  disabled={credits < item.price}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${credits >= item.price ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                >
                  {item.price.toLocaleString()} Cr
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-10 space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Core Protocol Overclocks</h3>
          <div className="h-px flex-1 bg-white/5"></div>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Permanent Enhancements</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SHOP_DATA.upgrades.map(upgrade => {
            const isOwned = ownedUpgrades.includes(upgrade.id);
            return (
              <div key={upgrade.id} className={`bg-[#0d0f14] border p-8 rounded-[2.5rem] relative overflow-hidden group ${isOwned ? 'border-green-500/20' : 'border-amber-500/10'}`}>
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${isOwned ? 'bg-green-500/5' : 'bg-amber-500/5 group-hover:bg-amber-500/10'}`}></div>
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-xl font-black uppercase tracking-tighter italic ${isOwned ? 'text-green-400' : 'text-white'}`}>
                        {upgrade.name} {isOwned && '✓'}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{upgrade.desc}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isOwned ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>⚡</div>
                  </div>
                  <button 
                    onClick={() => onBuy(upgrade.id, upgrade.price, 'permanent')}
                    disabled={isOwned || credits < upgrade.price}
                    className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-lg ${
                      isOwned 
                        ? 'bg-slate-900 text-green-500 cursor-not-allowed' 
                        : credits >= upgrade.price 
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                          : 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-40'
                    }`}
                  >
                    {isOwned ? 'Enhancement Installed' : `Purchase Module (${upgrade.price.toLocaleString()} Cr)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NexusMarket;
