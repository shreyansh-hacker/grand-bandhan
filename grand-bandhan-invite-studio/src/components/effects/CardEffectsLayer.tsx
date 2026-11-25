import React, { useState, useRef } from 'react';
import { EventCategory } from '../../types/invitation';

export type ParticleType = 'flowers' | 'cakes' | 'confetti' | 'stars' | 'tech' | 'none';

interface CardEffectsLayerProps {
  category?: EventCategory;
  particleType?: ParticleType;
  enablePetals?: boolean;
  enableDiya?: boolean;
  enableFoilShimmer?: boolean;
  cardAnimation?: 'float' | 'zoom' | 'breathe' | 'none';
  children: React.ReactNode;
}

// Pre-generated petal configs to avoid recalculating on each render
const PETAL_ITEMS = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  left: `${(i * 6.2 + (i % 3) * 2.5) % 94}%`,
  duration: `${5.5 + (i % 5) * 1.2}s`,
  delay: `${(i * 0.45) % 4.5}s`,
  driftX: `${(i % 2 === 0 ? 1 : -1) * (25 + (i % 4) * 15)}px`,
  rot: `${(i % 2 === 0 ? 1 : -1) * (180 + (i % 6) * 90)}deg`,
  size: 16 + (i % 4) * 5,
  type: i % 2, // 0 = Rose petal, 1 = Marigold / Golden petal
}));

// Pre-generated mini birthday cake & balloons configs
const CAKE_ITEMS = Array.from({ length: 7 }).map((_, i) => ({
  id: `cake-${i}`,
  left: `${(i * 14 + 6) % 90}%`,
  duration: `${6.5 + (i % 3) * 1.5}s`,
  delay: `${(i * 0.9) % 5}s`,
  driftX: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 12)}px`,
  rot: `${(i % 2 === 0 ? 15 : -15)}deg`,
  size: 26 + (i % 3) * 4,
}));

const BALLOON_ITEMS = Array.from({ length: 6 }).map((_, i) => ({
  id: `balloon-${i}`,
  left: `${(i * 16 + 8) % 88}%`,
  duration: `${8 + (i % 3) * 2}s`,
  delay: `${(i * 1.2) % 6}s`,
  driftX: `${(i % 2 === 0 ? -1 : 1) * (20 + (i % 3) * 10)}px`,
  rot: `${(i % 2 === 0 ? -10 : 10)}deg`,
  size: 28 + (i % 3) * 6,
  color: ['#ef476f', '#06d6a0', '#118ab2', '#ffd166', '#a855f7', '#f72585'][i % 6],
}));

export const CardEffectsLayer: React.FC<CardEffectsLayerProps> = ({
  category = 'wedding',
  particleType,
  enablePetals = true,
  enableDiya = false, // Kept false by default to keep borders pristine and clean without yellow lines
  enableFoilShimmer = true,
  cardAnimation = 'float',
  children,
}) => {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shine, setShine] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  // Inferred particle type
  const activeParticles: ParticleType = particleType || (
    category === 'birthday' ? 'cakes' :
    category === 'corporate' ? 'tech' :
    'flowers'
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles (-4.5 deg to +4.5 deg)
    const tiltX = -((y - centerY) / centerY) * 4;
    const tiltY = ((x - centerX) / centerX) * 4;

    setTilt({ x: tiltX, y: tiltY });
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-visible">
      {/* 1. Festive Particle Rain: Flowers for Wedding, Cakes & Balloons for Birthday, Tech for Corporate */}
      {enablePetals && activeParticles !== 'none' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {/* A. FLOWERS (Wedding & Traditional Celebrations) */}
          {activeParticles === 'flowers' && (
            <>
              {PETAL_ITEMS.map((p) => {
                if (p.type === 0) {
                  // Crimson Rose Petal
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
                } else {
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
                }
              })}
            </>
          )}

          {/* B. CAKES & BALLOONS (Birthday Celebrations) */}
          {activeParticles === 'cakes' && (
            <>
              {/* Floating Mini Birthday Cakes */}
              {CAKE_ITEMS.map((cake) => (
                <div
                  key={cake.id}
                  className="absolute top-0 animate-cake-fall pointer-events-none"
                  style={
                    {
                      left: cake.left,
                      '--duration': cake.duration,
                      '--delay': cake.delay,
                      '--drift-x': cake.driftX,
                      '--rot': cake.rot,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    width={cake.size}
                    height={cake.size * 1.1}
                    viewBox="0 0 32 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-md"
                  >
                    {/* Glowing Candle Flame */}
                    <path d="M16 2C15 5 17 6 16 8C15 6 17 5 16 2Z" fill="#ffb703" />
                    {/* Candle Stick */}
                    <rect x="15" y="8" width="2" height="6" rx="1" fill="#f72585" />
                    {/* Cake Frosting Layer */}
                    <rect x="7" y="14" width="18" height="6" rx="3" fill="#ffeaa7" />
                    <rect x="4" y="19" width="24" height="13" rx="4" fill="#ff7675" />
                    {/* Cake Cream Drippings */}
                    <circle cx="8" cy="20" r="2" fill="#ffeaa7" />
                    <circle cx="16" cy="21" r="2.5" fill="#ffeaa7" />
                    <circle cx="24" cy="20" r="2" fill="#ffeaa7" />
                    {/* Colorful Sprinkles */}
                    <circle cx="10" cy="26" r="1" fill="#74b9ff" />
                    <circle cx="16" cy="28" r="1" fill="#a29bfe" />
                    <circle cx="22" cy="26" r="1" fill="#55efc4" />
                  </svg>
                </div>
              ))}

              {/* Rising Helium Balloons */}
              {BALLOON_ITEMS.map((bal) => (
                <div
                  key={bal.id}
                  className="absolute bottom-0 animate-balloon-rise pointer-events-none"
                  style={
                    {
                      left: bal.left,
                      '--duration': bal.duration,
                      '--delay': bal.delay,
                      '--drift-x': bal.driftX,
                      '--rot': bal.rot,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    width={bal.size}
                    height={bal.size * 1.4}
                    viewBox="0 0 24 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-90 drop-shadow-md"
                  >
                    {/* Balloon Oval */}
                    <ellipse cx="12" cy="11" rx="10" ry="11" fill={bal.color} />
                    {/* Specular Highlight on Balloon */}
                    <ellipse cx="8" cy="7" rx="2" ry="4" fill="white" fillOpacity="0.4" />
                    {/* Balloon Knot */}
                    <polygon points="10,22 14,22 12,24" fill={bal.color} />
                    {/* Balloon String */}
                    <path
                      d="M12 24 C13 27, 10 30, 12 34"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
              ))}
            </>
          )}

          {/* C. TECH NODES (Corporate Events) */}
          {activeParticles === 'tech' && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`tech-${i}`}
                  className="absolute top-0 animate-petal pointer-events-none"
                  style={
                    {
                      left: `${(i * 8 + 4) % 94}%`,
                      '--duration': `${6 + (i % 4)}s`,
                      '--delay': `${(i * 0.7) % 4}s`,
                      '--drift-x': `${(i % 2 === 0 ? 15 : -15)}px`,
                      '--rot': `${i * 30}deg`,
                    } as React.CSSProperties
                  }
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/70 border border-cyan-200 blur-[0.4px] shadow-[0_0_8px_#06b6d4]" />
                </div>
              ))}
            </>
          )}

          {/* D. CONFETTI (Celebration Gala) */}
          {activeParticles === 'confetti' && (
            <>
              {PETAL_ITEMS.map((p) => (
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
              ))}
            </>
          )}
        </div>
      )}

      {/* 2. Interactive 3D Parallax Tilt Container with Entrance and Floating Animations */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full max-w-sm flex items-center justify-center transition-transform duration-300 ease-out transform-gpu rounded-2xl animate-card-entrance ${
          cardAnimation === 'float' ? 'animate-card-float' : ''
        }`}
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}

        {/* 3. Luxury Gold Foil Light Shimmer Sweep Overlay */}
        {enableFoilShimmer && (
          <div className="animate-gold-foil rounded-2xl pointer-events-none" />
        )}

        {/* 4. Dynamic Cursor Specular Light Reflection */}
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
