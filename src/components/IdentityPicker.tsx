'use client';

import { Lottie } from 'lottie-react';
import shivaliAnimation from '../../public/shivali.json';
import ajayAnimation from '../../public/ajay.json';
import SnowMound from './SnowMound';
import ChristmasTree from './ChristmasTree';
import SecondChristmasTree from './SecondChristmasTree';
import ChristmasHouse from './ChristmasHouse';
import WinterSky from './WinterSky';
import { useIsMounted } from '@/lib/useIsMounted';

interface IdentityPickerProps {
  authorA: string;
  authorB: string;
  onSelect: (author: string) => void;
}

export default function IdentityPicker({ authorA, authorB, onSelect }: IdentityPickerProps) {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-16 sm:pt-24 p-6 overflow-hidden"
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

      {/* Avatar Buttons: Shivali (Author A) & Ajay (Author B) */}
      <div className="relative z-30 flex items-center justify-center gap-12 sm:gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Author A: Shivali */}
        <button
          type="button"
          onClick={() => onSelect(authorA)}
          className="group flex flex-col items-center focus:outline-none cursor-pointer select-none transition-all duration-300"
          aria-label={`Enter as ${authorA}`}
        >
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-active:scale-95 drop-shadow-xl flex items-center justify-center pointer-events-none">
            <Lottie
              src={shivaliAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full scale-[1.64] origin-center pointer-events-none"
            />
          </div>
        </button>

        {/* Author B: Ajay */}
        <button
          type="button"
          onClick={() => onSelect(authorB)}
          className="group flex flex-col items-center focus:outline-none cursor-pointer select-none transition-all duration-300"
          aria-label={`Enter as ${authorB}`}
        >
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-active:scale-95 drop-shadow-xl flex items-center justify-center pointer-events-none">
            <Lottie
              src={ajayAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full scale-[1.64] origin-center pointer-events-none"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
