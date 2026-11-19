'use client';

import React from 'react';
import { Lottie } from 'lottie-react';
import houseAnimation from '../../public/housee.json';
import { useIsMounted } from '@/lib/useIsMounted';

interface ChristmasHouseProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ChristmasHouse({ className = '', style }: ChristmasHouseProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`pointer-events-none select-none ${className}`} style={style}>
      <Lottie
        src={houseAnimation}
        loop={true}
        autoplay={true}
        className="w-full h-full"
      />
    </div>
  );
}
