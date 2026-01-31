
import React, { useState, useMemo } from 'react';
import { SkillId } from '../types';
import { SKILL_DATA, MONSTER_DATA } from '../constants';
import { formatIdToName } from '../utils';

interface DevConsoleProps {
  onClose: () => void;
  onAddLevel: (sId: SkillId, level: number) => void;
  onAddItem: (itemId: string, qty: number) => void;
}

const DevConsole: React.FC<DevConsoleProps> = ({ onClose, onAddLevel, onAddItem }) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'items'>('levels');
  const [levelValue, setLevelValue] = useState(99);
  const [itemSearch, setItemSearch] = useState('');
  const [itemQty, setItemQty] = useState(100);

  const allItemIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(SKILL_DATA).forEach(s => s.items.forEach(i => ids.add(i.id)));
    Object.values(MONSTER_DATA).forEach(m => m.drops.forEach(d => ids.add(d.id)));
    ids.add('aetheric_shard');
    ids.add('void_core');
    ids.add('astral_prism');
    ids.add('mana_crystal');
    ids.add('pure_essence');
    return Array.from(ids).sort();
  }, []);

  const filteredItems = useMemo(() => {
    if (!itemSearch) return allItemIds.slice(0, 50);
    return allItemIds.filter(id => id.toLowerCase().includes(itemSearch.toLowerCase())).slice(0, 50);
  }, [allItemIds, itemSearch]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0a0c10] border-2 border-amber-500/30 rounded-[2rem] shadow-[0_0_100px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-amber-500/5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-terminal animate-pulse"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">System Override</h2>
              <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.3em]">Developer Command Console</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950 p-2 gap-2 border-b border-slate-900">
          <button 
            onClick={() => setActiveTab('levels')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'levels' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:bg-slate-900'}`}
          >
            Level Override
          </button>
          <button 
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'items' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:bg-slate-900'}`}
          >
            Asset Injection
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'levels' ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Override Magnitude</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="range" 
                    min="1" 
                    max="99" 
                    value={levelValue}
                    onChange={(e) => setLevelValue(parseInt(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="w-16 text-center text-2xl font-black text-white mono">{levelValue}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(SkillId).map(sId => (
                  <button
                    key={sId}
                    onClick={() => onAddLevel(sId, levelValue)}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{SKILL_DATA[sId].icon}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate w-full text-center">{SKILL_DATA[sId].displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"></i>
                  <input 
                    type="text"
                    placeholder="Search master database..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="w-full sm:w-32 relative">
                  <input 
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amber-500/50 text-center mono"
                  />
                  <span className="absolute -top-5 left-0 text-[8px] font-black text-slate-600 uppercase">Quantity</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredItems.map(id => (
                  <button
                    key={id}
                    onClick={() => onAddItem(id, itemQty)}
                    className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-amber-500/10 hover:border-amber-500/40 transition-all text-left group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400">{formatIdToName(id)}</span>
                      <span className="text-[8px] font-mono text-slate-600">{id}</span>
                    </div>
                    <i className="fa-solid fa-plus text-slate-700 group-hover:text-amber-500"></i>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-900 flex justify-between items-center">
           <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Authorized Personnel Only</span>
           <div className="flex gap-4">
             <button onClick={() => Object.values(SkillId).forEach(s => onAddLevel(s, 99))} className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest">Set All 99</button>
             <button onClick={() => {
               onAddItem('mana_crystal', 1000);
               onAddItem('aetheric_shard', 100);
               onAddItem('carbon_ore', 5000);
               onAddItem('zenith_ore', 1000);
               onAddItem('void_core', 5);
               onAddItem('astral_prism', 5);
               onAddItem('pure_essence', 10);
             }} className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest">Gimme High Level Mats</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DevConsole;
