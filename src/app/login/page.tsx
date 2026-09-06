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
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-rose-50/30 p-6">
      <div className="w-full max-w-sm flex flex-col items-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="w-16 h-16 bg-white border border-rose-200 text-rose-400 flex items-center justify-center rotate-45 shadow-sm">
          <Lock className="w-6 h-6 -rotate-45" />
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-medium text-rose-950 font-serif tracking-wide">Our Journal</h1>
          <p className="text-rose-700/60 text-sm font-serif italic">A private space for just the two of us.</p>
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
              placeholder="Enter password"
              className={clsx(
                "w-full px-5 py-4 text-center bg-white border outline-none transition-all text-rose-950 shadow-sm font-serif",
                "focus:ring-1 focus:ring-rose-300 focus:border-rose-400 placeholder:text-rose-200/70",
                error ? "border-red-300 bg-red-50 text-red-900 animate-pulse" : "border-rose-200"
              )}
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className={clsx(
              "w-full flex items-center justify-center space-x-2 py-4 text-white font-serif tracking-wider transition-all",
              "shadow-sm active:scale-[0.98]",
              loading || !password 
                ? "bg-rose-200 cursor-not-allowed shadow-none" 
                : "bg-rose-500 hover:bg-rose-600 hover:shadow-md"
            )}
          >
            <span>{loading ? 'Unlocking...' : 'Unlock'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </main>
  );
}
