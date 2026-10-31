'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { FairyLights, DiyaIcon, DiwaliCanvas } from '@/components/DiwaliEffects';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] relative flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-950">

      {/* Hanging festive fairy lights at top */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none overflow-visible">
        <FairyLights />
      </div>

      {/* Floating golden stardust sparkles */}
      <DiwaliCanvas />

      <div className="w-full max-w-sm relative z-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Diwali Card */}
        <div className="w-full bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-7 shadow-2xl flex flex-col items-center">
          {/* Diya Header Graphic */}
          <div className="mb-4 relative">
            <DiyaIcon className="w-16 h-16" glowing={true} />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Shubh Deepavali</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter something"
                className={clsx(
                  "w-full px-5 py-3.5 text-center bg-slate-900/90 border outline-none transition-all text-amber-100 font-sans rounded-2xl",
                  "focus:border-amber-400 focus:ring-0 placeholder:text-amber-200/30",
                  error 
                    ? "border-red-500 bg-red-950/40 text-red-200 animate-pulse" 
                    : "border-amber-500/40"
                )}
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className={clsx(
                "w-full flex items-center justify-center space-x-2 py-3.5 font-sans font-semibold tracking-wide transition-all rounded-2xl",
                "shadow-lg active:scale-[0.98]",
                loading || !password 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40"
              )}
            >
              <span>{loading ? 'Unlocking...' : 'Enter Journal'}</span>
              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-amber-300/50 font-medium tracking-widest uppercase">
              May your days be filled with light &lt;3
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
