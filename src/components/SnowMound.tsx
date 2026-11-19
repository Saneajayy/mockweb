'use client';

import React from 'react';

export interface SnowMoundProps {
  className?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  flipHorizontal?: boolean;
  style?: React.CSSProperties;
}

export default function SnowMound({
  className = '',
  color = '#F7E9CC',
  strokeColor = '#000000',
  strokeWidth = 0.5,
  flipHorizontal = false,
  style,
}: SnowMoundProps) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <g transform={flipHorizontal ? 'scale(-1, 1) translate(-1000, 0)' : undefined}>
          {/* Fill */}
          <path
            d="M 0 75 C 350 40, 750 -10, 1000 140 L 1000 300 L 0 300 Z"
            fill={color}
          />
          {/* Top curved stroke only */}
          <path
            d="M 0 75 C 350 40, 750 -10, 1000 140"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
}
