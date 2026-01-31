
import React, { useState, useMemo } from 'react';
import { SkillId, SkillState, EquipSlot, EquippedItem, UserAccount } from '../types';
import { SKILL_DATA, GAME_SETTINGS } from '../constants';
import { formatNumber, getLevelThreshold, formatIdToName } from '../utils';

interface StatsViewProps {
  skills: Record<SkillId, SkillState>;
  totalLevel: number;
  equipment: Record<EquipSlot, EquippedItem | null>;
  onUnequip: (slot: EquipSlot) => void;
  onUpgrade: (slot: EquipSlot) => void;
  account: UserAccount | null;
}

const StatsView: React.FC<StatsViewProps> = ({ skills, totalLevel, equipment, onUnequip, onUpgrade, account }) => {
  const [refineSlot, setRefineSlot] = useState<EquipSlot | null>(null);

  const bonuses = useMemo(() => {
    let atk = 0, str = 0, def = 0;
    let accMult = 0, dmgMult = 0;
    (Object.entries(equipment) as [EquipSlot, EquippedItem | null][]).forEach(([slot, equip]) => {
      if (!equip) return;
      let itemData = null;
      for (const skill of Object.values(SKILL_DATA)) {
        const found = skill.items.find(i => i.id === equip.id);
        if (found) { itemData = found; break; }
      }
      if (itemData) {
        // Enhancement Multiplier: 10% per level (Matches App.tsx logic)
        const multiplier = 1 + (equip.level * 0.10);
        atk += Math.floor((itemData.atkBonus || 0) * multiplier);
        str += Math.floor((itemData.strBonus || 0) * multiplier);
        def += Math.floor((itemData.defBonus || 0) * multiplier);
        if (itemData.accMult) accMult += itemData.accMult;
        if (itemData.dmgMult) dmgMult += itemData.dmgMult;
      }
    });
    return { atk, str, def, accMult, dmgMult };
  }, [equipment]);

  const matCounts = {
    shards: (Object.values(skills) as SkillState[]).reduce((a, s) => a + (s.inventory['aetheric_shard'] || 0), 0),
    manaCrystals: (Object.values(skills) as SkillState[]).reduce((a, s) => a + (s.inventory['mana_crystal'] || 0), 0)
  };

  const getRefineCosts = (slot: EquipSlot) => {
    const equip = equipment[slot];
    if (!equip) return { shards: 0, manaCrystals: 0 };
    return { 
      shards: Math.floor(equip.level / 2) + 1, 
      manaCrystals: 5 + (equip.level * 12) 
    };
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      {/* Primary Character Stats */}
      <div className="bg-[#0d0f14] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px]"></div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start mb-16">
          <div className={`w-40 h-40 rounded-[2rem] border flex flex-col items-center justify-center shadow-inner group transition-all duration-500 ${account ? 'bg-cyan-500/5 border-cyan-500/40' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-5xl group-hover:scale-110 transition-transform">
              {account ? '👑' : '👤'}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${account ? 'text-cyan-400' : 'text-slate-700'}`}>
              {account ? 'Ranked' : 'Guest'}
            </span>
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
               <div>
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2 italic">
                    {account ? account.username : 'Character Profile'}
                  </h2>
                  {account ? (
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Chronicle ID:</span>
                      <span className="text-cyan-400 text-[10px] font-black mono tracking-tighter bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                        {account.accountId}
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Mastery Tracking System v2.4.0</p>
                  )}
               </div>
               <div className="bg-cyan-500/5 border border-cyan-500/10 px-6 py-4 rounded-2xl">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Level</span>
                  <span className="text-3xl font-black text-cyan-400 mono tracking-tighter">{totalLevel}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { label: 'Attack', val: `+${bonuses.atk}`, color: 'text-red-400' },
                { label: 'Strength', val: `+${bonuses.str}`, color: 'text-red-400' },
                { label: 'Defense', val: `+${bonuses.def}`, color: 'text-red-400' },
                { label: 'Accuracy', val: `+${(bonuses.accMult * 100).toFixed(0)}%`, color: 'text-cyan-400' },
                { label: 'Damage', val: `+${(bonuses.dmgMult * 100).toFixed(0)}%`, color: 'text-cyan-400' }
              ].map(b => (
                <div key={b.label} className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                  <span className="block text-[7px] font-black text-slate-600 uppercase tracking-widest mb-1">{b.label}</span>
                  <span className={`text-xl font-black mono ${b.color}`}>{b.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Matrix Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5"></div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Mastery Levels</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {(Object.entries(skills) as [SkillId, SkillState][]).map(([id, state]) => {
              const currentLvlXP = getLevelThreshold(state.level);
              const nextLvlXP = getLevelThreshold(state.level + 1);
              const progress = ((state.xp - currentLvlXP) / (nextLvlXP - currentLvlXP)) * 100;
              const data = SKILL_DATA[id as SkillId];
              
              return (
                <div key={id} className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 hover:bg-slate-900/50 hover:border-cyan-500/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl opacity-80">{data?.icon}</span>
                    <span className="text-xs font-black text-white mono">LVL {state.level}</span>
                  </div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 truncate">
                    {data?.displayName}
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-cyan-500/80 progress-glow" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[7px] font-black text-slate-600 mono uppercase">
                      <span>{formatNumber(state.xp)} XP</span>
                      <span>Next: {formatNumber(nextLvlXP)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Loadout Screen */}
        <div className="bg-[#0d0f14] border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-4 italic">
              <i className="fa-solid fa-shield-halved text-red-500 text-sm animate-pulse"></i>
              Active Loadout
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {Object.values(EquipSlot).map(slot => {
              const equip = equipment[slot];
              return (
                <div key={slot} className="flex flex-col gap-3 items-center">
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{slot}</span>
                  <div className={`w-full aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all relative group overflow-hidden ${equip ? 'bg-slate-950 border-red-500/30' : 'bg-slate-950 border-white/5 opacity-40'}`}>
                    {equip ? (
                      <>
                        <span className="text-[7px] font-black text-white px-2 text-center uppercase tracking-tighter mb-1 leading-tight">{formatIdToName(equip.id)}</span>
                        <span className="text-[10px] font-black text-red-400 mono leading-none">+{equip.level}</span>
                        <div className="absolute inset-0 bg-slate-950 opacity-0 group-hover:opacity-100 flex flex-col p-2 gap-1.5 transition-opacity duration-300">
                          <button onClick={() => setRefineSlot(slot)} className="flex-1 bg-cyan-500 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest">Enhance</button>
                          <button onClick={() => onUnequip(slot)} className="flex-1 bg-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Remove</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-xl grayscale opacity-30">
                        {slot === EquipSlot.HEAD && '🪖'} {slot === EquipSlot.CHEST && '👕'}
                        {slot === EquipSlot.LEGS && '👖'} {slot === EquipSlot.WEAPON && '⚔️'}
                        {slot === EquipSlot.SHIELD && '🛡️'} {slot === EquipSlot.RING && '💍'}
                        {slot === EquipSlot.NECK && '📿'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reforging Screen */}
        <div className="bg-[#0d0f14] border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-10 flex items-center gap-4 italic">
            <i className="fa-solid fa-hammer text-cyan-500 text-sm"></i>
            Item Enhancement
          </h3>
          {!refineSlot ? (
            <div className="flex-1 flex items-center justify-center text-slate-700 py-10 border border-dashed border-white/5 rounded-3xl uppercase font-black text-[10px] tracking-[0.3em]">
              Select equipment to upgrade
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-black text-white uppercase mb-2 tracking-tight">{formatIdToName(equipment[refineSlot]!.id)}</h4>
                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
                  <span>Enhancement Level</span>
                  <div className="mono font-black">
                    <span className="text-cyan-400">+{equipment[refineSlot]!.level}</span>
                    <span className="mx-2 text-slate-700">→</span>
                    <span className="text-green-400">+{equipment[refineSlot]!.level + 1}</span>
                  </div>
                </div>
              </div>

              {(() => {
                const costs = getRefineCosts(refineSlot);
                const canAfford = matCounts.shards >= costs.shards && matCounts.manaCrystals >= costs.manaCrystals;
                const isMax = equipment[refineSlot]!.level >= GAME_SETTINGS.maxRefineLevel;
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-4 rounded-2xl border ${matCounts.shards >= costs.shards ? 'bg-slate-950 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
                        <span className="block text-[7px] font-black text-slate-600 uppercase mb-2">Aetheric Shard</span>
                        <div className={`text-xs font-black mono ${matCounts.shards >= costs.shards ? 'text-white' : 'text-red-500'}`}>{matCounts.shards}/{costs.shards}</div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${matCounts.manaCrystals >= costs.manaCrystals ? 'bg-slate-950 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
                        <span className="block text-[7px] font-black text-slate-600 uppercase mb-2">Mana Crystal</span>
                        <div className={`text-xs font-black mono ${matCounts.manaCrystals >= costs.manaCrystals ? 'text-white' : 'text-red-500'}`}>{matCounts.manaCrystals}/{costs.manaCrystals}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpgrade(refineSlot)}
                      disabled={isMax || !canAfford}
                      className="w-full py-5 bg-cyan-500 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-lg shadow-cyan-500/10 border border-cyan-300/30"
                    >
                      {isMax ? 'Maximum Level' : 'Upgrade Item'}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
