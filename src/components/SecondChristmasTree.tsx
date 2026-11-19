'use client';

import React from 'react';
import { Lottie } from 'lottie-react';
import secondTreeAnimation from '../../public/2ndtree.json';
import { useIsMounted } from '@/lib/useIsMounted';

interface SecondChristmasTreeProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function SecondChristmasTree({ className = '', style }: SecondChristmasTreeProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`pointer-events-none select-none ${className}`} style={style}>
      <Lottie
        src={secondTreeAnimation}
        loop={true}
        autoplay={true}
        className="w-full h-full"
      />
    </div>
  );
}
