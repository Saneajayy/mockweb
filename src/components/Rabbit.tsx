'use client';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';

export interface RabbitProps {
  id?: string;
  initialPos?: { x: number; y: number };
  initialFacingRight?: boolean;
  initialDelay?: number;
  speedMultiplier?: number;
  sizeClassName?: string;
  imageSrc?: string;
  alt?: string;
  enableHop?: boolean;
}

export default function Rabbit({
  id = 'rabbit',
  initialPos = { x: 50, y: 80 },
  initialFacingRight = true,
  initialDelay = 2000,
  speedMultiplier = 1,
  sizeClassName = 'w-40 h-40 min-w-[10rem] min-h-[10rem]',
  imageSrc = '/rabbit.png',
  alt = 'Cute Rabbit',
  enableHop = true,
}: RabbitProps = {}) {
  const [pos, setPos] = useState(initialPos);
  const [facingRight, setFacingRight] = useState(initialFacingRight);
  const [walkDuration, setWalkDuration] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const posRef = useRef(pos);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let stopMovingTimeout: NodeJS.Timeout;

    const walk = () => {
      const currentPos = posRef.current;
      const newX = 5 + Math.random() * 90; // 5% to 95% width
      const newY = 55 + Math.random() * 35; // 55% to 90% height (restrict to bottom half)

      // Calculate distance to determine how long the walk should take
      const distance = Math.sqrt(
        Math.pow(newX - currentPos.x, 2) + Math.pow(newY - currentPos.y, 2)
      );
      
      // Speed: travel 10% of screen distance per second, minimum 3 seconds
      const duration = Math.max(3, distance / (10 * speedMultiplier)); 
      
      setFacingRight(newX > currentPos.x);
      setWalkDuration(duration);
      setIsMoving(true);
      
      const nextPos = { x: newX, y: newY };
      setPos(nextPos);
      posRef.current = nextPos;

      // Stop hopping once arrived
      stopMovingTimeout = setTimeout(() => {
        setIsMoving(false);
      }, duration * 1000);

      // Wait for the walk to finish (duration), then rest for 2-6 seconds before next walk
      const nextWalkDelay = (duration * 1000) + 2000 + Math.random() * 4000;
      timeout = setTimeout(walk, nextWalkDelay);
    };

    timeout = setTimeout(walk, initialDelay);

    return () => {
      clearTimeout(timeout);
      clearTimeout(stopMovingTimeout);
    };
  }, [initialDelay, speedMultiplier]);

  return (
    <div 
      id={id}
      className={clsx("fixed z-0 pointer-events-none select-none", sizeClassName)}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `translate(-50%, -50%) ${facingRight ? 'scaleX(-1)' : 'scaleX(1)'}`,
        transition: `left ${walkDuration}s linear, top ${walkDuration}s linear`
      }}
    >
      <div className={clsx("w-full h-full", enableHop && isMoving && "rabbit-hopping")}>
        <Image 
          src={imageSrc} 
          alt={alt} 
          width={160}
          height={160}
          unoptimized
          className="w-full h-full object-contain drop-shadow-xl"
          style={{ transition: 'none' }}
        />
      </div>
    </div>
  );
}

