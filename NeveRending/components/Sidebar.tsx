
import React from 'react';
import { SkillId, UserAccount } from '../types';
import { SKILL_DATA } from '../constants';

interface SidebarProps {
  currentSkill: SkillId | 'inventory' | 'combat' | 'stats' | 'mastery' | 'market';
  onSelect: (id: SkillId | 'inventory' | 'combat' | 'stats' | 'mastery' | 'market') => void;
  skillLevels: Record<string, number>;
  combatLevel: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenDev: () => void;
  onOpenAccount: () => void;
  account: UserAccount | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSkill, onSelect, skillLevels, combatLevel, isOpen, onClose, onOpenDev, onOpenAccount, account }) => {
  const gatheringSkills = [SkillId.MINING, SkillId.FORESTRY, SkillId.FISHING, SkillId.THIEVERY, SkillId.BOTANY, SkillId.AGILITY];
  const refiningSkills = [SkillId.SMITHING, SkillId.JEWELRY, SkillId.ENCHANTING, SkillId.COOKING, SkillId.ALCHEMY, SkillId.SCRIBING];

  const renderNavButton = (id: string, label: string, icon: string) => {
    const isSelected = currentSkill === id;
    const level = (skillLevels[id] !== undefined) ? skillLevels[id] : (id === 'combat' ? combatLevel : null);
    
    return (
      <button
        key={id}
        onClick={() => { onSelect(id as any); if(window.innerWidth < 768) onClose(); }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 border border-transparent ${
          isSelected 
            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-70">{icon}</span>
          <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
        </div>
        {level !== null && (
          <span className={`text-[9px] font-bold mono ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
            {level}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed left-0 top-0 h-full w-60 bg-[#050608] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* User Profile / Logo Area */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelect('stats')}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-colors ${account ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <i className={`fa-solid ${account ? 'fa-user-astronaut' : 'fa-user-secret'}`}></i>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-black text-xs text-white uppercase tracking-wider truncate group-hover:text-cyan-400 transition-colors">
                {account ? account.username : 'NEVE RENDING'}
              </h2>
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest truncate">
                {account ? `ID: ${account.accountId}` : 'Unregistered'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[8px] font-black text-slate-700 uppercase tracking-widest">Base Operations</div>
            {renderNavButton('stats', 'Profile', '👤')}
            {renderNavButton('market', 'Nexus', '🛒')}
            {renderNavButton('mastery', 'Mastery', '🧠')}
            {renderNavButton('inventory', 'Storage', '📦')}
          </div>
          
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[8px] font-black text-slate-700 uppercase tracking-widest">Hostiles</div>
            {renderNavButton('combat', 'Combat', '⚔️')}
          </div>
          
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[8px] font-black text-slate-700 uppercase tracking-widest">Gathering</div>
            {gatheringSkills.map(id => renderNavButton(id, SKILL_DATA[id].displayName, SKILL_DATA[id].icon))}
          </div>
          
          <div className="space-y-0.5">
            <div className="px-3 pb-1 text-[8px] font-black text-slate-700 uppercase tracking-widest">Synthesis</div>
            {refiningSkills.map(id => renderNavButton(id, SKILL_DATA[id].displayName, SKILL_DATA[id].icon))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          {!account && (
            <button onClick={onOpenAccount} className="w-full mb-2 py-2 bg-cyan-600/10 border border-cyan-600/30 text-cyan-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-cyan-600/20 transition-all">
              Initialize ID
            </button>
          )}
          <button onClick={onOpenDev} className="w-full py-1.5 text-slate-600 hover:text-slate-400 text-[8px] font-bold uppercase tracking-widest transition-colors">
            DEV :: CONSOLE
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
