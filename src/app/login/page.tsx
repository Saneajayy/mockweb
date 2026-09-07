'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { clsx } from 'clsx';

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
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter password"
              className={clsx(
                "w-full px-5 py-4 text-center bg-slate-900 border outline-none transition-all text-slate-100 shadow-sm font-sans rounded-xl",
                "focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500",
                error ? "border-red-500 bg-red-950/30 text-red-200 animate-pulse" : "border-slate-800"
              )}
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className={clsx(
              "w-full flex items-center justify-center space-x-2 py-4 text-white font-sans font-medium tracking-wide transition-all rounded-xl",
              "shadow-sm active:scale-[0.98]",
              loading || !password 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none" 
                : "bg-blue-600 hover:bg-blue-500 hover:shadow-md"
            )}
          >
            <span>{loading ? 'Unlocking...' : 'Unlock'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-12 text-center flex flex-col items-center space-y-2 opacity-80 animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-both">
          <p className="text-[13px] text-slate-400 italic font-light">"Our own little corner of the world"</p>
          <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">Thanks for being here &lt;3</p>
        </div>
      </div>
    </main>
  );
}
