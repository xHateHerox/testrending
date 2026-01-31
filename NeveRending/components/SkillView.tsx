
import React, { useEffect, useState, useMemo } from 'react';
import { SkillId, SkillState, ActiveAction, SkillItem, MasteryState } from '../types';
import { SKILL_DATA } from '../constants';
import { getXP, getTime, formatNumber, getMasteryThreshold, ITEM_REGISTRY, formatIdToName } from '../utils';

interface SkillViewProps {
  skillId: SkillId;
  state: SkillState;
  allSkills: Record<SkillId, SkillState>;
  activeAction: ActiveAction | null;
  onStart: (sId: SkillId, itemId: string) => void;
  onStop: () => void;
  onEat: (foodId: string) => void;
}

const getSourceTooltip = (itemId: string): string => {
  const item = ITEM_REGISTRY[itemId];
  if (!item) return 'Source: Unknown';
  
  const skillName = SKILL_DATA[item.skillId]?.displayName || 'Unknown';
  
  if (item.skillId === SkillId.ATTACK) {
    return `Source: Combat (Monster Drop)`;
  }
  return `Source: ${skillName}`;
};

const SkillCard: React.FC<{
  item: SkillItem,
  isActive: boolean,
  isLocked: boolean,
  currentStock: number,
  allSkills: Record<SkillId, SkillState>,
  onStart: () => void,
  onStop: () => void,
  activeAction: ActiveAction | null,
  mastery?: MasteryState
}> = ({ item, isActive, isLocked, currentStock, allSkills, onStart, onStop, activeAction, mastery }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive || !activeAction) {
      setProgress(0);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - activeAction.startTime;
      const duration = activeAction.duration || 1000;
      setProgress(Math.min(100, (elapsed / duration) * 100));
    };
    const interval = setInterval(tick, 30); 
    return () => clearInterval(interval);
  }, [isActive, activeAction]);

  const masteryProgress = useMemo(() => {
    if (!mastery) return 0;
    const cur = getMasteryThreshold(mastery.level);
    const nxt = getMasteryThreshold(mastery.level + 1);
    return Math.max(0, Math.min(100, ((mastery.xp - cur) / (nxt - cur)) * 100));
  }, [mastery]);

  const hasMaterials = useMemo(() => {
    if (!item.inputs) return true;
    return item.inputs.every(input => {
      const stock = Object.values(allSkills).reduce((acc, s) => acc + (s.inventory[input.id] || 0), 0);
      return stock >= input.qty;
    });
  }, [item.inputs, allSkills]);

  // Calculate efficiency reduced time
  const displayTime = useMemo(() => {
     if (!mastery) return getTime(item.req);
     const efficiencyMult = Math.max(0.5, 1 - ((mastery.level - 1) * 0.002));
     return getTime(item.req) * efficiencyMult;
  }, [item.req, mastery]);

  return (
    <div className={`relative flex flex-col bg-[#0a0c10] border rounded-xl overflow-hidden transition-all duration-200 group h-full ${
      isLocked ? 'border-white/5 opacity-40 grayscale' : 
      isActive ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,255,0.08)] bg-cyan-500/5' : 
      'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
    }`}>
      
      {/* Top Bar: Mastery & Stock */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/5 bg-black/20">
        <div className="flex flex-col w-full pr-2">
           <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Mastery {mastery?.level || 1}</span>
              {!isLocked && item.id !== 'agility' && (
                <span className="text-[10px] font-black mono text-white" title="Current Inventory Stock">
                  In Stock: {formatNumber(currentStock)}
                </span>
              )}
           </div>
           <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-fuchsia-500" style={{ width: `${masteryProgress}%` }} />
           </div>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-2">
        {/* Header: Name */}
        <div className="flex items-center gap-2 mb-1">
           <div className={`w-1 h-8 rounded-full ${isActive ? 'bg-cyan-500 shadow-[0_0_8px_var(--cyan)]' : 'bg-slate-800'}`}></div>
           <div className="overflow-hidden">
             <h3 className="text-xs font-black text-white uppercase italic tracking-wide leading-tight truncate">{item.name}</h3>
             <span className="text-[9px] font-bold text-slate-600 mono">Req: Lvl {item.req}</span>
           </div>
        </div>

        {/* Produces Section */}
        <div className="bg-slate-900/30 p-2 rounded border border-white/5 flex items-center justify-between group/produce hover:bg-slate-900/50 transition-colors">
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Produces</span>
          <span className="text-[10px] font-bold text-cyan-400 truncate pl-2">{item.itemName}</span>
        </div>

        {/* Requirements Section */}
        {item.inputs && item.inputs.length > 0 ? (
          <div className="bg-slate-900/30 p-2 rounded border border-white/5 flex flex-col gap-1.5">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Requires Ingredients</span>
            <div className="flex flex-wrap gap-1.5">
              {item.inputs.map(inp => {
                 const stock = Object.values(allSkills).reduce((acc, s) => acc + (s.inventory[inp.id] || 0), 0);
                 const hasEnough = stock >= inp.qty;
                 const itemName = formatIdToName(inp.id);
                 return (
                   <div 
                     key={inp.id} 
                     title={`${itemName}\n${getSourceTooltip(inp.id)}\nOwned: ${formatNumber(stock)}`}
                     className={`px-2 py-1 rounded border text-[8px] font-bold uppercase tracking-wide cursor-help transition-all flex items-center gap-1.5 ${
                       hasEnough 
                         ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white' 
                         : 'bg-red-900/10 border-red-900/30 text-red-500 hover:bg-red-900/20'
                     }`}
                   >
                     <span>{inp.qty}x</span>
                     <span className="truncate max-w-[80px]">{itemName}</span>
                   </div>
                 );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/30 p-2 rounded border border-white/5">
             <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Type</span>
             <div className="text-[9px] font-bold text-slate-400 mt-0.5">Gathering / No Input</div>
          </div>
        )}

        {/* Item Description (Alchemy/Enchanting/Scribing) */}
        {item.description && (
          <div className="mt-1">
            <p className="text-[8px] text-slate-500 font-medium leading-relaxed italic truncate">
              "{item.description}"
            </p>
          </div>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1 text-[9px] font-bold uppercase tracking-wider mt-auto pt-2">
           <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/40 px-2 py-1 rounded border border-white/5">
             <i className="fa-regular fa-clock text-[8px]"></i>
             <span className="mono">{displayTime.toFixed(1)}s</span>
           </div>
           <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-900/10 px-2 py-1 rounded border border-cyan-500/10">
             <i className="fa-solid fa-bolt text-[8px]"></i>
             <span className="mono">+{formatNumber(getXP(item.req))} XP</span>
           </div>
        </div>
      </div>

      {/* Action Button Area */}
      <div className="relative">
        {isActive && (
           <div className="absolute bottom-full left-0 right-0 h-0.5 bg-cyan-500/20">
             <div className="h-full bg-cyan-400 shadow-[0_0_8px_var(--cyan)] transition-all duration-75" style={{ width: `${progress}%` }} />
           </div>
        )}
        <button 
          onClick={isActive ? onStop : onStart} 
          disabled={isLocked || (!isActive && !hasMaterials)} 
          className={`w-full py-3 text-[9px] font-black uppercase tracking-[0.25em] transition-all hover:brightness-110 active:scale-[0.99] ${
            isLocked ? 'bg-slate-950 text-slate-800 cursor-not-allowed' :
            isActive ? 'bg-red-500/10 text-red-500 border-t border-red-500/20' :
            !hasMaterials ? 'bg-slate-900 text-slate-600 cursor-not-allowed border-t border-white/5' :
            'bg-cyan-600/10 text-cyan-400 border-t border-cyan-500/30 hover:bg-cyan-600 hover:text-white'
          }`}
        >
          {isLocked ? 'Locked' : isActive ? 'Terminate' : !hasMaterials ? 'Insufficient' : 'Initialize'}
        </button>
      </div>
    </div>
  );
};

const SkillView: React.FC<SkillViewProps> = ({ skillId, state, allSkills, activeAction, onStart, onStop }) => {
  const data = SKILL_DATA[skillId];
  const [filter, setFilter] = useState('All');

  // Reset filter when skill changes
  useEffect(() => {
    if (skillId === SkillId.SMITHING) {
      setFilter('Bars');
    } else {
      setFilter('All');
    }
  }, [skillId]);

  const categories = useMemo(() => {
    if (skillId === SkillId.SMITHING) {
      return ['Bars', 'Bronze', 'Ferrum', 'Steel', 'Aether', 'Zenith', 'Void'];
    }
    return [];
  }, [skillId]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    
    // Special filtering logic for Smithing to separate Bars and Crafted items
    if (skillId === SkillId.SMITHING) {
      if (filter === 'Bars' || filter === 'All') {
        return data.items.filter(item => item.id.startsWith('bar_'));
      }
      return data.items.filter(item => 
        (item.id.toLowerCase().includes(filter.toLowerCase()) || 
         item.itemName.toLowerCase().includes(filter.toLowerCase())) && 
        !item.id.startsWith('bar_')
      );
    }

    if (categories.length === 0 || filter === 'All') return data.items;
    
    return data.items.filter(item => 
      item.id.toLowerCase().includes(filter.toLowerCase()) || 
      item.itemName.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter, categories, skillId]);
  
  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-600 opacity-50">
        <i className="fa-solid fa-ban text-4xl mb-4"></i>
        <h3 className="text-sm font-black uppercase tracking-widest">No Action Protocols Found</h3>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Category Filter Bar */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setFilter(cat)}
               className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                 filter === cat 
                   ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.1)]' 
                   : 'bg-[#0a0c10] border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {filteredItems.map(item => (
          <SkillCard 
            key={item.id}
            item={item}
            allSkills={allSkills}
            isLocked={state.level < item.req}
            isActive={activeAction?.itemId === item.id}
            currentStock={state.inventory[item.id] || 0}
            onStart={() => onStart(skillId, item.id)}
            onStop={onStop}
            activeAction={activeAction}
            mastery={state.mastery[item.id]}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-xl">
             <i className="fa-solid fa-filter-circle-xmark text-3xl mb-3 text-slate-800"></i>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Schematics Matching Protocol</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillView;
