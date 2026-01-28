'use client';

import { useState, useEffect } from 'react';

const stages = [
  { label: 'Infant', color: '#5BA3E6' },
  { label: 'Toddler', color: '#E91E63' },
  { label: 'Preschool', color: '#43A047' },
  { label: 'School Age', color: '#7B1FA2' },
  { label: 'College', color: '#C62828' },
];

/* True spiral path points - loops around while ascending */
const spiralPoints = [
  { x: 120, y: 320 },
  { x: 280, y: 280 },
  { x: 400, y: 200 },
  { x: 520, y: 140 },
  { x: 680, y: 80 },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  /* Simple, reliable animation cycle */
  useEffect(() => {
    const cycleDuration = 3000;
    const fadeDuration = 600;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % stages.length);
        setIsVisible(true);
      }, fadeDuration);
    }, cycleDuration);

    return () => clearInterval(interval);
  }, []);

  const currentStage = stages[activeIndex];
  const currentPos = spiralPoints[activeIndex];

  return (
    <div className="relative min-h-[560px] md:min-h-[650px] overflow-hidden bg-gradient-to-br from-amber-50 via-white to-sky-50 flex flex-col items-center justify-center px-4 py-8">

      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-80 h-80 rounded-full opacity-20 animate-float-slow" style={{ background: 'radial-gradient(circle, #E91E63 0%, transparent 70%)', left: '5%', top: '10%' }} />
        <div className="absolute w-64 h-64 rounded-full opacity-15 animate-float-medium" style={{ background: 'radial-gradient(circle, #43A047 0%, transparent 70%)', right: '10%', top: '20%' }} />
        <div className="absolute w-72 h-72 rounded-full opacity-10 animate-float-fast" style={{ background: 'radial-gradient(circle, #5BA3E6 0%, transparent 70%)', left: '30%', bottom: '5%' }} />
      </div>

      {/* Rainbow Tagline - ABOVE umbrella, larger */}
      <h1
        className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-center mb-2"
        style={{
          background: 'linear-gradient(90deg, #C62828, #E65100, #F9A825, #2E7D32, #1565C0, #6A1B9A)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 3s linear infinite',
        }}
      >
        Where Learning and Growth Become One
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 text-center mt-2">
        Christina&apos;s Child Care Center
      </p>

      {/* Animation Canvas - True Spiral Journey */}
      <div className="relative z-10 w-full max-w-3xl mt-4">
        <svg viewBox="0 0 800 400" className="w-full h-auto" role="img" aria-label={`Child at ${currentStage.label} stage`}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="spiralGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C62828" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#C62828" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C62828" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* True Spiral Path - loops around while going up and right */}
          <path
            d="M60,360
               C80,340 100,350 140,320
               C180,290 160,260 200,240
               C240,220 280,250 320,220
               C360,190 340,160 380,140
               C420,120 460,150 500,120
               C540,90 520,60 560,50
               C600,40 640,70 680,40
               C720,10 740,30 760,20"
            fill="none"
            stroke="url(#spiralGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="12 8"
            className="animate-dash"
          />

          {/* Spiral loops - additional curves for spiral effect */}
          <path
            d="M100,340 C130,320 120,300 150,280"
            fill="none"
            stroke="#C62828"
            strokeWidth="3"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
          <path
            d="M240,260 C270,240 260,220 290,200"
            fill="none"
            stroke="#C62828"
            strokeWidth="3"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
          <path
            d="M380,180 C410,160 400,140 430,120"
            fill="none"
            stroke="#C62828"
            strokeWidth="3"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
          <path
            d="M520,100 C550,80 540,60 570,50"
            fill="none"
            stroke="#C62828"
            strokeWidth="3"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />

          {/* Glow trail */}
          <path
            d="M60,360
               C80,340 100,350 140,320
               C180,290 160,260 200,240
               C240,220 280,250 320,220
               C360,190 340,160 380,140
               C420,120 460,150 500,120
               C540,90 520,60 560,50
               C600,40 640,70 680,40
               C720,10 740,30 760,20"
            fill="none"
            stroke="#FFCDD2"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.3"
            filter="url(#glow)"
          />

          {/* Milestone markers */}
          {spiralPoints.map((point, i) => {
            const isReached = i <= activeIndex;
            const isCurrent = i === activeIndex;
            return (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y + 25}
                  r={isCurrent ? 10 : 7}
                  fill={isReached ? stages[i].color : '#DDD'}
                  className={isCurrent ? 'animate-pulse-ring' : ''}
                />
                {isCurrent && (
                  <circle
                    cx={point.x}
                    cy={point.y + 25}
                    r="10"
                    fill="none"
                    stroke={stages[i].color}
                    strokeWidth="2"
                    className="animate-ping-slow"
                  />
                )}
                <text
                  x={point.x}
                  y={point.y + 50}
                  textAnchor="middle"
                  fill={isReached ? '#444' : '#AAA'}
                  fontSize="13"
                  fontWeight={isCurrent ? '700' : '400'}
                  fontFamily="system-ui"
                >
                  {stages[i].label}
                </text>
              </g>
            );
          })}

          {/* Animated Character */}
          <g
            style={{
              transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Character stage={activeIndex} color={currentStage.color} />
          </g>

          {/* Sparkles around current position */}
          {isVisible && (
            <g className="animate-sparkle">
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <circle
                  key={i}
                  cx={currentPos.x + Math.cos(angle * Math.PI / 180) * 40}
                  cy={currentPos.y + Math.sin(angle * Math.PI / 180) * 40}
                  r="3"
                  fill="#F9A825"
                  opacity={0.7}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Location */}
      <p className="relative z-10 mt-4 text-sm text-gray-500">
        Crystal, MN &bull; Licensed by Minnesota DHS
      </p>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -40; }
        }
        .animate-dash {
          animation: dash 2s linear infinite;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float 6s ease-in-out infinite reverse;
        }
        .animate-float-fast {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        .animate-ping-slow {
          animation: ping 1.5s ease-out infinite;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-sparkle {
          animation: sparkle 0.8s ease-out;
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.7; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* Character component for each life stage */
function Character({ stage, color }: { stage: number; color: string }) {
  const sizes = [0.7, 0.85, 1.0, 1.15, 1.3];
  const scale = sizes[stage];

  return (
    <g transform={`scale(${scale})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="35" rx={12 * scale} ry={4} fill="#000" opacity="0.15" />

      {/* Body */}
      <rect x="-12" y="-5" width="24" height="35" rx="8" fill={color} />

      {/* Legs */}
      <rect x="-10" y="28" width="8" height="18" rx="4" fill="#8D5524" />
      <rect x="2" y="28" width="8" height="18" rx="4" fill="#8D5524" />

      {/* Shoes */}
      <ellipse cx="-6" cy="47" rx="6" ry="3" fill={color} />
      <ellipse cx="6" cy="47" rx="6" ry="3" fill={color} />

      {/* Arms */}
      <rect x="-18" y="0" width="8" height="20" rx="4" fill="#8D5524" />
      <rect x="10" y="0" width="8" height="20" rx="4" fill="#8D5524" />

      {/* Head */}
      <circle cx="0" cy="-18" r="16" fill="#8D5524" />

      {/* Hair based on stage */}
      {stage === 0 && (
        <path d="M-10,-28 Q0,-38 10,-28" fill="#3E2723" />
      )}
      {(stage === 1 || stage === 3) && (
        <>
          <circle cx="-14" cy="-20" r="6" fill="#3E2723" />
          <circle cx="14" cy="-20" r="6" fill="#3E2723" />
          <path d="M-12,-28 Q0,-36 12,-28" fill="#3E2723" />
        </>
      )}
      {stage === 2 && (
        <>
          <path d="M-12,-28 Q0,-36 12,-28" fill="#3E2723" />
          <rect x="-10" y="-34" width="20" height="6" rx="2" fill="#3E2723" />
        </>
      )}
      {stage === 4 && (
        <>
          <path d="M-12,-28 Q0,-36 12,-28" fill="#3E2723" />
          {/* Graduation cap */}
          <rect x="-18" y="-38" width="36" height="5" fill="#212121" />
          <rect x="-10" y="-44" width="20" height="7" fill="#212121" />
          <line x1="18" y1="-38" x2="22" y2="-30" stroke="#F9A825" strokeWidth="2" />
          <circle cx="23" cy="-29" r="3" fill="#F9A825" />
        </>
      )}

      {/* Eyes */}
      <circle cx="-5" cy="-20" r="2.5" fill="#222" />
      <circle cx="5" cy="-20" r="2.5" fill="#222" />
      <circle cx="-4" cy="-21" r="1" fill="#FFF" />
      <circle cx="6" cy="-21" r="1" fill="#FFF" />

      {/* Smile */}
      <path d="M-5,-12 Q0,-8 5,-12" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="-10" cy="-15" r="3" fill="#E91E63" opacity="0.3" />
      <circle cx="10" cy="-15" r="3" fill="#E91E63" opacity="0.3" />

      {/* Stage-specific accessories */}
      {stage === 2 && (
        <rect x="-20" y="0" width="10" height="18" rx="3" fill="#C62828" />
      )}
      {stage === 3 && (
        <>
          <rect x="14" y="5" width="12" height="16" rx="2" fill="#C62828" />
          <rect x="15" y="6" width="10" height="14" rx="1" fill="#F9A825" />
        </>
      )}
      {stage === 4 && (
        <>
          <rect x="18" y="-5" width="5" height="18" rx="2" fill="#F5F5F5" />
          <rect x="16" y="-5" width="9" height="4" rx="1" fill="#C62828" />
        </>
      )}
    </g>
  );
}
