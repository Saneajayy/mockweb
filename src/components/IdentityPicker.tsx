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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm flex flex-col items-center space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="w-full flex flex-col space-y-4">
          <button
            onClick={() => onSelect(authorA)}
            className="w-full py-4 bg-blue-900 text-blue-100 font-sans font-medium rounded-xl transition-all shadow-sm hover:bg-blue-800 active:scale-[0.98]"
          >
            I am {authorA}
          </button>
          
          <button
            onClick={() => onSelect(authorB)}
            className="w-full py-4 bg-blue-900 text-blue-100 font-sans font-medium rounded-xl transition-all shadow-sm hover:bg-blue-800 active:scale-[0.98]"
          >
            I am {authorB}
          </button>
        </div>
      </div>
    </div>
  );
}
