'use client';

import { useState, useEffect } from 'react';

const stages = [
  { label: 'Infant', color: '#5BA3E6', skin: '#8D5524', skinLight: '#A0693A', skinDark: '#7A4518', hair: '#1A1A1A', hairStyle: 'curly' },
  { label: 'Toddler', color: '#E91E63', skin: '#F1C27D', skinLight: '#FDDAA0', skinDark: '#D4A55A', hair: '#0D0D0D', hairStyle: 'straight' },
  { label: 'Preschool', color: '#43A047', skin: '#FDDBB4', skinLight: '#FEE8CC', skinDark: '#E8C9A0', hair: '#B5651D', hairStyle: 'wavy' },
  { label: 'School Age', color: '#7B1FA2', skin: '#C68642', skinLight: '#D4975A', skinDark: '#A96B2F', hair: '#2C1608', hairStyle: 'curly' },
  { label: 'College', color: '#C62828', skin: '#4A2912', skinLight: '#5E3A1E', skinDark: '#3B1E0A', hair: '#0D0D0D', hairStyle: 'tight' },
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

      {/* Curved Rainbow Tagline - arcs over subtitle like an umbrella */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mb-0">
        <svg viewBox="0 0 800 160" className="w-full h-auto" role="heading" aria-level={1} aria-label="Where Learning and Growth Become One">
          <defs>
            {/* Animated rainbow gradient for text */}
            <linearGradient id="rainbowTextAnimated" x1="0%" y1="0%" x2="200%" y2="0%">
              <stop offset="0%" stopColor="#C62828" />
              <stop offset="10%" stopColor="#E65100" />
              <stop offset="20%" stopColor="#F9A825" />
              <stop offset="30%" stopColor="#2E7D32" />
              <stop offset="40%" stopColor="#1565C0" />
              <stop offset="50%" stopColor="#6A1B9A" />
              <stop offset="60%" stopColor="#C62828" />
              <stop offset="70%" stopColor="#E65100" />
              <stop offset="80%" stopColor="#F9A825" />
              <stop offset="90%" stopColor="#2E7D32" />
              <stop offset="100%" stopColor="#1565C0" />
              <animate attributeName="x1" from="0%" to="-100%" dur="3s" repeatCount="indefinite" />
              <animate attributeName="x2" from="200%" to="100%" dur="3s" repeatCount="indefinite" />
            </linearGradient>
            {/* Curved path for text - wider umbrella arc */}
            <path
              id="umbrellaArc"
              d="M20,140 Q400,-20 780,140"
              fill="none"
            />
          </defs>
          {/* Shadow text for depth */}
          <text
            fontSize="42"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#000"
            opacity="0.08"
          >
            <textPath href="#umbrellaArc" startOffset="50%" textAnchor="middle">
              Where Learning and Growth Become One
            </textPath>
          </text>
          {/* Main curved text with animated rainbow gradient */}
          <text
            fontSize="42"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="url(#rainbowTextAnimated)"
          >
            <textPath href="#umbrellaArc" startOffset="50%" textAnchor="middle">
              Where Learning and Growth Become One
            </textPath>
          </text>
        </svg>
      </div>

      {/* Subtitle - centered under the arc */}
      <p className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 text-center -mt-4">
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

/* Detailed CGI-style character component for each life stage */
function Character({ stage, color }: { stage: number; color: string }) {
  const sizes = [0.7, 0.85, 1.0, 1.15, 1.3];
  const scale = sizes[stage];
  const s = stages[stage];
  const skinId = `skin-${stage}`;
  const shirtId = `shirt-${stage}`;
  const eyeWhite = stage === 4 ? '#F5E6D3' : '#FFFEF7';
  const irisColor = stage === 1 ? '#3B2314' : stage === 2 ? '#5B8C3E' : '#2C1608';
  const lipColor = stage === 4 ? '#8B3A3A' : stage === 2 ? '#D4837A' : '#B5555A';

  /* Baby / Infant - completely different crawling pose */
  if (stage === 0) {
    return (
      <g transform={`scale(${scale})`}>
        <defs>
          <radialGradient id={skinId} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={s.skinLight} />
            <stop offset="70%" stopColor={s.skin} />
            <stop offset="100%" stopColor={s.skinDark} />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="5" cy="38" rx="28" ry="5" fill="#000" opacity="0.1" />

        {/* Back leg (left, further away) */}
        <ellipse cx="-12" cy="28" rx="7" ry="9" fill={s.skin} transform="rotate(-20, -12, 28)" />
        <ellipse cx="-12" cy="28" rx="4" ry="6" fill={s.skinLight} opacity="0.3" transform="rotate(-20, -12, 28)" />
        {/* Back foot */}
        <ellipse cx="-16" cy="35" rx="5" ry="3.5" fill={s.skin} />
        <ellipse cx="-17" cy="34" rx="2" ry="1.5" fill={s.skinLight} opacity="0.3" />

        {/* Diaper / onesie body */}
        <ellipse cx="2" cy="15" rx="18" ry="14" fill={color} />
        {/* Onesie highlight */}
        <ellipse cx="-2" cy="10" rx="8" ry="8" fill="#FFF" opacity="0.1" />
        {/* Onesie snap buttons */}
        <circle cx="-3" cy="25" r="1.2" fill="#FFF" opacity="0.5" />
        <circle cx="2" cy="26" r="1.2" fill="#FFF" opacity="0.5" />
        <circle cx="7" cy="25" r="1.2" fill="#FFF" opacity="0.5" />
        {/* Diaper peek */}
        <ellipse cx="0" cy="24" rx="10" ry="6" fill="#FFF" opacity="0.3" />

        {/* Front leg (right, closer) */}
        <ellipse cx="14" cy="26" rx="7" ry="9" fill={s.skin} transform="rotate(15, 14, 26)" />
        <ellipse cx="14" cy="26" rx="4" ry="6" fill={s.skinLight} opacity="0.3" transform="rotate(15, 14, 26)" />
        {/* Front foot - chubby baby foot */}
        <ellipse cx="18" cy="34" rx="5" ry="3.5" fill={s.skin} />
        <ellipse cx="19" cy="33" rx="2" ry="1.5" fill={s.skinLight} opacity="0.3" />
        {/* Tiny toes */}
        <circle cx="22" cy="32" r="1.2" fill={s.skin} />
        <circle cx="23" cy="33.5" r="1" fill={s.skin} />

        {/* Back arm */}
        <ellipse cx="-14" cy="14" rx="5" ry="8" fill={s.skin} transform="rotate(30, -14, 14)" />
        {/* Back hand on ground */}
        <circle cx="-18" cy="22" r="4.5" fill={`url(#${skinId})`} />

        {/* Front arm */}
        <ellipse cx="16" cy="10" rx="5" ry="8" fill={s.skin} transform="rotate(-25, 16, 10)" />
        <ellipse cx="16" cy="10" rx="3" ry="5" fill={s.skinLight} opacity="0.25" transform="rotate(-25, 16, 10)" />
        {/* Front hand reaching forward */}
        <circle cx="22" cy="16" r="4.5" fill={`url(#${skinId})`} />
        {/* Baby fingers */}
        <circle cx="25" cy="14" r="1.5" fill={s.skin} />
        <circle cx="26" cy="16" r="1.3" fill={s.skin} />

        {/* Neck */}
        <rect x="-8" y="-4" width="10" height="8" rx="4" fill={s.skin} />

        {/* Head - proportionally larger for baby */}
        <circle cx="-4" cy="-16" r="20" fill={`url(#${skinId})`} />
        {/* Baby fat cheeks */}
        <ellipse cx="-14" cy="-10" rx="5" ry="4" fill={s.skin} />
        <ellipse cx="6" cy="-10" rx="5" ry="4" fill={s.skin} />

        {/* Ear */}
        <ellipse cx="-22" cy="-14" rx="4" ry="5" fill={s.skin} />
        <ellipse cx="-22" cy="-14" rx="2.5" ry="3.5" fill={s.skinDark} opacity="0.3" />
        <ellipse cx="14" cy="-14" rx="4" ry="5" fill={s.skin} />
        <ellipse cx="14" cy="-14" rx="2.5" ry="3.5" fill={s.skinDark} opacity="0.3" />

        {/* Baby hair - soft wispy tufts */}
        <ellipse cx="-4" cy="-32" rx="10" ry="6" fill={s.hair} />
        <circle cx="-10" cy="-30" r="4" fill={s.hair} />
        <circle cx="2" cy="-30" r="4" fill={s.hair} />
        <circle cx="-4" cy="-34" r="3.5" fill={s.hair} />
        <circle cx="-7" cy="-33" r="2.5" fill="#2A2A2A" opacity="0.4" />
        <circle cx="0" cy="-33" r="2.5" fill="#2A2A2A" opacity="0.4" />

        {/* Eyes - big baby eyes */}
        <ellipse cx="-9" cy="-18" rx="5" ry="4.5" fill="#FFFEF7" />
        <circle cx="-8" cy="-17" r="3.2" fill="#2C1608" />
        <circle cx="-8" cy="-17" r="1.8" fill="#111" />
        <circle cx="-7" cy="-18.5" r="1.2" fill="#FFF" />
        <circle cx="-9.5" cy="-16.5" r="0.5" fill="#FFF" opacity="0.6" />
        <ellipse cx="3" cy="-18" rx="5" ry="4.5" fill="#FFFEF7" />
        <circle cx="4" cy="-17" r="3.2" fill="#2C1608" />
        <circle cx="4" cy="-17" r="1.8" fill="#111" />
        <circle cx="5" cy="-18.5" r="1.2" fill="#FFF" />
        <circle cx="2.5" cy="-16.5" r="0.5" fill="#FFF" opacity="0.6" />

        {/* Tiny eyebrows */}
        <path d="M-13,-23 Q-9,-25 -5,-23" fill="none" stroke={s.hair} strokeWidth="1" strokeLinecap="round" />
        <path d="M-1,-23 Q3,-25 7,-23" fill="none" stroke={s.hair} strokeWidth="1" strokeLinecap="round" />

        {/* Button nose */}
        <ellipse cx="-3" cy="-11" rx="2.5" ry="2" fill={s.skinDark} opacity="0.25" />
        <ellipse cx="-3" cy="-12" rx="1.5" ry="1" fill={s.skinLight} opacity="0.3" />

        {/* Baby mouth - open smile */}
        <ellipse cx="-3" cy="-6" rx="4" ry="3" fill="#CC6666" opacity="0.6" />
        <ellipse cx="-3" cy="-7" rx="3" ry="1.5" fill="#FFF" opacity="0.4" />

        {/* Rosy cheeks */}
        <ellipse cx="-14" cy="-10" rx="4" ry="2.5" fill="#E88B8B" opacity="0.35" />
        <ellipse cx="8" cy="-10" rx="4" ry="2.5" fill="#E88B8B" opacity="0.35" />

        {/* Face highlight */}
        <ellipse cx="-6" cy="-24" rx="6" ry="3" fill="#FFF" opacity="0.08" />
      </g>
    );
  }

  return (
    <g transform={`scale(${scale})`}>
      <defs>
        {/* Skin gradient */}
        <radialGradient id={skinId} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={s.skinLight} />
          <stop offset="70%" stopColor={s.skin} />
          <stop offset="100%" stopColor={s.skinDark} />
        </radialGradient>
        {/* Shirt gradient */}
        <linearGradient id={shirtId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="0" cy="50" rx={14 * scale} ry={5} fill="#000" opacity="0.12" />

      {/* Graduate gown - rendered first so body overlaps correctly */}
      {stage === 4 && (
        <>
          {/* Full gown body */}
          <path d="M-16,-5 Q-18,20 -20,48 L20,48 Q18,20 16,-5 Z" fill="#1A1A1A" />
          {/* Gown shading */}
          <path d="M-16,-5 Q-18,20 -20,48 L-8,48 Q-6,20 -8,-2 Z" fill="#2A2A2A" opacity="0.4" />
          <path d="M8,-2 Q6,20 8,48 L20,48 Q18,20 16,-5 Z" fill="#111" opacity="0.3" />
          {/* Gown center fold */}
          <line x1="0" y1="0" x2="0" y2="46" stroke="#333" strokeWidth="1" opacity="0.3" />
          {/* Gown hem */}
          <path d="M-20,46 Q-10,50 0,46 Q10,50 20,46" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
          {/* Gown fabric folds */}
          <path d="M-10,10 Q-8,15 -10,20" fill="none" stroke="#333" strokeWidth="0.8" opacity="0.2" />
          <path d="M10,10 Q8,15 10,20" fill="none" stroke="#333" strokeWidth="0.8" opacity="0.2" />
          <path d="M-6,25 Q-4,30 -6,35" fill="none" stroke="#333" strokeWidth="0.8" opacity="0.15" />
          <path d="M6,25 Q4,30 6,35" fill="none" stroke="#333" strokeWidth="0.8" opacity="0.15" />
        </>
      )}

      {/* Legs - bare for stages 0-2, pants for stage 3, hidden for stage 4 (gown) */}
      {stage !== 4 && (
        <>
          {stage === 3 ? (
            <>
              {/* Jeans / pants */}
              <rect x="-11" y="27" width="10" height="21" rx="4" fill="#2C5282" />
              <rect x="-10" y="27" width="3" height="19" rx="2" fill="#3B6DAA" opacity="0.4" />
              <rect x="1" y="27" width="10" height="21" rx="4" fill="#2C5282" />
              <rect x="2" y="27" width="3" height="19" rx="2" fill="#3B6DAA" opacity="0.4" />
              {/* Pant seam lines */}
              <line x1="-6" y1="28" x2="-6" y2="47" stroke="#1E3A5F" strokeWidth="0.6" opacity="0.4" />
              <line x1="6" y1="28" x2="6" y2="47" stroke="#1E3A5F" strokeWidth="0.6" opacity="0.4" />
              {/* Pocket detail */}
              <path d="M-9,30 L-5,30 L-5,34" fill="none" stroke="#1E3A5F" strokeWidth="0.8" opacity="0.3" />
              <path d="M9,30 L5,30 L5,34" fill="none" stroke="#1E3A5F" strokeWidth="0.8" opacity="0.3" />
            </>
          ) : (
            <>
              {/* Bare skin legs */}
              <rect x="-10" y="28" width="8" height="20" rx="4" fill={s.skin} />
              <rect x="-9" y="28" width="3" height="18" rx="2" fill={s.skinLight} opacity="0.4" />
              <rect x="2" y="28" width="8" height="20" rx="4" fill={s.skin} />
              <rect x="3" y="28" width="3" height="18" rx="2" fill={s.skinLight} opacity="0.4" />
            </>
          )}
        </>
      )}

      {/* Shoes with detail */}
      <ellipse cx="-6" cy="49" rx="7" ry="4" fill={stage === 4 ? '#1A1A1A' : stage === 3 ? '#3E3E3E' : color} />
      <ellipse cx="-6" cy="48" rx="6" ry="3" fill={stage === 4 ? '#2A2A2A' : stage === 3 ? '#4E4E4E' : color} />
      <ellipse cx="-6" cy="47" rx="4" ry="1.5" fill="#FFF" opacity="0.15" />
      <ellipse cx="6" cy="49" rx="7" ry="4" fill={stage === 4 ? '#1A1A1A' : stage === 3 ? '#3E3E3E' : color} />
      <ellipse cx="6" cy="48" rx="6" ry="3" fill={stage === 4 ? '#2A2A2A' : stage === 3 ? '#4E4E4E' : color} />
      <ellipse cx="6" cy="47" rx="4" ry="1.5" fill="#FFF" opacity="0.15" />

      {/* Body / Shirt with folds (not for graduate - gown already rendered) */}
      {stage !== 4 ? (
        <>
          <rect x="-13" y="-5" width="26" height="36" rx="9" fill={`url(#${shirtId})`} />
          {/* Shirt collar */}
          <path d="M-5,-4 L0,2 L5,-4" fill="none" stroke={color} strokeWidth="2" opacity="0.6" />
          {/* Shirt highlight */}
          <rect x="-8" y="-2" width="6" height="20" rx="3" fill="#FFF" opacity="0.1" />
          {/* Shirt fold lines */}
          <path d="M-4,15 Q0,18 4,15" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.15" />
          <path d="M-3,22 Q0,24 3,22" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.1" />
          {/* Belt for school-age */}
          {stage === 3 && (
            <>
              <rect x="-13" y="25" width="26" height="4" rx="1" fill="#5D4037" />
              <rect x="-2" y="24.5" width="4" height="5" rx="1" fill="#8D6E63" />
            </>
          )}
        </>
      ) : (
        <>
          {/* Graduation gown neckline / V-collar */}
          <path d="M-10,-5 L0,8 L10,-5" fill="#222" stroke="#333" strokeWidth="0.8" />
          {/* White collar underneath */}
          <path d="M-7,-4 L0,4 L7,-4" fill="#F5F5F5" stroke="#DDD" strokeWidth="0.5" />
          {/* Gown sleeves */}
          <path d="M-16,-3 Q-22,8 -20,22" fill="#1A1A1A" stroke="#333" strokeWidth="0.5" />
          <path d="M16,-3 Q22,8 20,22" fill="#1A1A1A" stroke="#333" strokeWidth="0.5" />
        </>
      )}

      {/* Arms with hands */}
      {stage === 4 ? (
        <>
          {/* Gown sleeves with hands poking out */}
          <path d="M-16,-1 L-22,6 L-22,20 L-16,22 Z" fill="#1A1A1A" />
          <path d="M-20,8 L-19,16" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.3" />
          <circle cx="-16" cy="23" r="5" fill={`url(#${skinId})`} />
          <path d="M16,-1 L22,6 L22,20 L16,22 Z" fill="#1A1A1A" />
          <path d="M20,8 L19,16" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.3" />
          <circle cx="16" cy="23" r="5" fill={`url(#${skinId})`} />
        </>
      ) : (
        <>
          <rect x="-19" y="-1" width="9" height="22" rx="4.5" fill={s.skin} />
          <rect x="-17" y="0" width="3" height="18" rx="2" fill={s.skinLight} opacity="0.3" />
          <circle cx="-14.5" cy="22" r="5" fill={`url(#${skinId})`} />
          <rect x="10" y="-1" width="9" height="22" rx="4.5" fill={s.skin} />
          <rect x="12" y="0" width="3" height="18" rx="2" fill={s.skinLight} opacity="0.3" />
          <circle cx="14.5" cy="22" r="5" fill={`url(#${skinId})`} />
        </>
      )}

      {/* Neck */}
      <rect x="-4" y="-9" width="8" height="8" rx="3" fill={s.skin} />

      {/* Head with gradient */}
      <circle cx="0" cy="-22" r="18" fill={`url(#${skinId})`} />
      {/* Ear left */}
      <ellipse cx="-16" cy="-20" rx="4" ry="5" fill={s.skin} />
      <ellipse cx="-16" cy="-20" rx="2.5" ry="3.5" fill={s.skinDark} opacity="0.3" />
      {/* Ear right */}
      <ellipse cx="16" cy="-20" rx="4" ry="5" fill={s.skin} />
      <ellipse cx="16" cy="-20" rx="2.5" ry="3.5" fill={s.skinDark} opacity="0.3" />

      {/* Hair by stage and ethnicity */}
      {/* Stage 1: Asian toddler - straight black hair with bangs */}
      {stage === 1 && (
        <>
          <path d="M-16,-22 Q-16,-42 0,-42 Q16,-42 16,-22" fill={s.hair} />
          <rect x="-13" y="-36" width="26" height="10" rx="3" fill={s.hair} />
          {/* Bangs */}
          <path d="M-11,-30 L-11,-26" stroke={s.hair} strokeWidth="3" strokeLinecap="round" />
          <path d="M-7,-31 L-7,-26" stroke={s.hair} strokeWidth="3" strokeLinecap="round" />
          <path d="M-3,-31 L-3,-27" stroke={s.hair} strokeWidth="3" strokeLinecap="round" />
          <path d="M1,-31 L1,-27" stroke={s.hair} strokeWidth="3" strokeLinecap="round" />
          <path d="M5,-31 L5,-26" stroke={s.hair} strokeWidth="3" strokeLinecap="round" />
          <path d="M9,-30 L9,-26" stroke={s.hair} strokeWidth="3" strokeLinecap="round" />
          {/* Side hair */}
          <path d="M-16,-22 Q-18,-18 -16,-12" stroke={s.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M16,-22 Q18,-18 16,-12" stroke={s.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Hair shine */}
          <path d="M-6,-38 Q0,-40 6,-38" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.2" />
        </>
      )}
      {/* Stage 2: White preschooler - wavy auburn hair */}
      {stage === 2 && (
        <>
          <path d="M-16,-22 Q-16,-44 0,-44 Q16,-44 16,-22" fill={s.hair} />
          <path d="M-14,-22 Q-14,-40 0,-40 Q14,-40 14,-22" fill="#C76B2D" opacity="0.6" />
          {/* Wavy texture */}
          <path d="M-12,-34 Q-10,-38 -6,-34 Q-2,-30 2,-34 Q6,-38 10,-34" fill="none" stroke={s.hair} strokeWidth="3" />
          <path d="M-14,-28 Q-12,-32 -8,-28 Q-4,-24 0,-28 Q4,-32 8,-28 Q12,-24 14,-28" fill="none" stroke={s.hair} strokeWidth="2.5" />
          {/* Side waves */}
          <path d="M-16,-22 Q-19,-16 -17,-10 Q-15,-6 -16,-2" stroke={s.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M16,-22 Q19,-16 17,-10 Q15,-6 16,-2" stroke={s.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Hair shine */}
          <ellipse cx="-3" cy="-38" rx="5" ry="2" fill="#FFF" opacity="0.15" />
        </>
      )}
      {/* Stage 3: Brown school-age girl - braids */}
      {stage === 3 && (
        <>
          {/* Hair base on top of head */}
          <path d="M-16,-22 Q-16,-44 0,-44 Q16,-44 16,-22" fill={s.hair} />
          {/* Center part */}
          <line x1="0" y1="-42" x2="0" y2="-28" stroke={s.skinDark} strokeWidth="0.8" opacity="0.4" />
          {/* Left braid */}
          <path d="M-14,-24 Q-18,-18 -16,-10 Q-14,-2 -18,6 Q-16,14 -18,22" fill="none" stroke={s.hair} strokeWidth="5" strokeLinecap="round" />
          {/* Left braid texture - zigzag crossings */}
          <path d="M-16,-20 L-14,-18 L-18,-16 L-14,-14 L-18,-12 L-14,-10 L-18,-8 L-14,-6 L-18,-4 L-14,-2 L-18,0 L-14,2 L-18,4 L-16,6 L-18,8 L-16,10 L-18,12 L-16,14 L-18,16 L-16,18 L-18,20" fill="none" stroke={s.hair} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          {/* Left braid highlight */}
          <path d="M-15,-18 Q-17,-10 -15,-2 Q-17,6 -15,14" fill="none" stroke="#FFF" strokeWidth="0.8" opacity="0.12" />
          {/* Left braid bead */}
          <circle cx="-17" cy="22" r="3" fill="#F9A825" />
          <circle cx="-17" cy="22" r="1.5" fill="#FFF" opacity="0.3" />
          {/* Right braid */}
          <path d="M14,-24 Q18,-18 16,-10 Q14,-2 18,6 Q16,14 18,22" fill="none" stroke={s.hair} strokeWidth="5" strokeLinecap="round" />
          {/* Right braid texture */}
          <path d="M16,-20 L14,-18 L18,-16 L14,-14 L18,-12 L14,-10 L18,-8 L14,-6 L18,-4 L14,-2 L18,0 L14,2 L18,4 L16,6 L18,8 L16,10 L18,12 L16,14 L18,16 L16,18 L18,20" fill="none" stroke={s.hair} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          {/* Right braid highlight */}
          <path d="M15,-18 Q17,-10 15,-2 Q17,6 15,14" fill="none" stroke="#FFF" strokeWidth="0.8" opacity="0.12" />
          {/* Right braid bead */}
          <circle cx="17" cy="22" r="3" fill="#F9A825" />
          <circle cx="17" cy="22" r="1.5" fill="#FFF" opacity="0.3" />
          {/* Hair volume on top */}
          <circle cx="-8" cy="-38" r="4" fill={s.hair} />
          <circle cx="8" cy="-38" r="4" fill={s.hair} />
          <circle cx="0" cy="-40" r="4" fill={s.hair} />
          <circle cx="-4" cy="-39" r="3" fill="#3D2410" opacity="0.3" />
          <circle cx="4" cy="-39" r="3" fill="#3D2410" opacity="0.3" />
        </>
      )}
      {/* Stage 4: African graduate - tight curls with grad cap */}
      {stage === 4 && (
        <>
          <path d="M-15,-22 Q-15,-42 0,-42 Q15,-42 15,-22" fill={s.hair} />
          {/* Tight curl texture */}
          {[-10,-5,0,5,10].map((x) =>
            [-38,-34,-30].map((y) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="2.5" fill={s.hair} />
            ))
          )}
          <circle cx="-13" cy="-26" r="2.5" fill={s.hair} />
          <circle cx="13" cy="-26" r="2.5" fill={s.hair} />
          {/* Graduation cap */}
          <rect x="-20" y="-46" width="40" height="5" rx="1" fill="#1A1A1A" />
          <rect x="-12" y="-52" width="24" height="8" rx="2" fill="#1A1A1A" />
          {/* Cap detail - top button */}
          <circle cx="0" cy="-52" r="2" fill="#333" />
          {/* Tassel */}
          <line x1="0" y1="-52" x2="20" y2="-46" stroke="#F9A825" strokeWidth="1.5" />
          <line x1="20" y1="-46" x2="22" y2="-36" stroke="#F9A825" strokeWidth="2" />
          <circle cx="22" cy="-35" r="3" fill="#F9A825" />
          {/* Cap shine */}
          <rect x="-8" y="-50" width="10" height="2" rx="1" fill="#FFF" opacity="0.1" />
        </>
      )}

      {/* Eyebrows */}
      <path d={`M-8,-28 Q-5,-${stage === 1 ? 30 : 31} -2,-28`} fill="none" stroke={s.hair} strokeWidth="1.5" strokeLinecap="round" />
      <path d={`M2,-28 Q5,-${stage === 1 ? 30 : 31} 8,-28`} fill="none" stroke={s.hair} strokeWidth="1.5" strokeLinecap="round" />

      {/* Eyes - detailed with iris, pupil, lashes */}
      {/* Left eye */}
      <ellipse cx="-6" cy="-22" rx="4" ry="3.5" fill={eyeWhite} />
      <circle cx="-5.5" cy="-21.5" r="2.5" fill={irisColor} />
      <circle cx="-5.5" cy="-21.5" r="1.3" fill="#111" />
      <circle cx="-4.5" cy="-22.5" r="0.8" fill="#FFF" />
      <circle cx="-6.5" cy="-21" r="0.4" fill="#FFF" opacity="0.6" />
      {/* Left lashes */}
      <path d="M-10,-23 L-9.5,-25" stroke={s.hair} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M-8,-24.5 L-8,-26.5" stroke={s.hair} strokeWidth="0.8" strokeLinecap="round" />
      {/* Right eye */}
      <ellipse cx="6" cy="-22" rx="4" ry="3.5" fill={eyeWhite} />
      <circle cx="5.5" cy="-21.5" r="2.5" fill={irisColor} />
      <circle cx="5.5" cy="-21.5" r="1.3" fill="#111" />
      <circle cx="6.5" cy="-22.5" r="0.8" fill="#FFF" />
      <circle cx="4.5" cy="-21" r="0.4" fill="#FFF" opacity="0.6" />
      {/* Right lashes */}
      <path d="M10,-23 L9.5,-25" stroke={s.hair} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M8,-24.5 L8,-26.5" stroke={s.hair} strokeWidth="0.8" strokeLinecap="round" />

      {/* Nose */}
      <path d="M-1,-16 Q0,-14 1,-16" fill="none" stroke={s.skinDark} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <circle cx="-1.5" cy="-15" r="0.8" fill={s.skinDark} opacity="0.25" />
      <circle cx="1.5" cy="-15" r="0.8" fill={s.skinDark} opacity="0.25" />

      {/* Mouth / Lips */}
      <path d="M-4,-11 Q-2,-9 0,-10 Q2,-9 4,-11" fill={lipColor} opacity="0.7" />
      <path d="M-3.5,-11 Q0,-8 3.5,-11" fill="none" stroke={lipColor} strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      {/* Cheek blush */}
      <ellipse cx="-10" cy="-16" rx="3.5" ry="2" fill="#E88B8B" opacity={stage === 2 ? 0.35 : 0.2} />
      <ellipse cx="10" cy="-16" rx="3.5" ry="2" fill="#E88B8B" opacity={stage === 2 ? 0.35 : 0.2} />

      {/* Face highlight */}
      <ellipse cx="-3" cy="-26" rx="5" ry="3" fill="#FFF" opacity="0.08" />

      {/* Stage-specific accessories */}
      {/* Preschooler: backpack strap + lunchbox */}
      {stage === 2 && (
        <>
          <rect x="-20" y="2" width="8" height="14" rx="3" fill="#C62828" />
          <rect x="-19" y="3" width="6" height="3" rx="1" fill="#E53935" />
          <path d="M-13,0 L-13,5" stroke="#F9A825" strokeWidth="1.5" />
          <path d="M13,0 L13,5" stroke="#F9A825" strokeWidth="1.5" />
        </>
      )}
      {/* School-age: backpack */}
      {stage === 3 && (
        <>
          <rect x="12" y="0" width="14" height="20" rx="4" fill="#C62828" />
          <rect x="13" y="1" width="12" height="8" rx="2" fill="#E53935" />
          <rect x="17" y="10" width="4" height="5" rx="1" fill="#B71C1C" />
          <path d="M14,0 L14,-3 Q14,-5 16,-5 L16,0" fill="none" stroke="#8B1A1A" strokeWidth="1.5" />
        </>
      )}
      {/* Graduate: diploma in hand */}
      {stage === 4 && (
        <g transform="rotate(-15, 20, 5)">
          <rect x="16" y="-2" width="12" height="5" rx="2.5" fill="#FFF5E1" />
          <rect x="16" y="-2" width="12" height="5" rx="2.5" fill="none" stroke="#D4A55A" strokeWidth="0.8" />
          <rect x="20" y="-3" width="4" height="7" rx="0.5" fill="#C62828" opacity="0.8" />
        </g>
      )}
    </g>
  );
}
