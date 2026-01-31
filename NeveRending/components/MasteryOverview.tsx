
import React, { useMemo, useState } from 'react';
import { SkillId, SkillState, MasteryState } from '../types';
import { SKILL_DATA, MONSTER_DATA } from '../constants';
import { formatIdToName, formatNumber, getMasteryThreshold } from '../utils';

interface MasteryOverviewProps {
  skills: Record<SkillId, SkillState>;
}

const MasteryOverview: React.FC<MasteryOverviewProps> = ({ skills }) => {
  const [search, setSearch] = useState('');

  const masteriesBySkill = useMemo(() => {
    const registry: Record<string, any[]> = {};

    (Object.entries(skills) as [string, SkillState][]).forEach(([sId, state]) => {
      const skillId = sId as SkillId;
      const skillData = SKILL_DATA[skillId];
      const masteries = (Object.entries(state.mastery) as [string, MasteryState][])
        .filter(([id, m]) => {
          const name = skillId === SkillId.ATTACK ? MONSTER_DATA[id]?.name : skillData.items.find(i => i.id === id)?.name;
          return (name || formatIdToName(id)).toLowerCase().includes(search.toLowerCase());
        })
        .map(([id, m]) => {
          const isMonster = skillId === SkillId.ATTACK;
          const item = isMonster ? MONSTER_DATA[id] : skillData.items.find(i => i.id === id);
          const currentThreshold = getMasteryThreshold(m.level);
          const nextThreshold = getMasteryThreshold(m.level + 1);
          const progress = m.level >= 99 ? 100 : ((m.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
          
          return {
            id,
            level: m.level,
            xp: m.xp,
            progress,
            name: item?.name || formatIdToName(id),
            isMonster,
            bonuses: isMonster ? [
              { label: 'Accuracy', val: `+${((m.level - 1) * 0.5).toFixed(1)}%`, color: 'text-cyan-400' },
              { label: 'Damage', val: `+${((m.level - 1) * 0.5).toFixed(1)}%`, color: 'text-red-500' },
              { label: 'Loot Luck', val: `+${((m.level - 1) * 1.0).toFixed(0)}%`, color: 'text-amber-500' }
            ] : [
              { label: 'Efficiency', val: `+${((m.level - 1) * 0.2).toFixed(1)}%`, color: 'text-cyan-400' },
              { label: 'Double Rate', val: `+${((m.level - 1) * 0.5).toFixed(1)}%`, color: 'text-green-500' }
            ]
          };
        })
        .sort((a, b) => b.level - a.level);

      if (masteries.length > 0) {
        registry[skillData.displayName] = masteries;
      }
    });

    return registry;
  }, [skills, search]);

  const globalStats = useMemo(() => {
    let totalLevel = 0;
    let totalCount = 0;
    (Object.values(skills) as SkillState[]).forEach(s => {
      (Object.values(s.mastery) as MasteryState[]).forEach(m => {
        totalLevel += m.level;
        totalCount++;
      });
    });
    return {
      averageLevel: totalCount > 0 ? (totalLevel / totalCount).toFixed(1) : 0,
      entries: totalCount
    };
  }, [skills]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="bg-[#0d0f14] border border-fuchsia-500/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/5 blur-[120px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-3xl flex items-center justify-center text-5xl shadow-inner relative group">
              <div className="absolute inset-0 bg-fuchsia-500/5 rounded-3xl animate-pulse"></div>
              🧠
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-2">Global Proficiency</h2>
              <p className="text-[10px] font-black text-fuchsia-400/60 uppercase tracking-[0.4em]">Sub-Routine Specialization Matrix</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Proficiency</span>
              <span className="text-3xl font-black text-fuchsia-400 mono tracking-tighter">{globalStats.averageLevel}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Mastered Nodes</span>
              <span className="text-3xl font-black text-white mono tracking-tighter">{globalStats.entries}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 relative">
          <i className="fa-solid fa-search absolute left-6 top-1/2 -translate-y-1/2 text-fuchsia-500/40"></i>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Audit specific node proficiency..."
            className="w-full bg-slate-950 border border-fuchsia-500/20 rounded-2xl py-5 pl-16 pr-8 text-sm font-black text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-4 focus:ring-fuchsia-500/5 transition-all uppercase placeholder:text-slate-800"
          />
        </div>
      </div>

      {/* Mastery Grid */}
      <div className="space-y-16">
        {Object.entries(masteriesBySkill).length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <i className="fa-solid fa-brain text-slate-800 text-5xl mb-6 opacity-20"></i>
            <h3 className="text-lg font-black text-slate-600 uppercase tracking-widest italic">Neural Map Empty</h3>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-2">No proficiencies detected for current search query</p>
          </div>
        ) : (
          (Object.entries(masteriesBySkill) as [string, any[]][]).map(([skillName, items]) => (
            <div key={skillName} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">{skillName} Research</h3>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-[#0d0f14] border border-[#1e293b] rounded-2xl p-6 transition-all duration-300 hover:border-fuchsia-500/30 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-fuchsia-400 transition-colors">{item.name}</h4>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Efficiency Sync</span>
                      </div>
                      <span className="text-sm font-black text-fuchsia-400 mono">LVL {item.level}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-fuchsia-500 progress-glow" style={{ width: `${item.progress}%` }}></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {item.bonuses.map((b: any) => (
                          <div key={b.label} className="bg-slate-950/80 p-2 rounded-xl border border-white/5 flex flex-col items-center">
                            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{b.label}</span>
                            <span className={`text-[10px] font-black mono ${b.color}`}>{b.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MasteryOverview;
