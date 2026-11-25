import React, { useState, useEffect, useRef } from 'react';
import { EventCategory } from '../../types/invitation';

interface CardEffectsLayerProps {
  category?: EventCategory;
  enablePetals?: boolean;
  enableDiya?: boolean;
  enableFoilShimmer?: boolean;
  children: React.ReactNode;
}

// Pre-generated petal configs to avoid recalculating on each render
const PETAL_ITEMS = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: `${(i * 5.6 + (i % 3) * 2.5) % 94}%`,
  duration: `${5.5 + (i % 5) * 1.2}s`,
  delay: `${(i * 0.45) % 4.5}s`,
  driftX: `${(i % 2 === 0 ? 1 : -1) * (25 + (i % 4) * 15)}px`,
  rot: `${(i % 2 === 0 ? 1 : -1) * (180 + (i % 6) * 90)}deg`,
  size: 16 + (i % 4) * 5,
  type: i % 3, // 0 = Rose petal, 1 = Marigold / Golden petal, 2 = Sparkle star
}));

export const CardEffectsLayer: React.FC<CardEffectsLayerProps> = ({
  category = 'wedding',
  enablePetals = true,
  enableDiya = true,
  enableFoilShimmer = true,
  children,
}) => {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shine, setShine] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles (-5 deg to +5 deg)
    const tiltX = -((y - centerY) / centerY) * 4.5;
    const tiltY = ((x - centerX) / centerX) * 4.5;

    setTilt({ x: tiltX, y: tiltY });
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.28,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-visible">
      {/* 1. Ambient Flower Petals / Festive Particle Rain */}
      {enablePetals && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {PETAL_ITEMS.map((p) => {
            if (p.type === 0 && (category === 'wedding' || category === 'custom')) {
              // Deep Crimson / Pink Rose Petal
              return (
                <div
                  key={p.id}
                  className="absolute top-0 animate-petal pointer-events-none"
                  style={
                    {
                      left: p.left,
                      '--duration': p.duration,
                      '--delay': p.delay,
                      '--drift-x': p.driftX,
                      '--rot': p.rot,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    width={p.size}
                    height={p.size * 1.3}
                    viewBox="0 0 24 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                  >
                    <path
                      d="M12 0C7 0 0 8 0 18C0 26 6 32 12 32C18 32 24 26 24 18C24 8 17 0 12 0Z"
                      fill="url(#roseGrad)"
                    />
                    <defs>
                      <linearGradient id="roseGrad" x1="0" y1="0" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#b91c1c" />
                        <stop offset="0.6" stopColor="#991b1b" />
                        <stop offset="1" stopColor="#7f1d1d" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              );
            } else if (p.type === 1 && (category === 'wedding' || category === 'custom')) {
              // Auspicious Saffron Marigold (Genda) Petal
              return (
                <div
                  key={p.id}
                  className="absolute top-0 animate-petal pointer-events-none"
                  style={
                    {
                      left: p.left,
                      '--duration': p.duration,
                      '--delay': p.delay,
                      '--drift-x': p.driftX,
                      '--rot': p.rot,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    width={p.size * 0.9}
                    height={p.size * 1.1}
                    viewBox="0 0 20 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                  >
                    <path
                      d="M10 0C5 0 0 6 0 15C0 22 5 26 10 26C15 26 20 22 20 15C20 6 15 0 10 0Z"
                      fill="url(#gendaGrad)"
                    />
                    <defs>
                      <linearGradient id="gendaGrad" x1="0" y1="0" x2="20" y2="26" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fbbf24" />
                        <stop offset="0.7" stopColor="#f59e0b" />
                        <stop offset="1" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              );
            } else if (category === 'birthday') {
              // Festive Colorful Confetti Ribbon
              return (
                <div
                  key={p.id}
                  className="absolute top-0 animate-petal pointer-events-none"
                  style={
                    {
                      left: p.left,
                      '--duration': p.duration,
                      '--delay': p.delay,
                      '--drift-x': p.driftX,
                      '--rot': p.rot,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="rounded-xs shadow-xs"
                    style={{
                      width: p.size * 0.6,
                      height: p.size * 1.2,
                      backgroundColor: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#a855f7'][p.id % 5],
                    }}
                  />
                </div>
              );
            } else {
              // Golden Stardust Sparkle
              return (
                <div
                  key={p.id}
                  className="absolute top-0 animate-petal pointer-events-none"
                  style={
                    {
                      left: p.left,
                      '--duration': p.duration,
                      '--delay': p.delay,
                      '--drift-x': p.driftX,
                      '--rot': p.rot,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    width={p.size * 0.75}
                    height={p.size * 0.75}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-80"
                  >
                    <path
                      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                      fill="#dfba6a"
                    />
                  </svg>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* 2. Sacred Diya Lamps (Lower Corners for Wedding & Traditional) */}
      {enableDiya && (category === 'wedding' || category === 'custom') && (
        <>
          {/* Bottom Left Diya */}
          <div className="absolute -bottom-2 -left-6 z-20 pointer-events-none hidden sm:flex flex-col items-center animate-diya-glow">
            {/* Diya Flame */}
            <div className="w-4 h-6 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white blur-[0.6px] -mb-1 shadow-[0_0_18px_#f59e0b]"></div>
            {/* Brass Diya Bowl */}
            <div className="w-12 h-3.5 bg-gradient-to-r from-[#997328] via-[#dfba6a] to-[#73531b] rounded-b-full border-t border-[#fef08a] shadow-md flex items-center justify-center">
              <div className="w-8 h-1 bg-[#451a03] rounded-full opacity-60"></div>
            </div>
            <div className="w-6 h-1.5 bg-[#73531b] rounded-b-sm"></div>
          </div>

          {/* Bottom Right Diya */}
          <div className="absolute -bottom-2 -right-6 z-20 pointer-events-none hidden sm:flex flex-col items-center animate-diya-glow" style={{ animationDelay: '1.2s' }}>
            {/* Diya Flame */}
            <div className="w-4 h-6 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white blur-[0.6px] -mb-1 shadow-[0_0_18px_#f59e0b]"></div>
            {/* Brass Diya Bowl */}
            <div className="w-12 h-3.5 bg-gradient-to-r from-[#73531b] via-[#dfba6a] to-[#997328] rounded-b-full border-t border-[#fef08a] shadow-md flex items-center justify-center">
              <div className="w-8 h-1 bg-[#451a03] rounded-full opacity-60"></div>
            </div>
            <div className="w-6 h-1.5 bg-[#73531b] rounded-b-sm"></div>
          </div>
        </>
      )}

      {/* 3. Interactive 3D Parallax Tilt & Specular Shine Container */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-sm flex items-center justify-center transition-transform duration-300 ease-out transform-gpu rounded-2xl"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}

        {/* 4. Luxury Gold Foil Light Shimmer Sweep Overlay */}
        {enableFoilShimmer && (
          <div className="animate-gold-foil rounded-2xl pointer-events-none" />
        )}

        {/* 5. Dynamic Cursor Specular Light Reflection */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle 240px at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, ${shine.opacity}) 0%, transparent 80%)`,
          }}
        />
      </div>
    </div>
  );
};
