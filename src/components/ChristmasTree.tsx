'use client';

import React from 'react';
import { Lottie } from 'lottie-react';
import treeAnimation from '../../public/christmastree.json';
import { useIsMounted } from '@/lib/useIsMounted';

interface ChristmasTreeProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ChristmasTree({ className = '', style }: ChristmasTreeProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`pointer-events-none select-none ${className}`} style={style}>
      <Lottie
        src={treeAnimation}
        loop={true}
        autoplay={true}
        className="w-full h-full"
      />
    </div>
  );
}
