'use client';

import React from 'react';
import { Lottie } from 'lottie-react';
import fireplaceAnimation from '../../public/fireplace.json';
import { useIsMounted } from '@/lib/useIsMounted';

interface FireplaceProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Fireplace({ className = '', style }: FireplaceProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`pointer-events-none select-none ${className}`} style={style}>
      {/* Large, soft diffused breathing firelight glow */}
      <div
        className="fire-glow absolute left-1/2 top-[64%] w-[440px] h-[440px] sm:w-[520px] sm:h-[520px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 190, 50, 0.78) 0%, rgba(255, 120, 25, 0.45) 38%, rgba(235, 75, 15, 0.16) 62%, transparent 82%)',
          filter: 'blur(52px)',
        }}
      />

      {/* Soft warm firelight reflection on floor at hearth base */}
      <div
        className="fire-glow absolute left-1/2 top-[78%] w-[360px] h-[120px] sm:w-[440px] sm:h-[140px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 160, 40, 0.55) 0%, rgba(245, 95, 20, 0.24) 48%, transparent 78%)',
          filter: 'blur(28px)',
          animationDelay: '1.4s',
        }}
      />

      <Lottie
        src={fireplaceAnimation}
        loop={true}
        autoplay={true}
        className="w-full h-full relative z-10"
      />
    </div>
  );
}
