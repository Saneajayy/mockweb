'use client';

import { useState, useEffect, useRef } from 'react';

export default function Rabbit() {
  const [pos, setPos] = useState({ x: 50, y: 80 });
  const [facingRight, setFacingRight] = useState(true);
  const [walkDuration, setWalkDuration] = useState(0);
  const posRef = useRef(pos);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const walk = () => {
      const currentPos = posRef.current;
      const newX = 5 + Math.random() * 90; // 5% to 95% width
      const newY = 55 + Math.random() * 35; // 55% to 90% height (restrict to bottom half)

      // Calculate distance to determine how long the walk should take
      const distance = Math.sqrt(
        Math.pow(newX - currentPos.x, 2) + Math.pow(newY - currentPos.y, 2)
      );
      
      // Speed: travel 10% of screen distance per second, minimum 3 seconds
      const duration = Math.max(3, distance / 10); 
      
      setFacingRight(newX > currentPos.x);
      setWalkDuration(duration);
      
      const nextPos = { x: newX, y: newY };
      setPos(nextPos);
      posRef.current = nextPos;

      // Wait for the walk to finish (duration), then rest for 2-6 seconds before next walk
      const nextWalkDelay = (duration * 1000) + 2000 + Math.random() * 4000;
      timeout = setTimeout(walk, nextWalkDelay);
    };

    timeout = setTimeout(walk, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div 
      className="fixed z-0 pointer-events-none w-40 h-40 min-w-[10rem] min-h-[10rem]"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `translate(-50%, -50%) ${facingRight ? 'scaleX(-1)' : 'scaleX(1)'}`,
        transition: `left ${walkDuration}s linear, top ${walkDuration}s linear`
      }}
    >
      <img 
        src="/rabbit.png" 
        alt="Cute Rabbit" 
        className="w-full h-full object-contain drop-shadow-xl"
        style={{ transition: 'none' }}
      />
    </div>
  );
}
