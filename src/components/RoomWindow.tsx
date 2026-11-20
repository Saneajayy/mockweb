'use client';

import React from 'react';
import WinterSky from './WinterSky';
import SnowMound from './SnowMound';
import ChristmasTree from './ChristmasTree';
import { clsx } from 'clsx';

interface RoomWindowProps {
  className?: string;
}

export default function RoomWindow({ className = '' }: RoomWindowProps) {
  return (
    <div
      className={clsx(
        'pointer-events-none select-none flex flex-col',
        className
      )}
      aria-hidden="true"
    >
      {/* ── Thick Whitewashed Wood Frame with Tilted Non-Parallel Boundary ── */}
      <div
        className="w-full h-full bg-[#fdfbf7] p-5 sm:p-7 md:p-8 flex flex-col relative overflow-hidden"
        style={{
          clipPath: 'polygon(6% 0%, 100% 2.5%, 100% 100%, 0% 97.5%)',
        }}
      >
        {/* ── Whitewashed Cottage Wood Grain Texture Overlay ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="cottage-wood-grain"
              width="50"
              height="160"
              patternUnits="userSpaceOnUse"
            >
              {/* Organic timber grain striations */}
              <path
                d="M 6 0 C 8 40, 4 95, 7 160"
                stroke="#7c6043"
                strokeWidth="0.8"
                strokeOpacity="0.09"
                fill="none"
              />
              <path
                d="M 16 0 C 14 50, 19 110, 15 160"
                stroke="#7c6043"
                strokeWidth="0.5"
                strokeOpacity="0.06"
                fill="none"
              />
              <path
                d="M 28 0 C 31 35, 25 115, 29 160"
                stroke="#7c6043"
                strokeWidth="0.8"
                strokeOpacity="0.08"
                fill="none"
              />
              <path
                d="M 38 0 C 36 60, 40 105, 37 160"
                stroke="#7c6043"
                strokeWidth="0.5"
                strokeOpacity="0.06"
                fill="none"
              />
              <path
                d="M 46 0 C 48 45, 44 125, 47 160"
                stroke="#7c6043"
                strokeWidth="0.7"
                strokeOpacity="0.08"
                fill="none"
              />
            </pattern>
          </defs>

          {/* Timber grain pattern fill */}
          <rect width="100%" height="100%" fill="url(#cottage-wood-grain)" />

          {/* Carpenter's inner carved contour groove */}
          <path
            d="M 10 10 L 100% 12"
            stroke="#7c6043"
            strokeWidth="0.8"
            strokeOpacity="0.10"
            fill="none"
          />
          <path
            d="M 10 10 L 6 90%"
            stroke="#7c6043"
            strokeWidth="0.8"
            strokeOpacity="0.10"
            fill="none"
          />
          <path
            d="M 6 90% L 100% 92%"
            stroke="#7c6043"
            strokeWidth="0.8"
            strokeOpacity="0.10"
            fill="none"
          />

          {/* Corner miter joint line (where horizontal sill board meets vertical jamb) */}
          <line
            x1="0"
            y1="98%"
            x2="22"
            y2="88%"
            stroke="#7c6043"
            strokeWidth="0.9"
            strokeOpacity="0.14"
          />
        </svg>

        {/* ── Glass Pane (Matching subtle perspective tilt) ── */}
        <div
          className="w-full h-full relative overflow-hidden bg-black z-[1]"
          style={{
            clipPath: 'polygon(4% 0%, 100% 2%, 100% 100%, 0% 98%)',
          }}
        >
          {/* Deep Winter Midnight Sky (matching login page) */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                'linear-gradient(180deg, #001259 0%, #001156 32%, #000c3e 56%, #000724 78%, #000108 100%)',
            }}
          />

          {/* Dynamic Winter Snowfall (falls over sky behind the snowmound) */}
          <WinterSky
            className="absolute inset-0 z-[2] pointer-events-none"
            flakeCount={28}
            starCount={18}
          />

          {/* ── Distant Outdoor Winter Landscape (from login page) ── */}

          {/* 1st Snow Mound (Foreground snow cover) */}
          <SnowMound
            className="absolute bottom-0 left-0 right-0 w-full h-[20%] z-[5]"
          />

          {/* Main Christmas Tree (In front of 1st snow mound) */}
          <ChristmasTree
            className="absolute bottom-[2%] left-[28%] -translate-x-1/2 w-[84px] h-[84px] sm:w-[106px] sm:h-[106px] z-[7]"
          />

          {/* Foreground Large Snowfall (falling right in front of the tree & snowmound right outside the glass) */}
          <WinterSky
            className="absolute inset-0 z-[12] pointer-events-none"
            snowOnly={true}
            flakeCount={12}
            sizeScale={2.4}
            speedScale={1.25}
          />

          {/* ── 4-Pane Window Cross Dividers (Mullion & Transom) ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[18]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Horizontal Transom Wood Bar */}
            <polygon
              points="0,47 100,48.5 100,53.5 0,52"
              fill="#fdfbf7"
              stroke="#000000"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
            {/* Vertical Mullion Wood Bar */}
            <polygon
              points="48.5,0 53.5,0 51.5,100 46.5,100"
              fill="#fdfbf7"
              stroke="#000000"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
            {/* Seamless center joint crossing cover */}
            <rect
              x="47"
              y="47.5"
              width="6"
              height="5"
              fill="#fdfbf7"
            />
          </svg>

          {/* ── Realistic Glass Optical Pane Effects ── */}
          <div className="absolute inset-0 pointer-events-none z-[20] overflow-hidden">
            {/* 1. Ultra-Soft Wide Glass Sheen Anchored at Top-Left */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 135% 115% at 0% 0%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.03) 52%, rgba(255,255,255,0.005) 74%, transparent 90%)',
              }}
            />

            {/* 3. Subtle Warm Fireplace Fire Reflection from Below */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 25% 95%, rgba(245,158,11,0.13) 0%, rgba(245,158,11,0.04) 45%, transparent 70%)',
              }}
            />

            {/* 4. Delicate Winter Corner Frost Vapor */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.14) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.10) 0%, transparent 30%)',
              }}
            />

            {/* 5. Inset Glass Bevel Highlight */}
            <div className="absolute inset-0 border-t border-l border-white/20" />
          </div>

          {/* ── Very Very Ultra-Thin Black Stroke on Inner Glass Boundary ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[25]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="4,0 100,2 100,100 0,98"
              fill="none"
              stroke="#000000"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      </div>

      {/* ── Very Very Ultra-Thin Black Stroke on Outer Window Boundary ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="6,0 100,2.5 100,100 0,97.5"
          fill="none"
          stroke="#000000"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}
