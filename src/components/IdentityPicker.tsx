'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { UserCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-50/50 p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm flex flex-col items-center space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
          <UserCircle className="w-8 h-8" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium text-rose-950 font-serif">Who are you?</h1>
          <p className="text-rose-700/70 text-sm">Choose your identity for this device. You won't have to do this again.</p>
        </div>

        <div className="w-full flex flex-col space-y-4">
          <button
            onClick={() => onSelect(authorA)}
            className="w-full py-4 bg-white border border-rose-200 text-rose-900 font-serif transition-all shadow-sm hover:border-rose-400 hover:bg-rose-50 active:scale-[0.98]"
          >
            I am {authorA}
          </button>
          
          <button
            onClick={() => onSelect(authorB)}
            className="w-full py-4 bg-white border border-rose-200 text-rose-900 font-serif transition-all shadow-sm hover:border-rose-400 hover:bg-rose-50 active:scale-[0.98]"
          >
            I am {authorB}
          </button>
        </div>
      </div>
    </div>
  );
}
