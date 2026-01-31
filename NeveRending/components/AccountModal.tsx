
import React, { useState, useEffect } from 'react';

interface AccountModalProps {
  onClose: () => void;
  onRegister: (username: string) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ onClose, onRegister }) => {
  const [username, setUsername] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3) return;
    
    setIsScanning(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        onRegister(username);
      } else {
        setScanProgress(progress);
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-[#0a0c10] border border-cyan-500/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,229,255,0.1)] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-[2.5rem] pointer-events-none"></div>
        
        <div className="p-10 pt-12 text-center">
          <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative group">
            <div className="absolute inset-0 bg-cyan-500/5 rounded-full animate-ping opacity-20"></div>
            <i className="fa-solid fa-scroll text-3xl text-cyan-400"></i>
          </div>
          
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Player Identity</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto">
            Designate a name to register your progress in the chronicles. This allows for high-score tracking.
          </p>

          {isScanning ? (
            <div className="space-y-6 py-4">
              <div className="relative h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="absolute h-full bg-cyan-500 progress-glow shadow-[0_0_15px_rgba(0,229,255,0.8)] transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-cyan-400/60">
                <span className="animate-pulse">Recording Chronicle Data...</span>
                <span className="mono">{Math.floor(scanProgress)}%</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <input 
                  autoFocus
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
                  placeholder="PLAYER NAME"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-8 text-center text-xl font-black text-white mono focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-800 transition-all uppercase"
                />
                <div className="mt-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">3-12 Alphanumeric Characters Only</div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                >
                  Stay Anonymous
                </button>
                <button 
                  type="submit"
                  disabled={username.length < 3}
                  className="flex-1 py-5 bg-cyan-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-cyan-500/20"
                >
                  Confirm Name
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-white/5 flex items-center justify-center gap-3">
          <i className="fa-solid fa-lock text-[10px] text-slate-700"></i>
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Save File Persistence Active</span>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
