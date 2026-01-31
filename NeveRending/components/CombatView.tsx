
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ActiveAction, Monster, SkillId, SkillState, EquipSlot, EquippedItem } from '../types';
import { ITEM_REGISTRY, getArtUrl, formatIdToName, formatNumber, getMasteryThreshold, calculatePlayerCombatStats } from '../utils';

interface CombatViewProps {
  activeAction: ActiveAction | null;
  onStart: (id: string) => void;
  onStop: () => void;
  monsterData: Record<string, Monster>;
  combatLevel: number;
  skills: Record<SkillId, SkillState>;
  equipment: Record<EquipSlot, EquippedItem | null>;
  currentFocus: SkillId;
  onFocusChange: (focus: SkillId) => void;
  onEat: (foodId: string) => void;
  player: { hp: number; maxHp: number; autoEatThreshold: number };
  onSetAutoEatThreshold: (value: number) => void;
}

interface FloatingText {
  id: number;
  text: string;
  type: 'dmg-player' | 'dmg-enemy' | 'xp' | 'miss';
  x: number;
  y: number;
  scale: number;
}

const CombatView: React.FC<CombatViewProps> = ({ activeAction, onStart, onStop, monsterData, skills, equipment, currentFocus, onFocusChange, player, onSetAutoEatThreshold }) => {
  const currentMonster = activeAction?.monsterId ? monsterData[activeAction.monsterId] : null;
  
  // Floating Text System
  const [floats, setFloats] = useState<FloatingText[]>([]);
  
  // Refs to track previous state for diffing
  const prevXp = useRef<number>(skills[currentFocus].xp);
  const lastProcessedHitTime = useRef<number>(0);

  // Active Mastery Stats
  const activeMastery = useMemo(() => {
    if (!activeAction?.monsterId) return { level: 1, xp: 0 };
    return skills[SkillId.ATTACK].mastery[activeAction.monsterId] || { level: 1, xp: 0 };
  }, [activeAction?.monsterId, skills]);

  const masteryBonusPercent = ((activeMastery.level - 1) * 0.5).toFixed(1);

  // Monitor Loop for Damage/XP
  useEffect(() => {
    if (!activeAction || activeAction.type !== 'combat') return;

    // Process Hit Queue
    if (activeAction.combatHits && activeAction.combatHits.length > 0) {
      activeAction.combatHits.forEach(hit => {
        if (hit.timestamp > lastProcessedHitTime.current) {
          
          if (hit.isPlayer) {
             // Player hitting Enemy
             const xPos = 40 + Math.random() * 40; 
             const yPos = 30 + Math.random() * 20; 
             
             if (hit.isMiss || hit.damage === 0) {
                addFloat("0", 'miss', xPos, yPos, 1);
             } else {
                addFloat(`-${hit.damage}`, 'dmg-enemy', xPos, yPos, hit.damage > 50 ? 1.5 : 1);
             }
          } else {
             // Enemy hitting Player
             if (hit.damage > 0) {
               const xPos = 20 + Math.random() * 10;
               const yPos = 40 + Math.random() * 20;
               addFloat(`-${hit.damage}`, 'dmg-player', xPos, yPos, 1);
             }
          }
          
          lastProcessedHitTime.current = hit.timestamp;
        }
      });
    }

    // XP DROP LOGIC
    const currentXp = skills[currentFocus].xp;
    if (currentXp > prevXp.current) {
      const gain = currentXp - prevXp.current;
      if (gain > 0) {
         addFloat(`+${gain} XP`, 'xp', 50, 60, 1);
      }
    }
    prevXp.current = currentXp;

  }, [activeAction, skills, currentFocus]);

  const addFloat = (text: string, type: FloatingText['type'], x: number, y: number, scale: number) => {
    const id = Date.now() + Math.random();
    setFloats(prev => [...prev, { id, text, type, x, y, scale }]);
    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id));
    }, 800);
  };

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    return calculatePlayerCombatStats(skills, equipment, activeMastery.level);
  }, [skills, equipment, activeMastery]);

  const enemyStats = useMemo(() => {
    if (!currentMonster) return null;
    const enemyEvasion = currentMonster.def * 2.5;
    const hitChance = Math.max(0, Math.min(100, (stats.playerAccuracy / (stats.playerAccuracy + enemyEvasion)) * 100));
    const enemyMaxHit = Math.floor(currentMonster.att / 6);
    
    // Simple Enemy Hit Chance Approximation
    const playerDef = stats.playerDefense;
    const enemyHitChance = Math.max(10, Math.min(90, (currentMonster.att / (currentMonster.att + (playerDef * 0.8))) * 100));

    return { hitChance, enemyMaxHit, enemyHitChance };
  }, [currentMonster, stats]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <style>{`
        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { transform: translateY(-10px) scale(1.2); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translateY(-50px) scale(0.9); opacity: 0; }
        }
        .hit-splat {
          animation: float-up-fade 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {/* COMBAT DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Controls */}
        <div className="bg-[#0a0c10] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl order-2 lg:order-1">
           <div className="flex items-center gap-3 mb-2">
             <i className="fa-solid fa-crosshairs text-cyan-400"></i>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Combat Protocol</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-2">
              {[SkillId.ATTACK, SkillId.STRENGTH, SkillId.DEFENSE].map(sId => (
                <button 
                  key={sId}
                  onClick={() => onFocusChange(sId)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${currentFocus === sId ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center text-lg">
                        {sId === SkillId.ATTACK ? '⚔️' : sId === SkillId.STRENGTH ? '💪' : '🛡️'}
                     </div>
                     <div className="text-left">
                       <div className="text-[10px] font-black uppercase">{sId}</div>
                       <div className="text-[8px] font-bold opacity-60">Trains {sId === SkillId.DEFENSE ? 'Defense' : sId === SkillId.STRENGTH ? 'Strength' : 'Attack'} + HP</div>
                     </div>
                  </div>
                  {currentFocus === sId && <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div>}
                </button>
              ))}
           </div>
           
           {/* Auto Eat Indicator Slider */}
           <div className="mt-2 bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Auto-Eat Threshold</span>
                  <span className={`text-[9px] font-black mono ${player.autoEatThreshold > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                    {(player.autoEatThreshold * 100).toFixed(0)}%
                  </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="90" 
                step="5"
                value={player.autoEatThreshold * 100}
                onChange={(e) => onSetAutoEatThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
              />
           </div>
        </div>

        {/* CENTER: Active Battle View */}
        <div className="bg-[#0a0c10] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl lg:col-span-1 order-1 lg:order-2 min-h-[360px]">
          {activeAction?.type === 'combat' && currentMonster ? (
            <div className="w-full space-y-8 relative z-10">
               {/* Floating Text Container */}
               <div className="absolute inset-0 pointer-events-none overflow-visible z-[100]">
                 {floats.map(f => (
                   <div 
                     key={f.id}
                     className={`hit-splat absolute font-black italic tracking-tighter whitespace-nowrap ${
                       f.type === 'dmg-player' ? 'text-red-500 text-3xl' : 
                       f.type === 'miss' ? 'text-slate-500 text-2xl opacity-80' :
                       f.type === 'dmg-enemy' ? 'text-white text-4xl stroke-black' : 
                       'text-amber-400 text-lg'
                     }`}
                     style={{ 
                       left: `${f.x}%`, 
                       top: `${f.y}%`,
                       transform: `scale(${f.scale})` 
                     }}
                   >
                     {f.text}
                   </div>
                 ))}
               </div>

               {/* ENEMY */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-red-900/20 border-2 border-red-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">👾</div>
                    <div>
                      <h4 className="text-sm font-black text-red-400 uppercase tracking-widest">{currentMonster.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-slate-500">LVL {currentMonster.req}</span>
                        <div className="px-1.5 py-0.5 bg-slate-800 rounded text-[8px] font-black text-amber-500 border border-amber-500/20">
                          MASTER {activeMastery.level}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-red-500 mono leading-none">{Math.floor(activeAction.enemyCurHp!)}</div>
                    <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden mt-1 border border-white/5">
                      <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(activeAction.enemyCurHp! / currentMonster.hp) * 100}%` }}></div>
                    </div>
                  </div>
               </div>

               {/* VS Separator */}
               <div className="flex items-center gap-4 opacity-50 py-4">
                 <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
                 <div className="w-10 h-10 rounded-full border border-red-500/50 flex items-center justify-center bg-red-500/10 animate-pulse">
                    <span className="text-xs font-black italic text-red-500">VS</span>
                 </div>
                 <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
               </div>

               {/* PLAYER */}
               <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-4xl font-black text-cyan-400 mono leading-none">{Math.floor(activeAction.playerHp!)}</div>
                    <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden mt-1 border border-white/5">
                      <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(activeAction.playerHp! / player.maxHp) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest">Player</h4>
                      <span className="text-[9px] font-bold text-slate-500">HP {player.maxHp} MAX</span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-cyan-900/20 border-2 border-cyan-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">👤</div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="text-center opacity-50">
               <div className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
                 <i className="fa-solid fa-radar text-2xl text-slate-700"></i>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Scanning for Targets...</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          {activeAction?.type === 'combat' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>}
        </div>

        {/* RIGHT: Stats */}
        <div className="bg-[#0a0c10] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl order-3">
           <div className="flex items-center gap-3 mb-2">
             <i className="fa-solid fa-chart-line text-green-400"></i>
             <h3 className="text-xs font-black text-white uppercase tracking-widest">Analytics</h3>
           </div>
           
           {activeAction?.type === 'combat' && currentMonster && enemyStats ? (
             <div className="space-y-4">
               {/* Player Offense */}
               <div className="space-y-1">
                 <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest px-1">Player Offense</span>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Hit Chance</div>
                        <div className={`text-sm font-black mono ${enemyStats.hitChance > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{enemyStats.hitChance.toFixed(0)}%</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Max Hit</div>
                        <div className="text-sm font-black mono text-cyan-400">{stats.maxHit}</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center col-span-2">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Accuracy Rating</div>
                        <div className="text-sm font-black mono text-white">{stats.playerAccuracy}</div>
                    </div>
                 </div>
               </div>

               {/* Separator */}
               <div className="h-px bg-white/5 w-full"></div>

               {/* Enemy Offense */}
               <div className="space-y-1">
                 <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-1">Enemy Offense</span>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Hit Chance</div>
                        <div className="text-sm font-black mono text-red-400">{enemyStats.enemyHitChance.toFixed(0)}%</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Max Hit</div>
                        <div className="text-sm font-black mono text-red-400">{enemyStats.enemyMaxHit}</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-center col-span-2">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Your Defense Rating</div>
                        <div className="text-sm font-black mono text-white">{stats.playerDefense}</div>
                    </div>
                 </div>
               </div>
               
               <div className="text-center">
                 <span className="text-[8px] font-black text-amber-500 uppercase">+{masteryBonusPercent}% Mastery Bonus Active</span>
               </div>
             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center text-[9px] font-bold text-slate-700 uppercase tracking-widest border-2 border-dashed border-slate-800 rounded-xl">
               Awaiting Target Data
             </div>
           )}
        </div>
      </div>

      {/* MONSTER LIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Hostile Entities</h3>
           <div className="h-px bg-white/10 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Object.values(monsterData).map(m => {
            const isFighting = activeAction?.monsterId === m.id;
            const mastery = skills[SkillId.ATTACK].mastery[m.id] || { level: 1 };
            return (
              <div key={m.id} className={`relative bg-[#0a0c10] border rounded-xl overflow-hidden group transition-all flex flex-col ${
                isFighting ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] scale-[1.02]' : 'border-white/10 hover:border-white/20'
              }`}>
                
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col w-full pr-1">
                       <h4 className="text-xs font-black text-white uppercase italic tracking-wide truncate">{m.name}</h4>
                       <div className="flex items-center gap-2 mt-1 flex-wrap">
                         <span className="text-[9px] font-black text-red-400">Lv.{m.req}</span>
                         <div className="px-1.5 py-0.5 bg-slate-950 rounded text-[7px] font-black text-amber-500 border border-amber-500/20 uppercase">
                            Mastery {mastery.level}
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 p-1.5 rounded border border-white/5 text-center">
                      <span className="block text-[7px] font-bold text-slate-500 uppercase">HP</span>
                      <span className="text-[10px] font-bold mono text-slate-300">{m.hp}</span>
                    </div>
                    <div className="bg-slate-900/50 p-1.5 rounded border border-white/5 text-center">
                      <span className="block text-[7px] font-bold text-slate-500 uppercase">XP</span>
                      <span className="text-[10px] font-bold mono text-cyan-400">{m.xp}</span>
                    </div>
                  </div>

                  {/* DROP TABLE */}
                  <div className="bg-slate-950/80 rounded border border-white/5 p-2 space-y-1">
                    <span className="block text-[7px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-1 mb-1">Potential Drops</span>
                    <div className="space-y-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                      {m.drops.map(d => {
                        const itemData = ITEM_REGISTRY[d.id];
                        const name = itemData ? itemData.itemName : formatIdToName(d.id);
                        return (
                          <div key={d.id} className="flex justify-between items-center text-[8px]">
                            <span className="font-bold truncate text-slate-400">{name}</span>
                            <span className={`font-mono font-black ${d.chance < 0.1 ? 'text-amber-500' : 'text-slate-500'}`}>
                              {(d.chance * 100).toFixed(d.chance < 0.01 ? 1 : 0)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-2 pt-0 mt-auto">
                  <button 
                    onClick={isFighting ? onStop : () => onStart(m.id)}
                    className={`w-full py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      isFighting ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {isFighting ? 'Disengage' : 'Fight'}
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

export default CombatView;
