'use client';

import { useState, useEffect } from 'react';

const stages = [
  { label: 'Infant', color: '#5BA3E6', skin: '#8D5524', skinLight: '#A0693A', skinMid: '#996040', skinDark: '#7A4518', hair: '#1A1A1A', hairHighlight: '#3A3A3A', hairStyle: 'curly' },
  { label: 'Toddler', color: '#E91E63', skin: '#F1C27D', skinLight: '#FDDAA0', skinMid: '#E8B86D', skinDark: '#D4A55A', hair: '#0D0D0D', hairHighlight: '#2D2D2D', hairStyle: 'straight' },
  { label: 'Preschool', color: '#43A047', skin: '#FDDBB4', skinLight: '#FEE8CC', skinMid: '#F5D0A0', skinDark: '#E8C9A0', hair: '#B5651D', hairHighlight: '#D4863A', hairStyle: 'wavy' },
  { label: 'School Age', color: '#7B1FA2', skin: '#C68642', skinLight: '#D4975A', skinMid: '#B87535', skinDark: '#A96B2F', hair: '#2C1608', hairHighlight: '#4A2A15', hairStyle: 'curly' },
  { label: 'College', color: '#C62828', skin: '#4A2912', skinLight: '#5E3A1E', skinMid: '#3D2010', skinDark: '#3B1E0A', hair: '#0D0D0D', hairHighlight: '#1D1D1D', hairStyle: 'tight' },
];

/* Vertical spiral positions - bottom to top, alternating left/right */
/* Adjusted: Infant at true bottom, Graduate lowered for headroom */
const spiralPoints = [
  { x: 400, y: 390 },  // Infant - bottom center (at daycare)
  { x: 520, y: 320 },  // Toddler - right
  { x: 280, y: 250 },  // Preschool - left
  { x: 520, y: 180 },  // School Age - right
  { x: 400, y: 110 },  // College - center (lowered from 60 to 110)
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [rotation, setRotation] = useState(0);

  /* Animation cycle for stages */
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

  /* Continuous spiral rotation animation */
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(rotationInterval);
  }, []);

  const currentStage = stages[activeIndex];
  const currentPos = spiralPoints[activeIndex];

  /* Spiral path - adjusted to start from daycare at bottom */
  const spiralPath = `M400,420
     C600,420 620,380 540,350
     C460,320 240,320 260,280
     C280,240 560,240 540,200
     C520,160 280,160 280,120
     C280,80 360,60 400,50`;

  return (
    <div className="relative min-h-[620px] md:min-h-[720px] overflow-hidden bg-gradient-to-br from-amber-50 via-white to-sky-50 flex flex-col items-center justify-center px-4 py-8">

      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-80 h-80 rounded-full opacity-20 animate-float-slow" style={{ background: 'radial-gradient(circle, #E91E63 0%, transparent 70%)', left: '5%', top: '10%' }} />
        <div className="absolute w-64 h-64 rounded-full opacity-15 animate-float-medium" style={{ background: 'radial-gradient(circle, #43A047 0%, transparent 70%)', right: '10%', top: '20%' }} />
        <div className="absolute w-72 h-72 rounded-full opacity-10 animate-float-fast" style={{ background: 'radial-gradient(circle, #5BA3E6 0%, transparent 70%)', left: '30%', bottom: '5%' }} />
      </div>

      {/* Curved Rainbow Tagline */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mb-0">
        <svg viewBox="0 0 800 160" className="w-full h-auto" role="heading" aria-level={1} aria-label="Where Learning and Growth Become One">
          <defs>
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
            <path id="umbrellaArc" d="M20,140 Q400,-20 780,140" fill="none" />
          </defs>
          <text fontSize="42" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif" fill="#000" opacity="0.08">
            <textPath href="#umbrellaArc" startOffset="50%" textAnchor="middle">
              Where Learning and Growth Become One
            </textPath>
          </text>
          <text fontSize="42" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif" fill="url(#rainbowTextAnimated)">
            <textPath href="#umbrellaArc" startOffset="50%" textAnchor="middle">
              Where Learning and Growth Become One
            </textPath>
          </text>
        </svg>
      </div>

      {/* Subtitle */}
      <p className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 text-center -mt-4">
        Christina&apos;s Child Care Center
      </p>

      {/* Animation Canvas - Vertical Spiral Journey */}
      <div className="relative z-10 w-full max-w-3xl mt-4">
        <svg viewBox="0 0 800 480" className="w-full h-auto" role="img" aria-label={`Child at ${currentStage.label} stage`}>
          <defs>
            {/* Filters for effects */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="spiralGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softShadow">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
            </filter>

            {/* Main spiral gradient - base color */}
            <linearGradient id="spiralBaseGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8B0000" />
              <stop offset="25%" stopColor="#B71C1C" />
              <stop offset="50%" stopColor="#C62828" />
              <stop offset="75%" stopColor="#D32F2F" />
              <stop offset="100%" stopColor="#E53935" />
            </linearGradient>

            {/* Fiber strand gradients - darker fibers */}
            <linearGradient id="fiberDark" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#5D0F0F" />
              <stop offset="50%" stopColor="#7B1818" />
              <stop offset="100%" stopColor="#8B0000" />
            </linearGradient>

            {/* Fiber strand gradients - lighter fibers */}
            <linearGradient id="fiberLight" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#D32F2F" />
              <stop offset="50%" stopColor="#E53935" />
              <stop offset="100%" stopColor="#EF5350" />
            </linearGradient>

            {/* Animated pulse for fibers */}
            <linearGradient id="fiberPulse" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF5350" stopOpacity="0">
                <animate attributeName="offset" values="0;1;0" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="20%" stopColor="#EF5350" stopOpacity="0.8">
                <animate attributeName="offset" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="40%" stopColor="#C62828" stopOpacity="0">
                <animate attributeName="offset" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Soft red ambient glow */}
            <radialGradient id="spiralAmbientGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C62828" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C62828" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle ambient glow behind spiral */}
          <ellipse cx="400" cy="240" rx="160" ry="220" fill="url(#spiralAmbientGlow)" opacity="0.6" />

          {/* ====== CARTOON DAYCARE BUILDING AT BOTTOM ====== */}
          <g transform="translate(400, 450)">
            {/* Ground/grass */}
            <ellipse cx="0" cy="20" rx="120" ry="15" fill="#4CAF50" opacity="0.6" />
            <ellipse cx="0" cy="18" rx="100" ry="10" fill="#66BB6A" opacity="0.5" />

            {/* Building shadow */}
            <rect x="-75" y="5" width="150" height="10" rx="5" fill="#000" opacity="0.1" />

            {/* Main building body */}
            <rect x="-70" y="-60" width="140" height="70" rx="8" fill="#FFF8E1" stroke="#F9A825" strokeWidth="2" />

            {/* Roof */}
            <path d="M-80,-55 L0,-85 L80,-55" fill="#C62828" stroke="#B71C1C" strokeWidth="2" />
            <path d="M-75,-55 L0,-82 L75,-55" fill="#E53935" />

            {/* Roof shingle texture */}
            <path d="M-60,-65 L0,-80 L60,-65" fill="none" stroke="#B71C1C" strokeWidth="1" opacity="0.5" />
            <path d="M-40,-60 L0,-70 L40,-60" fill="none" stroke="#B71C1C" strokeWidth="1" opacity="0.3" />

            {/* Door */}
            <rect x="-15" y="-35" width="30" height="42" rx="4" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
            <rect x="-12" y="-32" width="24" height="35" rx="2" fill="#A1887F" />
            <circle cx="8" cy="-15" r="3" fill="#F9A825" />

            {/* Windows */}
            <g transform="translate(-45, -40)">
              <rect x="0" y="0" width="22" height="22" rx="3" fill="#81D4FA" stroke="#FFF" strokeWidth="2" />
              <line x1="11" y1="0" x2="11" y2="22" stroke="#FFF" strokeWidth="1.5" />
              <line x1="0" y1="11" x2="22" y2="11" stroke="#FFF" strokeWidth="1.5" />
              <rect x="2" y="2" width="8" height="8" fill="#E3F2FD" opacity="0.5" />
            </g>
            <g transform="translate(23, -40)">
              <rect x="0" y="0" width="22" height="22" rx="3" fill="#81D4FA" stroke="#FFF" strokeWidth="2" />
              <line x1="11" y1="0" x2="11" y2="22" stroke="#FFF" strokeWidth="1.5" />
              <line x1="0" y1="11" x2="22" y2="11" stroke="#FFF" strokeWidth="1.5" />
              <rect x="2" y="2" width="8" height="8" fill="#E3F2FD" opacity="0.5" />
            </g>

            {/* Sign */}
            <rect x="-50" y="-95" width="100" height="18" rx="4" fill="#C62828" stroke="#B71C1C" strokeWidth="1" />
            <text x="0" y="-82" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold" fontFamily="system-ui">Christina&apos;s Child Care</text>

            {/* Decorative elements */}
            {/* Flowers */}
            <g transform="translate(-55, 0)">
              <circle cx="0" cy="0" r="4" fill="#E91E63" />
              <circle cx="0" cy="0" r="2" fill="#F9A825" />
              <line x1="0" y1="4" x2="0" y2="12" stroke="#4CAF50" strokeWidth="2" />
            </g>
            <g transform="translate(55, 0)">
              <circle cx="0" cy="0" r="4" fill="#9C27B0" />
              <circle cx="0" cy="0" r="2" fill="#FFF" />
              <line x1="0" y1="4" x2="0" y2="12" stroke="#4CAF50" strokeWidth="2" />
            </g>

            {/* Sun peeking from behind */}
            <circle cx="70" cy="-75" r="15" fill="#F9A825" opacity="0.8" />
            <circle cx="70" cy="-75" r="12" fill="#FFEB3B" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1={70 + Math.cos(angle * Math.PI / 180) * 18}
                y1={-75 + Math.sin(angle * Math.PI / 180) * 18}
                x2={70 + Math.cos(angle * Math.PI / 180) * 24}
                y2={-75 + Math.sin(angle * Math.PI / 180) * 24}
                stroke="#F9A825"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* ====== FIBER-TEXTURED SPIRAL ====== */}
          {/* Shadow layer for depth */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#3D0808"
            strokeWidth="26"
            strokeLinecap="round"
            opacity="0.2"
            transform="translate(3, 5)"
          />

          {/* Main spiral body - base layer */}
          <path
            d={spiralPath}
            fill="none"
            stroke="url(#spiralBaseGradient)"
            strokeWidth="22"
            strokeLinecap="round"
            filter="url(#spiralGlow)"
          />

          {/* Fiber strands - dark fibers (left edge) */}
          <path
            d={spiralPath}
            fill="none"
            stroke="url(#fiberDark)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray="2 6"
            opacity="0.7"
            className="animate-fiber-flow-1"
          />

          {/* Fiber strands - medium dark */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#8B0000"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="4 8"
            opacity="0.5"
            className="animate-fiber-flow-2"
          />

          {/* Fiber strands - core fibers */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#A31515"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="6 10"
            opacity="0.6"
            className="animate-fiber-flow-3"
          />

          {/* Fiber strands - lighter inner fibers */}
          <path
            d={spiralPath}
            fill="none"
            stroke="url(#fiberLight)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="8 14"
            opacity="0.5"
            className="animate-fiber-flow-4"
          />

          {/* Fiber strands - highlight fibers */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#EF5350"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="12 20"
            opacity="0.4"
            className="animate-fiber-flow-5"
          />

          {/* Animated pulse traveling up */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#FF8A80"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="30 200"
            opacity="0.6"
            className="animate-pulse-travel"
          />

          {/* Second pulse wave - offset */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#FFCDD2"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="20 210"
            opacity="0.4"
            className="animate-pulse-travel-2"
          />

          {/* Floating particles along spiral - all red shades */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const progress = ((rotation + i * 36) % 360) / 360;
            const y = 420 - progress * 370;
            const xOffset = Math.sin(progress * Math.PI * 4) * 110;
            const redShades = ['#EF5350', '#E53935', '#D32F2F', '#C62828', '#B71C1C', '#9A1515', '#8B0000', '#7B1818', '#C62828', '#D32F2F'];
            return (
              <circle
                key={i}
                cx={400 + xOffset}
                cy={y}
                r={2 + progress * 1.5}
                fill={redShades[i]}
                opacity={0.3 + progress * 0.4}
              >
                <animate
                  attributeName="r"
                  values={`${2 + progress};${3.5 + progress};${2 + progress}`}
                  dur="1.2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.12}s`}
                />
              </circle>
            );
          })}

          {/* Milestone markers with labels */}
          {spiralPoints.map((point, i) => {
            const isReached = i <= activeIndex;
            const isCurrent = i === activeIndex;
            // Skip rendering marker for infant (it's at the daycare)
            if (i === 0) return null;
            return (
              <g key={i}>
                {/* Glow behind marker */}
                {isCurrent && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="25"
                    fill={stages[i].color}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}
                {/* Marker circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isCurrent ? 14 : 10}
                  fill={isReached ? stages[i].color : '#DDD'}
                  stroke="#FFF"
                  strokeWidth="3"
                  className={isCurrent ? 'animate-bounce-subtle' : ''}
                />
                {/* Ping effect for current */}
                {isCurrent && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="14"
                    fill="none"
                    stroke={stages[i].color}
                    strokeWidth="2"
                    className="animate-ping-slow"
                  />
                )}
                {/* Label */}
                <text
                  x={point.x}
                  y={point.y + 28}
                  textAnchor="middle"
                  fill={isReached ? '#333' : '#AAA'}
                  fontSize="14"
                  fontWeight={isCurrent ? '700' : '500'}
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
              transform: `translate(${currentPos.x}px, ${currentPos.y - 50}px)`,
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <PixarCharacter stage={activeIndex} color={currentStage.color} />
          </g>

          {/* Sparkles around current position - red tones */}
          {isVisible && (
            <g className="animate-sparkle">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const sparkleReds = ['#EF5350', '#E53935', '#D32F2F', '#C62828', '#B71C1C', '#E53935', '#D32F2F', '#EF5350'];
                return (
                  <g key={i}>
                    <circle
                      cx={currentPos.x + Math.cos((angle + rotation) * Math.PI / 180) * 55}
                      cy={currentPos.y - 50 + Math.sin((angle + rotation) * Math.PI / 180) * 35}
                      r="3"
                      fill={sparkleReds[i]}
                      opacity={0.7}
                    />
                    <circle
                      cx={currentPos.x + Math.cos((angle + rotation + 180) * Math.PI / 180) * 40}
                      cy={currentPos.y - 50 + Math.sin((angle + rotation + 180) * Math.PI / 180) * 25}
                      r="2"
                      fill={sparkleReds[(i + 4) % 8]}
                      opacity={0.5}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Upward arrow at top indicating growth */}
          <g transform="translate(400, 25)">
            <path
              d="M0,15 L-10,25 L-5,25 L-5,35 L5,35 L5,25 L10,25 Z"
              fill="#C62828"
              opacity="0.6"
              className="animate-float-up"
            />
          </g>
        </svg>
      </div>

      {/* Location */}
      <p className="relative z-10 mt-4 text-sm text-gray-500">
        Crystal, MN &bull; Licensed by Minnesota DCYF
      </p>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fiber-flow-1 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -32; }
        }
        @keyframes fiber-flow-2 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -48; }
        }
        @keyframes fiber-flow-3 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -64; }
        }
        @keyframes fiber-flow-4 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -88; }
        }
        @keyframes fiber-flow-5 {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -128; }
        }
        @keyframes pulse-travel {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -460; }
        }
        .animate-fiber-flow-1 {
          animation: fiber-flow-1 1.5s linear infinite;
        }
        .animate-fiber-flow-2 {
          animation: fiber-flow-2 1.8s linear infinite;
        }
        .animate-fiber-flow-3 {
          animation: fiber-flow-3 2.1s linear infinite;
        }
        .animate-fiber-flow-4 {
          animation: fiber-flow-4 2.5s linear infinite;
        }
        .animate-fiber-flow-5 {
          animation: fiber-flow-5 3s linear infinite;
        }
        .animate-pulse-travel {
          animation: pulse-travel 3s ease-in-out infinite;
        }
        .animate-pulse-travel-2 {
          animation: pulse-travel 3s ease-in-out infinite 1.5s;
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
        .animate-float-up {
          animation: floatUp 1.5s ease-in-out infinite;
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        .animate-ping-slow {
          animation: ping 1.5s ease-out infinite;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 1s ease-in-out infinite;
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-sparkle {
          animation: sparkle 0.8s ease-out;
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.7; transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

/* ============================================
   PIXAR-STYLE CHARACTER COMPONENT
   Features: Subsurface scattering, rim lighting,
   ambient occlusion, detailed features
   ============================================ */
function PixarCharacter({ stage, color }: { stage: number; color: string }) {
  const sizes = [0.65, 0.75, 0.88, 1.0, 1.1];
  const scale = sizes[stage];
  const s = stages[stage];

  // Unique IDs for this character's gradients
  const skinId = `pixar-skin-${stage}`;
  const skinSubsurfaceId = `pixar-subsurface-${stage}`;
  const rimLightId = `pixar-rim-${stage}`;
  const eyeGradientId = `pixar-eye-${stage}`;
  const shirtId = `pixar-shirt-${stage}`;
  const aoId = `pixar-ao-${stage}`;

  // Eye colors by stage
  const eyeColors = ['#3B2314', '#3B2314', '#5B8C3E', '#2C1608', '#2C1608'];
  const irisColor = eyeColors[stage];

  // Lip colors by stage
  const lipColors = ['#CC8080', '#D4837A', '#D4837A', '#B5555A', '#8B3A3A'];
  const lipColor = lipColors[stage];

  return (
    <g transform={`translate(0, 0) scale(${scale})`}>
      <defs>
        {/* Subsurface scattering skin gradient - gives that Pixar translucent skin look */}
        <radialGradient id={skinId} cx="35%" cy="30%" r="65%" fx="25%" fy="20%">
          <stop offset="0%" stopColor={s.skinLight} />
          <stop offset="40%" stopColor={s.skin} />
          <stop offset="80%" stopColor={s.skinMid} />
          <stop offset="100%" stopColor={s.skinDark} />
        </radialGradient>

        {/* Subsurface red tint for cheeks/nose - simulates blood under skin */}
        <radialGradient id={skinSubsurfaceId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFAAAA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFAAAA" stopOpacity="0" />
        </radialGradient>

        {/* Rim light gradient - edge lighting effect */}
        <linearGradient id={rimLightId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0" />
          <stop offset="85%" stopColor="#FFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFF" stopOpacity="0.3" />
        </linearGradient>

        {/* Eye gradient for realistic eye */}
        <radialGradient id={eyeGradientId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </radialGradient>

        {/* Shirt fabric gradient */}
        <linearGradient id={shirtId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="30%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>

        {/* Ambient occlusion shadow */}
        <radialGradient id={aoId} cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* Soft shadow filter */}
        <filter id={`shadow-${stage}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ground shadow - soft and realistic */}
      <ellipse cx="0" cy="55" rx={18 * scale} ry={6} fill="#000" opacity="0.15" />
      <ellipse cx="0" cy="55" rx={12 * scale} ry={4} fill="#000" opacity="0.1" />

      {/* ====== INFANT - Crawling baby ====== */}
      {stage === 0 && (
        <g>
          {/* Back leg */}
          <ellipse cx="-15" cy="30" rx="10" ry="12" fill={`url(#${skinId})`} transform="rotate(-15, -15, 30)" />
          <ellipse cx="-18" cy="38" rx="7" ry="5" fill={`url(#${skinId})`} /> {/* foot */}

          {/* Onesie body */}
          <ellipse cx="0" cy="18" rx="22" ry="18" fill={color} />
          <ellipse cx="-5" cy="12" rx="12" ry="10" fill="#FFF" opacity="0.08" /> {/* highlight */}
          {/* Snap buttons */}
          <circle cx="-4" cy="32" r="1.5" fill="#FFF" opacity="0.6" />
          <circle cx="2" cy="33" r="1.5" fill="#FFF" opacity="0.6" />
          <circle cx="8" cy="32" r="1.5" fill="#FFF" opacity="0.6" />

          {/* Front leg */}
          <ellipse cx="18" cy="28" rx="10" ry="12" fill={`url(#${skinId})`} transform="rotate(20, 18, 28)" />
          {/* Chubby baby foot with toes */}
          <ellipse cx="24" cy="38" rx="8" ry="5" fill={`url(#${skinId})`} />
          <circle cx="30" cy="36" r="2" fill={s.skin} />
          <circle cx="31" cy="38" r="1.8" fill={s.skin} />
          <circle cx="31" cy="40" r="1.5" fill={s.skin} />

          {/* Back arm */}
          <ellipse cx="-18" cy="12" rx="7" ry="10" fill={`url(#${skinId})`} transform="rotate(25, -18, 12)" />
          {/* Back hand with fingers */}
          <circle cx="-24" cy="22" r="6" fill={`url(#${skinId})`} />
          <ellipse cx="-28" cy="18" rx="2" ry="3" fill={s.skin} transform="rotate(-20, -28, 18)" />
          <ellipse cx="-30" cy="21" rx="1.8" ry="2.5" fill={s.skin} transform="rotate(-10, -30, 21)" />

          {/* Front arm */}
          <ellipse cx="20" cy="8" rx="7" ry="10" fill={`url(#${skinId})`} transform="rotate(-30, 20, 8)" />
          <ellipse cx="20" cy="8" rx="4" ry="6" fill={s.skinLight} opacity="0.2" transform="rotate(-30, 20, 8)" />
          {/* Front hand reaching */}
          <circle cx="28" cy="14" r="6" fill={`url(#${skinId})`} />
          {/* Detailed baby fingers */}
          <ellipse cx="33" cy="10" rx="2" ry="3" fill={s.skin} transform="rotate(20, 33, 10)" />
          <ellipse cx="35" cy="13" rx="1.8" ry="2.8" fill={s.skin} transform="rotate(30, 35, 13)" />
          <ellipse cx="35" cy="17" rx="1.6" ry="2.5" fill={s.skin} transform="rotate(40, 35, 17)" />

          {/* Neck */}
          <ellipse cx="-6" cy="-4" rx="8" ry="6" fill={`url(#${skinId})`} />

          {/* Head - large baby proportions */}
          <circle cx="-4" cy="-22" r="24" fill={`url(#${skinId})`} />
          {/* Rim light on head */}
          <circle cx="-4" cy="-22" r="23" fill={`url(#${rimLightId})`} />

          {/* Baby cheeks - subsurface scattering */}
          <ellipse cx="-18" cy="-14" rx="8" ry="6" fill={`url(#${skinSubsurfaceId})`} />
          <ellipse cx="10" cy="-14" rx="8" ry="6" fill={`url(#${skinSubsurfaceId})`} />

          {/* Ears with detail */}
          <ellipse cx="-26" cy="-18" rx="5" ry="6" fill={`url(#${skinId})`} />
          <ellipse cx="-26" cy="-18" rx="3" ry="4" fill={s.skinDark} opacity="0.2" />
          <ellipse cx="18" cy="-18" rx="5" ry="6" fill={`url(#${skinId})`} />
          <ellipse cx="18" cy="-18" rx="3" ry="4" fill={s.skinDark} opacity="0.2" />

          {/* Baby hair - soft curly tufts */}
          <ellipse cx="-4" cy="-42" rx="14" ry="8" fill={s.hair} />
          <circle cx="-14" cy="-40" r="5" fill={s.hair} />
          <circle cx="6" cy="-40" r="5" fill={s.hair} />
          <circle cx="-4" cy="-46" r="4" fill={s.hair} />
          {/* Hair highlights */}
          <circle cx="-8" cy="-44" r="2" fill={s.hairHighlight} opacity="0.5" />
          <circle cx="2" cy="-44" r="2" fill={s.hairHighlight} opacity="0.5" />

          {/* Big baby eyes - Pixar style */}
          {/* Left eye */}
          <ellipse cx="-12" cy="-24" rx="7" ry="6" fill={`url(#${eyeGradientId})`} />
          <ellipse cx="-12" cy="-24" rx="6.5" ry="5.5" fill="none" stroke="#DDD" strokeWidth="0.5" />
          <circle cx="-10" cy="-23" r="4" fill={irisColor} />
          <circle cx="-10" cy="-23" r="2.2" fill="#111" />
          {/* Eye reflections - key to Pixar look */}
          <circle cx="-8" cy="-25" r="1.5" fill="#FFF" />
          <circle cx="-11" cy="-22" r="0.8" fill="#FFF" opacity="0.7" />
          {/* Upper eyelid shadow */}
          <path d="M-18,-26 Q-12,-28 -6,-26" fill="none" stroke={s.skinDark} strokeWidth="1" opacity="0.3" />

          {/* Right eye */}
          <ellipse cx="6" cy="-24" rx="7" ry="6" fill={`url(#${eyeGradientId})`} />
          <ellipse cx="6" cy="-24" rx="6.5" ry="5.5" fill="none" stroke="#DDD" strokeWidth="0.5" />
          <circle cx="8" cy="-23" r="4" fill={irisColor} />
          <circle cx="8" cy="-23" r="2.2" fill="#111" />
          <circle cx="10" cy="-25" r="1.5" fill="#FFF" />
          <circle cx="7" cy="-22" r="0.8" fill="#FFF" opacity="0.7" />
          <path d="M0,-26 Q6,-28 12,-26" fill="none" stroke={s.skinDark} strokeWidth="1" opacity="0.3" />

          {/* Tiny eyebrows */}
          <path d="M-17,-30 Q-12,-32 -7,-30" fill="none" stroke={s.hair} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1,-30 Q6,-32 11,-30" fill="none" stroke={s.hair} strokeWidth="1.5" strokeLinecap="round" />

          {/* Button nose with highlight */}
          <ellipse cx="-3" cy="-14" rx="4" ry="3" fill={s.skinMid} opacity="0.4" />
          <ellipse cx="-4" cy="-15" rx="2" ry="1.5" fill={s.skinLight} opacity="0.4" />

          {/* Baby smile */}
          <path d="M-10,-8 Q-3,-4 4,-8" fill="#CC6666" opacity="0.5" />
          <path d="M-8,-8 Q-3,-5 2,-8" fill="#FFF" opacity="0.3" />

          {/* Rosy cheeks - stronger subsurface */}
          <ellipse cx="-18" cy="-14" rx="5" ry="3" fill="#E88B8B" opacity="0.4" />
          <ellipse cx="12" cy="-14" rx="5" ry="3" fill="#E88B8B" opacity="0.4" />

          {/* Face highlight - top of forehead */}
          <ellipse cx="-4" cy="-34" rx="8" ry="4" fill="#FFF" opacity="0.1" />
        </g>
      )}

      {/* ====== TODDLER through GRADUATE - Standing poses ====== */}
      {stage > 0 && (
        <g>
          {/* Graduate gown - rendered first */}
          {stage === 4 && (
            <>
              <path d="M-20,-8 Q-24,20 -26,52 L26,52 Q24,20 20,-8 Z" fill="#1A1A1A" />
              <path d="M-20,-8 Q-24,20 -26,52 L-10,52 Q-8,20 -10,-2 Z" fill="#2A2A2A" opacity="0.3" />
              <path d="M10,-2 Q8,20 10,52 L26,52 Q24,20 20,-8 Z" fill="#0D0D0D" opacity="0.3" />
              {/* Gown folds */}
              <path d="M-12,15 Q-10,25 -12,35" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />
              <path d="M12,15 Q10,25 12,35" fill="none" stroke="#333" strokeWidth="1" opacity="0.3" />
              <path d="M0,5 L0,50" stroke="#222" strokeWidth="1" opacity="0.2" />
            </>
          )}

          {/* Legs */}
          {stage !== 4 && (
            <>
              {stage === 3 ? (
                // Jeans for school-age
                <>
                  <rect x="-14" y="28" width="12" height="24" rx="5" fill="#2C5282" />
                  <rect x="-13" y="29" width="4" height="20" rx="2" fill="#3B6DAA" opacity="0.3" />
                  <rect x="2" y="28" width="12" height="24" rx="5" fill="#2C5282" />
                  <rect x="3" y="29" width="4" height="20" rx="2" fill="#3B6DAA" opacity="0.3" />
                  {/* Seams */}
                  <line x1="-8" y1="30" x2="-8" y2="50" stroke="#1E3A5F" strokeWidth="0.8" opacity="0.4" />
                  <line x1="8" y1="30" x2="8" y2="50" stroke="#1E3A5F" strokeWidth="0.8" opacity="0.4" />
                </>
              ) : (
                // Bare legs for toddler/preschool
                <>
                  <rect x="-12" y="30" width="10" height="22" rx="5" fill={`url(#${skinId})`} />
                  <rect x="-11" y="31" width="4" height="18" rx="2" fill={s.skinLight} opacity="0.3" />
                  <rect x="2" y="30" width="10" height="22" rx="5" fill={`url(#${skinId})`} />
                  <rect x="3" y="31" width="4" height="18" rx="2" fill={s.skinLight} opacity="0.3" />
                </>
              )}
            </>
          )}

          {/* Shoes */}
          <ellipse cx="-7" cy="53" rx="9" ry="5" fill={stage === 4 ? '#1A1A1A' : stage === 3 ? '#3E3E3E' : color} />
          <ellipse cx="-7" cy="52" rx="8" ry="4" fill={stage === 4 ? '#2A2A2A' : stage === 3 ? '#4E4E4E' : color} />
          <ellipse cx="-7" cy="51" rx="5" ry="2" fill="#FFF" opacity="0.12" />
          <ellipse cx="7" cy="53" rx="9" ry="5" fill={stage === 4 ? '#1A1A1A' : stage === 3 ? '#3E3E3E' : color} />
          <ellipse cx="7" cy="52" rx="8" ry="4" fill={stage === 4 ? '#2A2A2A' : stage === 3 ? '#4E4E4E' : color} />
          <ellipse cx="7" cy="51" rx="5" ry="2" fill="#FFF" opacity="0.12" />

          {/* Body/Shirt */}
          {stage !== 4 && (
            <>
              <rect x="-16" y="-6" width="32" height="40" rx="10" fill={`url(#${shirtId})`} />
              <path d="M-6,-5 L0,3 L6,-5" fill="none" stroke={color} strokeWidth="2.5" opacity="0.5" />
              <rect x="-10" y="-3" width="8" height="24" rx="4" fill="#FFF" opacity="0.08" />
              {/* Shirt wrinkles */}
              <path d="M-5,18 Q0,22 5,18" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.12" />
              <path d="M-4,26 Q0,28 4,26" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.08" />
            </>
          )}

          {/* Belt for school-age */}
          {stage === 3 && (
            <>
              <rect x="-16" y="28" width="32" height="5" rx="1" fill="#5D4037" />
              <rect x="-3" y="27" width="6" height="7" rx="1.5" fill="#8D6E63" />
            </>
          )}

          {/* Arms */}
          {stage === 4 ? (
            // Graduate gown sleeves
            <>
              <path d="M-20,-4 L-28,6 L-28,24 L-20,28 Z" fill="#1A1A1A" />
              <circle cx="-20" cy="30" r="6" fill={`url(#${skinId})`} />
              {/* Detailed hand */}
              <ellipse cx="-24" cy="28" rx="2.5" ry="3.5" fill={s.skin} transform="rotate(-20, -24, 28)" />
              <ellipse cx="-26" cy="31" rx="2" ry="3" fill={s.skin} transform="rotate(-10, -26, 31)" />

              <path d="M20,-4 L28,6 L28,24 L20,28 Z" fill="#1A1A1A" />
              <circle cx="20" cy="30" r="6" fill={`url(#${skinId})`} />
              <ellipse cx="24" cy="28" rx="2.5" ry="3.5" fill={s.skin} transform="rotate(20, 24, 28)" />
              <ellipse cx="26" cy="31" rx="2" ry="3" fill={s.skin} transform="rotate(10, 26, 31)" />
            </>
          ) : (
            <>
              <rect x="-24" y="-2" width="11" height="26" rx="5.5" fill={`url(#${skinId})`} />
              <rect x="-22" y="0" width="4" height="20" rx="2" fill={s.skinLight} opacity="0.25" />
              {/* Hand with fingers */}
              <circle cx="-18" cy="26" r="6" fill={`url(#${skinId})`} />
              <ellipse cx="-22" cy="24" rx="2" ry="3" fill={s.skin} transform="rotate(-15, -22, 24)" />
              <ellipse cx="-24" cy="27" rx="1.8" ry="2.8" fill={s.skin} transform="rotate(-5, -24, 27)" />
              <ellipse cx="-24" cy="30" rx="1.5" ry="2.5" fill={s.skin} />

              <rect x="13" y="-2" width="11" height="26" rx="5.5" fill={`url(#${skinId})`} />
              <rect x="15" y="0" width="4" height="20" rx="2" fill={s.skinLight} opacity="0.25" />
              <circle cx="18" cy="26" r="6" fill={`url(#${skinId})`} />
              <ellipse cx="22" cy="24" rx="2" ry="3" fill={s.skin} transform="rotate(15, 22, 24)" />
              <ellipse cx="24" cy="27" rx="1.8" ry="2.8" fill={s.skin} transform="rotate(5, 24, 27)" />
              <ellipse cx="24" cy="30" rx="1.5" ry="2.5" fill={s.skin} />
            </>
          )}

          {/* Neck */}
          <rect x="-5" y="-12" width="10" height="10" rx="4" fill={`url(#${skinId})`} />
          {/* Neck shadow (AO) */}
          <ellipse cx="0" cy="-6" rx="8" ry="4" fill={`url(#${aoId})`} />

          {/* Head */}
          <ellipse cx="0" cy="-30" rx="22" ry="20" fill={`url(#${skinId})`} />
          {/* Rim light */}
          <ellipse cx="0" cy="-30" rx="21" ry="19" fill={`url(#${rimLightId})`} />

          {/* Ears */}
          <ellipse cx="-20" cy="-28" rx="5" ry="6" fill={`url(#${skinId})`} />
          <ellipse cx="-20" cy="-28" rx="3" ry="4" fill={s.skinDark} opacity="0.2" />
          <ellipse cx="20" cy="-28" rx="5" ry="6" fill={`url(#${skinId})`} />
          <ellipse cx="20" cy="-28" rx="3" ry="4" fill={s.skinDark} opacity="0.2" />

          {/* Hair by stage */}
          {stage === 1 && (
            // Toddler - straight black hair with bangs
            <>
              <path d="M-20,-30 Q-20,-52 0,-52 Q20,-52 20,-30" fill={s.hair} />
              <rect x="-16" y="-46" width="32" height="12" rx="4" fill={s.hair} />
              {/* Bangs */}
              {[-13, -8, -3, 2, 7, 12].map((x, i) => (
                <path key={i} d={`M${x},-40 L${x},-34`} stroke={s.hair} strokeWidth="4" strokeLinecap="round" />
              ))}
              {/* Hair shine */}
              <ellipse cx="0" cy="-48" rx="8" ry="3" fill={s.hairHighlight} opacity="0.3" />
            </>
          )}
          {stage === 2 && (
            // Preschooler - wavy auburn hair
            <>
              <path d="M-20,-30 Q-20,-54 0,-54 Q20,-54 20,-30" fill={s.hair} />
              <path d="M-17,-30 Q-17,-50 0,-50 Q17,-50 17,-30" fill={s.hairHighlight} opacity="0.4" />
              {/* Waves */}
              <path d="M-14,-42 Q-10,-46 -6,-42 Q-2,-38 2,-42 Q6,-46 10,-42" fill="none" stroke={s.hair} strokeWidth="4" />
              <path d="M-16,-36 Q-12,-40 -8,-36 Q-4,-32 0,-36 Q4,-40 8,-36 Q12,-32 16,-36" fill="none" stroke={s.hair} strokeWidth="3" />
              {/* Side hair */}
              <path d="M-20,-30 Q-24,-22 -22,-14 Q-20,-8 -21,-2" stroke={s.hair} strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M20,-30 Q24,-22 22,-14 Q20,-8 21,-2" stroke={s.hair} strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Shine */}
              <ellipse cx="-2" cy="-48" rx="6" ry="2.5" fill="#FFF" opacity="0.15" />
            </>
          )}
          {stage === 3 && (
            // School-age - braids
            <>
              <path d="M-20,-30 Q-20,-54 0,-54 Q20,-54 20,-30" fill={s.hair} />
              <line x1="0" y1="-52" x2="0" y2="-36" stroke={s.skinDark} strokeWidth="1" opacity="0.3" />
              {/* Left braid */}
              <path d="M-17,-32 Q-22,-24 -20,-14 Q-18,-4 -22,6 Q-20,16 -22,26" fill="none" stroke={s.hair} strokeWidth="7" strokeLinecap="round" />
              <path d="M-19,-28 L-17,-26 L-21,-24 L-17,-22 L-21,-20 L-17,-18 L-21,-16 L-17,-14 L-21,-12 L-17,-10 L-21,-8 L-17,-6 L-21,-4 L-19,-2 L-21,0 L-19,2 L-21,4 L-19,6 L-21,8 L-19,10 L-21,12 L-19,14 L-21,16 L-19,18 L-21,20 L-19,22 L-21,24" fill="none" stroke={s.hair} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
              <circle cx="-21" cy="26" r="4" fill="#F9A825" />
              <circle cx="-21" cy="26" r="2" fill="#FFF" opacity="0.4" />
              {/* Right braid */}
              <path d="M17,-32 Q22,-24 20,-14 Q18,-4 22,6 Q20,16 22,26" fill="none" stroke={s.hair} strokeWidth="7" strokeLinecap="round" />
              <path d="M19,-28 L17,-26 L21,-24 L17,-22 L21,-20 L17,-18 L21,-16 L17,-14 L21,-12 L17,-10 L21,-8 L17,-6 L21,-4 L19,-2 L21,0 L19,2 L21,4 L19,6 L21,8 L19,10 L21,12 L19,14 L21,16 L19,18 L21,20 L19,22 L21,24" fill="none" stroke={s.hair} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
              <circle cx="21" cy="26" r="4" fill="#F9A825" />
              <circle cx="21" cy="26" r="2" fill="#FFF" opacity="0.4" />
              {/* Hair volume */}
              <circle cx="-10" cy="-48" r="5" fill={s.hair} />
              <circle cx="10" cy="-48" r="5" fill={s.hair} />
              <circle cx="0" cy="-52" r="5" fill={s.hair} />
            </>
          )}
          {stage === 4 && (
            // Graduate - tight curls with cap
            <>
              <path d="M-18,-30 Q-18,-52 0,-52 Q18,-52 18,-30" fill={s.hair} />
              {/* Curl texture */}
              {[-12, -6, 0, 6, 12].map((x) =>
                [-48, -44, -40].map((y) => (
                  <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill={s.hair} />
                ))
              )}
              {/* Graduation cap */}
              <rect x="-24" y="-58" width="48" height="6" rx="1" fill="#1A1A1A" />
              <rect x="-15" y="-66" width="30" height="10" rx="2" fill="#1A1A1A" />
              <circle cx="0" cy="-66" r="3" fill="#333" />
              {/* Tassel */}
              <line x1="0" y1="-66" x2="24" y2="-58" stroke="#F9A825" strokeWidth="2" />
              <line x1="24" y1="-58" x2="26" y2="-46" stroke="#F9A825" strokeWidth="2.5" />
              <circle cx="26" cy="-44" r="4" fill="#F9A825" />
              {/* Cap shine */}
              <rect x="-10" y="-64" width="12" height="3" rx="1" fill="#FFF" opacity="0.08" />
            </>
          )}

          {/* Eyebrows */}
          <path d={`M-10,-38 Q-6,-${stage === 1 ? 40 : 41} -2,-38`} fill="none" stroke={s.hair} strokeWidth="2" strokeLinecap="round" />
          <path d={`M2,-38 Q6,-${stage === 1 ? 40 : 41} 10,-38`} fill="none" stroke={s.hair} strokeWidth="2" strokeLinecap="round" />

          {/* Eyes - Pixar style with detailed reflections */}
          {/* Left eye */}
          <ellipse cx="-8" cy="-30" rx="6" ry="5" fill={`url(#${eyeGradientId})`} />
          <ellipse cx="-8" cy="-30" rx="5.5" ry="4.5" fill="none" stroke="#DDD" strokeWidth="0.5" />
          <circle cx="-7" cy="-29" r="3.5" fill={irisColor} />
          <circle cx="-7" cy="-29" r="1.8" fill="#111" />
          <circle cx="-5.5" cy="-31" r="1.2" fill="#FFF" />
          <circle cx="-8" cy="-28" r="0.6" fill="#FFF" opacity="0.6" />
          {/* Eyelid crease */}
          <path d="M-13,-32 Q-8,-34 -3,-32" fill="none" stroke={s.skinMid} strokeWidth="0.8" opacity="0.4" />
          {/* Lashes */}
          <path d="M-13,-31 L-12.5,-34" stroke={s.hair} strokeWidth="1" strokeLinecap="round" />
          <path d="M-10,-33 L-10,-36" stroke={s.hair} strokeWidth="1" strokeLinecap="round" />

          {/* Right eye */}
          <ellipse cx="8" cy="-30" rx="6" ry="5" fill={`url(#${eyeGradientId})`} />
          <ellipse cx="8" cy="-30" rx="5.5" ry="4.5" fill="none" stroke="#DDD" strokeWidth="0.5" />
          <circle cx="7" cy="-29" r="3.5" fill={irisColor} />
          <circle cx="7" cy="-29" r="1.8" fill="#111" />
          <circle cx="8.5" cy="-31" r="1.2" fill="#FFF" />
          <circle cx="6" cy="-28" r="0.6" fill="#FFF" opacity="0.6" />
          <path d="M3,-32 Q8,-34 13,-32" fill="none" stroke={s.skinMid} strokeWidth="0.8" opacity="0.4" />
          <path d="M13,-31 L12.5,-34" stroke={s.hair} strokeWidth="1" strokeLinecap="round" />
          <path d="M10,-33 L10,-36" stroke={s.hair} strokeWidth="1" strokeLinecap="round" />

          {/* Nose */}
          <path d="M-2,-22 Q0,-20 2,-22" fill="none" stroke={s.skinDark} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <ellipse cx="-2" cy="-21" rx="1.2" ry="1" fill={s.skinDark} opacity="0.2" />
          <ellipse cx="2" cy="-21" rx="1.2" ry="1" fill={s.skinDark} opacity="0.2" />
          {/* Nose highlight */}
          <ellipse cx="0" cy="-24" rx="2" ry="1" fill={s.skinLight} opacity="0.3" />

          {/* Mouth */}
          <path d="M-5,-16 Q-3,-14 0,-15 Q3,-14 5,-16" fill={lipColor} opacity="0.6" />
          <path d="M-4,-16 Q0,-12 4,-16" fill="none" stroke={lipColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
          {/* Lip highlight */}
          <ellipse cx="0" cy="-15" rx="2" ry="0.8" fill="#FFF" opacity="0.15" />

          {/* Cheek blush - subsurface scattering */}
          <ellipse cx="-12" cy="-22" rx="5" ry="3" fill="#E88B8B" opacity={stage === 2 ? 0.4 : 0.25} />
          <ellipse cx="12" cy="-22" rx="5" ry="3" fill="#E88B8B" opacity={stage === 2 ? 0.4 : 0.25} />

          {/* Forehead highlight */}
          <ellipse cx="0" cy="-40" rx="8" ry="4" fill="#FFF" opacity="0.08" />

          {/* Accessories */}
          {stage === 2 && (
            // Preschool backpack
            <>
              <rect x="-26" y="4" width="10" height="16" rx="4" fill="#C62828" />
              <rect x="-25" y="5" width="8" height="4" rx="2" fill="#E53935" />
              <path d="M-16,2 L-16,8" stroke="#F9A825" strokeWidth="2" />
              <path d="M16,2 L16,8" stroke="#F9A825" strokeWidth="2" />
            </>
          )}
          {stage === 3 && (
            // School backpack
            <>
              <rect x="16" y="2" width="16" height="24" rx="5" fill="#C62828" />
              <rect x="17" y="3" width="14" height="10" rx="3" fill="#E53935" />
              <rect x="21" y="14" width="6" height="7" rx="2" fill="#B71C1C" />
              <path d="M18,2 L18,-2 Q18,-4 20,-4 L20,2" fill="none" stroke="#8B1A1A" strokeWidth="2" />
            </>
          )}
          {stage === 4 && (
            // Diploma
            <g transform="rotate(-15, 24, 8)">
              <rect x="20" y="0" width="14" height="6" rx="3" fill="#FFF5E1" />
              <rect x="20" y="0" width="14" height="6" rx="3" fill="none" stroke="#D4A55A" strokeWidth="1" />
              <rect x="25" y="-1" width="4" height="8" rx="0.5" fill="#C62828" opacity="0.8" />
            </g>
          )}
        </g>
      )}
    </g>
  );
}
