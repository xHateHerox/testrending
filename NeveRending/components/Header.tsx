
import React, { useState, useEffect } from 'react';
import { SkillId, SkillState, ActiveBooster } from '../types';
import { SKILL_DATA } from '../constants';
import { formatNumber, getLevelThreshold } from '../utils';

interface HeaderProps {
  skillId: SkillId | string;
  state: SkillState | undefined;
  credits: number;
  isCombatGroup?: boolean;
  boosters: ActiveBooster[];
}

const BoosterIcon: React.FC<{ booster: ActiveBooster }> = ({ booster }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, booster.expiry - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, booster.expiry - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [booster.expiry]);

  if (timeLeft <= 0) return null;
  const mins = Math.floor(timeLeft / 60000);
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-bold uppercase tracking-wider">
      <span className="text-cyan-400">{booster.stat}</span>
      <span className="text-slate-400 mono">{mins}m</span>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ skillId, state, credits, isCombatGroup, boosters }) => {
  const data = SKILL_DATA[skillId as SkillId];
  const nextLvlXP = state ? getLevelThreshold(state.level + 1) : 0;
  const curLvlXP = state ? getLevelThreshold(state.level) : 0;
  const progress = state ? Math.max(0, Math.min(100, ((state.xp - curLvlXP) / (nextLvlXP - curLvlXP)) * 100)) : 0;

  return (
    <div className="sticky top-0 z-50 w-full bg-[#030406]/95 border-b border-white/5 backdrop-blur-md mb-6">
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center text-lg text-cyan-400">
            {isCombatGroup ? '⚔️' : (data?.icon || '📦')}
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-wider leading-none">
              {isCombatGroup ? 'Combat Operations' : (data?.displayName || String(skillId).toUpperCase())}
            </h1>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
              {state ? `Level ${state.level}` : 'System Access'}
            </span>
          </div>
        </div>

        {/* Center: XP Bar (Only if state exists) */}
        {state && (
          <div className="flex-1 max-w-xl mx-6 hidden md:flex flex-col justify-center gap-1">
            <div className="flex justify-between items-end text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span>Progress</span>
              <span className="mono text-slate-400">{formatNumber(state.xp)} <span className="text-slate-600">/</span> {formatNumber(nextLvlXP)} XP</span>
            </div>
            <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Right: Stats & Credits */}
        <div className="flex items-center gap-4">
          {boosters.length > 0 && (
            <div className="hidden lg:flex gap-2">
              {boosters.slice(0, 2).map(b => <BoosterIcon key={b.id + b.stat} booster={b} />)}
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <span className="text-amber-500 text-[10px] uppercase font-black tracking-wider">Credits</span>
            <div className="h-3 w-px bg-amber-500/20"></div>
            <span className="text-amber-400 text-sm font-black mono tracking-tight">{formatNumber(credits)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
