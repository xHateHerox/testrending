
import React, { useState, useMemo } from 'react';
import { SkillState, SkillId, EquipSlot, EquippedItem } from '../types';
import { SKILL_DATA } from '../constants';
import { formatNumber, formatIdToName } from '../utils';

interface InventoryViewProps {
  skills: Record<SkillId, SkillState>;
  equipment: Record<EquipSlot, EquippedItem | null>;
  onEat: (foodId: string) => void;
  onDiscard: (itemId: string, qty: number) => void;
  onEquip: (itemId: string) => void;
  onUseBooster: (itemId: string) => void;
  onSell: (itemId: string, qty: number) => void;
}

type CategoryType = 'all' | 'resources' | 'consumables' | 'equipment';

const InventoryView: React.FC<InventoryViewProps> = ({ skills, onEat, onDiscard, onEquip, onUseBooster, onSell }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryType>('all');

  const items = useMemo(() => {
    const list: any[] = [];
    (Object.entries(skills) as [SkillId, SkillState][]).forEach(([sId, state]) => {
      Object.entries(state.inventory).forEach(([itemId, count]) => {
        if (count <= 0) return;
        
        let itemData: any = null;
        for (const skill of Object.values(SKILL_DATA)) {
          const found = skill.items.find(i => i.id === itemId);
          if (found) { itemData = found; break; }
        }

        const name = itemData?.itemName || formatIdToName(itemId);
        const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
        let matchesCategory = true;
        
        if (category === 'resources') {
          matchesCategory = !itemData?.heal && !itemData?.boost && !itemData?.slot;
        } else if (category === 'consumables') {
          matchesCategory = !!itemData?.heal || !!itemData?.boost;
        } else if (category === 'equipment') {
          matchesCategory = !!itemData?.slot;
        }

        if (matchesSearch && matchesCategory) {
          list.push({ 
            id: itemId, 
            name, 
            count, 
            skillId: sId, 
            heal: itemData?.heal, 
            value: itemData?.value || 1,
            isEquippable: !!itemData?.slot, 
            isBooster: !!itemData?.boost,
            boost: itemData?.boost,
            isRare: ['aetheric_shard', 'void_core', 'astral_prism', 'mana_crystal', 'pure_essence'].includes(itemId)
          });
        }
      });
    });
    return list.sort((a, b) => b.count - a.count); // Sort by quantity desc
  }, [skills, search, category]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-[#0a0c10] p-3 rounded-xl border border-white/10 shrink-0">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['all', 'resources', 'consumables', 'equipment'].map(cat => (
            <button key={cat} onClick={() => setCategory(cat as CategoryType)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${category === cat ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-white/5 text-slate-600 hover:text-slate-400'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH ASSETS..." className="w-full bg-slate-950 border border-white/10 rounded-lg py-1.5 pl-8 pr-4 text-[10px] font-bold focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 uppercase tracking-wider text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
          {items.map(item => (
            <div key={item.id} className={`bg-[#0a0c10] border rounded-lg p-2 flex flex-col gap-1.5 group transition-all relative overflow-hidden ${item.isRare ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 hover:border-white/15'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-bold uppercase truncate w-20 ${item.isRare ? 'text-amber-200' : 'text-slate-300'}`}>{item.name}</span>
                <span className={`text-[9px] font-black mono ${item.isRare ? 'text-amber-400' : 'text-cyan-400'}`}>x{formatNumber(item.count)}</span>
              </div>
              
              {/* Item Type Badge */}
              <div className="flex gap-1">
                {item.isEquippable && <span className="text-[7px] bg-purple-500/10 text-purple-400 px-1 rounded border border-purple-500/20">GEAR</span>}
                {item.heal && <span className="text-[7px] bg-green-500/10 text-green-400 px-1 rounded border border-green-500/20">FOOD</span>}
                {item.isBooster && <span className="text-[7px] bg-yellow-500/10 text-yellow-400 px-1 rounded border border-yellow-500/20">BOOST</span>}
              </div>

              <div className="mt-auto grid grid-cols-2 gap-1 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {(item.isEquippable || item.isBooster || item.heal) ? (
                   <button 
                    onClick={() => item.isEquippable ? onEquip(item.id) : item.isBooster ? onUseBooster(item.id) : onEat(item.id)}
                    className="py-1 bg-slate-800 text-white rounded text-[8px] font-black uppercase hover:bg-cyan-600 transition-colors"
                   >
                     Use
                   </button>
                ) : (
                  <div className="bg-transparent"></div> 
                )}
                <button onClick={() => onSell(item.id, item.count)} className="py-1 bg-amber-900/20 text-amber-500 border border-amber-900/30 rounded text-[8px] font-black uppercase hover:bg-amber-500 hover:text-black transition-colors">
                  Sell
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-slate-700">
               <i className="fa-solid fa-box-open text-3xl mb-3 opacity-20"></i>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Storage Manifest Empty</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryView;
