'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import SnowMound from '@/components/SnowMound';
import ChristmasTree from '@/components/ChristmasTree';
import SecondChristmasTree from '@/components/SecondChristmasTree';
import ChristmasHouse from '@/components/ChristmasHouse';
import WinterSky from '@/components/WinterSky';

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
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-[100dvh] relative flex flex-col items-center justify-start pt-12 sm:pt-16 p-6 overflow-hidden"
      style={{
        background:
          'linear-gradient(in oklab 180deg, #001259 0%, #001259 35%, #001156 40%, #00104e 45%, #000d42 50%, #000a34 55%, #000825 60%, #000517 65%, #00020b 70%, #000103 75%, #000000 80%, #000000 100%)',
      }}
    >
      {/* Dynamic Winter Sky: Realistic gentle snowfall & pinpoint twinkling stars */}
      <WinterSky className="absolute inset-0 z-0 pointer-events-none" />

      {/* Background Christmas Tree (Behind house) */}
      <SecondChristmasTree
        className="absolute bottom-[16%] right-[9%] w-[170px] h-[170px] md:bottom-[15%] md:right-[160px] md:w-[300px] md:h-[300px] z-[1]"
      />

      {/* Christmas House (Behind all 3 snow mounds, on right most side) */}
      <ChristmasHouse
        className="absolute bottom-[15%] right-[-16%] w-[210px] h-[210px] md:bottom-[14%] md:right-[-40px] md:w-[380px] md:h-[380px] z-[2]"
      />

      {/* 3rd Snow Mound (Furthest back, shifted left, expanded right) */}
      <SnowMound
        flipHorizontal={true}
        className="absolute bottom-[-4%] left-[-20%] w-[115%] md:w-[135%] h-[34%] z-[3]"
      />

      {/* 2nd Snow Mound (Middle, shifted up and right) */}
      <SnowMound
        flipHorizontal={true}
        className="absolute bottom-[1%] left-[28%] w-[120%] h-[42%] z-[5] -rotate-[24deg] origin-bottom-right"
      />

      {/* Christmas Tree (Middle of 1st snow mound, on top of it) */}
      <ChristmasTree
        className="absolute bottom-[2%] left-[32%] -translate-x-1/2 w-[380px] h-[380px] sm:w-[500px] sm:h-[500px] z-20"
      />

      {/* 1st Snow Mound (Foreground) */}
      <SnowMound className="absolute bottom-0 left-0 right-0 w-full h-[21%] z-10" />

      <div className="w-full max-w-[280px] sm:max-w-[300px] relative z-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <form
          onSubmit={handleSubmit}
          className={clsx(
            "w-full flex items-center bg-[#001259] rounded-lg border transition-all p-1.5 pl-3.5",
            error
              ? "border-red-500/80 ring-1 ring-red-500/40 animate-pulse"
              : "border-white/80 focus-within:border-white focus-within:ring-1 focus-within:ring-white/40"
          )}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Come home, Its cold outside."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/40 pr-2 min-w-0"
            disabled={loading}
            autoFocus
          />

          <button
            type="submit"
            disabled={loading || !password}
            aria-label="Unlock"
            className={clsx(
              "flex-shrink-0 w-8 h-8 rounded-md bg-white text-black flex items-center justify-center transition-all",
              loading || !password
                ? "cursor-not-allowed"
                : "hover:bg-neutral-100 active:scale-95 shadow-sm"
            )}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" strokeWidth={1.5} />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
