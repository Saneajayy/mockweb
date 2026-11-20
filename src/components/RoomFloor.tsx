'use client';

interface RoomFloorProps {
  className?: string;
}

export default function RoomFloor({ className = '' }: RoomFloorProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-0 left-0 right-0 h-[21%] min-h-[145px] max-h-[225px] z-0 overflow-hidden flex flex-col justify-end ${className}`}
      style={{ perspective: '500px', perspectiveOrigin: '50% 100%' }}
    >
      {/* 3D Pitched Floor Plane */}
      <div
        className="absolute bottom-0 -left-[20%] w-[140%] h-[125%] flex flex-col justify-end shadow-[inset_0_20px_35px_rgba(0,0,0,0.25)]"
        style={{
          transform: 'rotateX(48deg)',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Baseboard trim stuck directly to the floor top */}
        <div className="w-full h-2.5 bg-[#6b381b] border-t border-black/50 border-b border-[#43200e] shadow-[0_2px_5px_rgba(0,0,0,0.35)] shrink-0" />

        {/* Plank Row 1 (Furthest back - compressed in perspective) */}
        <div className="h-[17%] bg-[#8c522f] relative flex border-b-[2px] border-[#44200c] shadow-[0_1px_0_rgba(255,255,255,0.08)]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />
          {/* Vertical joints slightly angled toward horizon */}
          <div className="absolute top-0 bottom-0 left-[30%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] -rotate-[2deg]" />
          <div className="absolute top-0 bottom-0 left-[72%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] rotate-[2deg]" />
        </div>

        {/* Plank Row 2 (Mid-back) */}
        <div className="h-[23%] bg-[#965a36] relative flex border-b-[2px] border-[#44200c] shadow-[0_1px_0_rgba(255,255,255,0.08)]">
          <div className="absolute top-[40%] left-0 right-0 h-[1px] bg-white/[0.04]" />
          <div className="absolute top-0 bottom-0 left-[18%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] -rotate-[4deg]" />
          <div className="absolute top-0 bottom-0 left-[54%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] rotate-[1deg]" />
          <div className="absolute top-0 bottom-0 left-[84%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] rotate-[4deg]" />
        </div>

        {/* Plank Row 3 (Mid-front) */}
        <div className="h-[28%] bg-[#884e2a] relative flex border-b-[2px] border-[#44200c] shadow-[0_1px_0_rgba(255,255,255,0.08)]">
          <div className="absolute top-[48%] left-0 right-0 h-[1px] bg-black/[0.06]" />
          <div className="absolute top-0 bottom-0 left-[34%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] -rotate-[3deg]" />
          <div className="absolute top-0 bottom-0 left-[68%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] rotate-[3deg]" />
        </div>

        {/* Plank Row 4 (Forefront - closest to camera, widest) */}
        <div className="h-[32%] bg-[#9e623b] relative flex">
          <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-white/[0.05]" />
          <div className="absolute top-0 bottom-0 left-[16%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] -rotate-[5deg]" />
          <div className="absolute top-0 bottom-0 left-[50%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)]" />
          <div className="absolute top-0 bottom-0 left-[82%] w-[1.5px] bg-[#44200c] shadow-[1px_0_0_rgba(255,255,255,0.07)] rotate-[5deg]" />
        </div>
      </div>
    </div>
  );
}
