'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Sparkles, UserCheck } from 'lucide-react';
import { DiyaIcon, FairyLights, DiwaliCanvas } from './DiwaliEffects';

interface IdentityPickerProps {
  authorA: string;
  authorB: string;
  onSelect: (author: string) => void;
}

export default function IdentityPicker({ authorA, authorB, onSelect }: IdentityPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden bg-slate-950">

      {/* Hanging fairy lights */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none overflow-visible">
        <FairyLights />
      </div>

      {/* Ambient floating sparkles */}
      <DiwaliCanvas />

      <div className="w-full max-w-sm relative z-20 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="w-full bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-7 shadow-2xl flex flex-col items-center">
          {/* Diya Header */}
          <div className="mb-3">
            <DiyaIcon className="w-16 h-16" glowing={true} />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Happy Diwali</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          <div className="w-full flex flex-col space-y-3.5">
            <button
              onClick={() => onSelect(authorA)}
              className={clsx(
                "group relative w-full py-4 px-5 rounded-2xl flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-r from-slate-900/90 to-amber-950/40 border border-amber-500/40",
                "hover:border-amber-400 hover:scale-[1.01] active:scale-[0.98] shadow-md"
              )}
            >
              <span className="text-base font-semibold text-amber-100 group-hover:text-amber-300 transition-colors tracking-wide">
                Enter as {authorA}
              </span>
            </button>
            
            <button
              onClick={() => onSelect(authorB)}
              className={clsx(
                "group relative w-full py-4 px-5 rounded-2xl flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-r from-slate-900/90 to-amber-950/40 border border-amber-500/40",
                "hover:border-amber-400 hover:scale-[1.01] active:scale-[0.98] shadow-md"
              )}
            >
              <span className="text-base font-semibold text-amber-100 group-hover:text-amber-300 transition-colors tracking-wide">
                Enter as {authorB}
              </span>
            </button>
          </div>

          <p className="text-[11px] text-amber-300/40 mt-6 tracking-wide">
            Wishing you joy, love & happiness ✨
          </p>
        </div>
      </div>
    </div>
  );
}
