'use client';

import { useState, useEffect } from 'react';

/* Enhanced skin tone data with more color stops for realistic rendering */
const stages = [
  {
    label: 'Infant',
    color: '#5BA3E6',
    // Rich brown baby skin
    skin: '#8D5524',
    skinHighlight: '#C4956A',
    skinMid: '#A06B3C',
    skinShadow: '#6B3D1A',
    skinDeep: '#4A2810',
    // Subsurface (blood showing through)
    subsurface: '#D4847A',
    hair: '#1A1A1A',
    hairHighlight: '#4A4A4A',
    eyeColor: '#3D2314',
    lipColor: '#9E6B6B'
  },
  {
    label: 'Toddler',
    color: '#E91E63',
    // Light Asian skin
    skin: '#F1C27D',
    skinHighlight: '#FFF0D4',
    skinMid: '#E5B06A',
    skinShadow: '#C4955A',
    skinDeep: '#A67B4A',
    subsurface: '#F5C4B8',
    hair: '#0D0D0D',
    hairHighlight: '#3D3D3D',
    eyeColor: '#2C1A0F',
    lipColor: '#D4837A'
  },
  {
    label: 'Preschool',
    color: '#43A047',
    // Fair Caucasian skin with freckles
    skin: '#FDDBB4',
    skinHighlight: '#FFF5EB',
    skinMid: '#F5CCA0',
    skinShadow: '#E5B88A',
    skinDeep: '#C9A07A',
    subsurface: '#FFCFC4',
    hair: '#B5651D',
    hairHighlight: '#E08830',
    eyeColor: '#5B8C3E',
    lipColor: '#E0918A'
  },
  {
    label: 'School Age',
    color: '#7B1FA2',
    // Medium brown skin
    skin: '#C68642',
    skinHighlight: '#E5A862',
    skinMid: '#B07535',
    skinShadow: '#8A5A28',
    skinDeep: '#6A4520',
    subsurface: '#D4947A',
    hair: '#2C1608',
    hairHighlight: '#5A3018',
    eyeColor: '#2C1608',
    lipColor: '#A05A5A'
  },
  {
    label: 'College',
    color: '#C62828',
    // Deep brown skin
    skin: '#5A3420',
    skinHighlight: '#8A5A3A',
    skinMid: '#4A2818',
    skinShadow: '#3A1E12',
    skinDeep: '#2A150C',
    subsurface: '#8A5A4A',
    hair: '#0D0D0D',
    hairHighlight: '#2A2A2A',
    eyeColor: '#1A0F08',
    lipColor: '#6A3A3A'
  },
];

/* Spiral positions - infant at actual spiral start */
const spiralPoints = [
  { x: 400, y: 420 },  // Infant - at spiral START (bottom)
  { x: 540, y: 350 },  // Toddler - first curve right
  { x: 260, y: 280 },  // Preschool - left
  { x: 540, y: 200 },  // School Age - right
  { x: 400, y: 120 },  // College - top center
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const cycleDuration = 3500;
    const fadeDuration = 500;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % stages.length);
        setIsVisible(true);
      }, fadeDuration);
    }, cycleDuration);

    return () => clearInterval(interval);
  }, []);

  const currentPos = spiralPoints[activeIndex];

  /* Clean spiral path */
  const spiralPath = `M400,420
     C620,420 640,380 540,350
     C440,320 220,320 260,280
     C300,240 580,240 540,200
     C500,160 260,160 280,120
     C300,80 360,60 400,50`;

  return (
    <div className="relative min-h-[650px] md:min-h-[750px] overflow-hidden bg-gradient-to-br from-amber-50 via-white to-sky-50 flex flex-col items-center justify-center px-4 py-8">

      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #C62828 0%, transparent 70%)', left: '10%', top: '20%', opacity: 0.12 }} />
        <div className="absolute w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, #43A047 0%, transparent 70%)', right: '15%', bottom: '20%', opacity: 0.04 }} />
      </div>

      {/* Rainbow Tagline */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mb-0">
        <svg viewBox="0 0 800 160" className="w-full h-auto" role="heading" aria-level={1}>
          <defs>
            <linearGradient id="rainbowText" x1="0%" y1="0%" x2="200%" y2="0%">
              <stop offset="0%" stopColor="#C62828" />
              <stop offset="14%" stopColor="#E65100" />
              <stop offset="28%" stopColor="#F9A825" />
              <stop offset="42%" stopColor="#2E7D32" />
              <stop offset="56%" stopColor="#1565C0" />
              <stop offset="70%" stopColor="#6A1B9A" />
              <stop offset="84%" stopColor="#C62828" />
              <stop offset="100%" stopColor="#E65100" />
              <animate attributeName="x1" from="0%" to="-100%" dur="4s" repeatCount="indefinite" />
              <animate attributeName="x2" from="200%" to="100%" dur="4s" repeatCount="indefinite" />
            </linearGradient>
            <path id="textArc" d="M20,140 Q400,-20 780,140" fill="none" />
          </defs>
          <text fontSize="42" fontWeight="bold" fontFamily="system-ui" fill="#000" opacity="0.06">
            <textPath href="#textArc" startOffset="50%" textAnchor="middle">Where Learning and Growth Become One</textPath>
          </text>
          <text fontSize="42" fontWeight="bold" fontFamily="system-ui" fill="url(#rainbowText)">
            <textPath href="#textArc" startOffset="50%" textAnchor="middle">Where Learning and Growth Become One</textPath>
          </text>
        </svg>
      </div>

      <p className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-700 text-center -mt-4">
        Christina&apos;s Child Care Center
      </p>

      {/* Main Canvas */}
      <div className="relative z-10 w-full max-w-3xl mt-4">
        <svg viewBox="0 0 800 500" className="w-full h-auto">
          <defs>
            {/* Spiral gradient with smooth color flow */}
            <linearGradient id="spiralGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#6B0F0F">
                <animate attributeName="stopColor" values="#6B0F0F;#8B1A1A;#6B0F0F" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="25%" stopColor="#9B1C1C">
                <animate attributeName="stopColor" values="#9B1C1C;#B72828;#9B1C1C" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#C62828">
                <animate attributeName="stopColor" values="#C62828;#D43F3F;#C62828" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="75%" stopColor="#D43F3F">
                <animate attributeName="stopColor" values="#D43F3F;#E55555;#D43F3F" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#E55555">
                <animate attributeName="stopColor" values="#E55555;#F06666;#E55555" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Spiral highlight for 3D effect */}
            <linearGradient id="spiralHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
              <stop offset="30%" stopColor="#FFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFF" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#FFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
            </linearGradient>

            {/* Soft glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Flowing stream gradient - lighter for visible movement */}
            <linearGradient id="spiralFlowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFB3B3" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FF8A8A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFD0D0" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Daycare Building */}
          <g transform="translate(400, 470)">
            <ellipse cx="0" cy="20" rx="100" ry="12" fill="#4CAF50" opacity="0.5" />

            {/* Building */}
            <rect x="-60" y="-50" width="120" height="60" rx="6" fill="#FFF8E1" stroke="#E5C07A" strokeWidth="2" />

            {/* Roof */}
            <path d="M-70,-45 L0,-72 L70,-45" fill="#C62828" />
            <path d="M-65,-45 L0,-70 L65,-45" fill="#E53935" />

            {/* Door */}
            <rect x="-12" y="-28" width="24" height="35" rx="3" fill="#8D6E63" />
            <rect x="-9" y="-25" width="18" height="28" rx="2" fill="#A1887F" />
            <circle cx="6" cy="-12" r="2.5" fill="#D4AF37" />

            {/* Windows */}
            <rect x="-45" y="-35" width="18" height="18" rx="2" fill="#87CEEB" stroke="#FFF" strokeWidth="1.5" />
            <line x1="-36" y1="-35" x2="-36" y2="-17" stroke="#FFF" strokeWidth="1" />
            <line x1="-45" y1="-26" x2="-27" y2="-26" stroke="#FFF" strokeWidth="1" />

            <rect x="27" y="-35" width="18" height="18" rx="2" fill="#87CEEB" stroke="#FFF" strokeWidth="1.5" />
            <line x1="36" y1="-35" x2="36" y2="-17" stroke="#FFF" strokeWidth="1" />
            <line x1="27" y1="-26" x2="45" y2="-26" stroke="#FFF" strokeWidth="1" />

            {/* Sign */}
            <rect x="-42" y="-82" width="84" height="14" rx="3" fill="#C62828" />
            <text x="0" y="-71" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="bold" fontFamily="system-ui">Christina&apos;s Child Care</text>
          </g>

          {/* Animated Spiral with flowing stream effect */}
          {/* Shadow */}
          <path d={spiralPath} fill="none" stroke="#2A0808" strokeWidth="28" strokeLinecap="round" opacity="0.15" transform="translate(4, 6)" />

          {/* Main spiral body */}
          <path d={spiralPath} fill="none" stroke="url(#spiralGrad)" strokeWidth="24" strokeLinecap="round" filter="url(#softGlow)" />

          {/* 3D highlight overlay */}
          <path d={spiralPath} fill="none" stroke="url(#spiralHighlight)" strokeWidth="24" strokeLinecap="round" />

          {/* Animated flowing stream - creates visible movement */}
          <path
            d={spiralPath}
            fill="none"
            stroke="url(#spiralFlowGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="30 60"
            style={{
              animation: 'spiralFlow 2s linear infinite',
            }}
          />
          <style>{`
            @keyframes spiralFlow {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -90; }
            }
          `}</style>

          {/* Stage markers - labels only appear for current character */}
          {spiralPoints.map((point, i) => {
            if (i === 0) {
              // Infant label - only show when active
              return activeIndex === 0 ? (
                <g key={i}>
                  <circle cx={point.x} cy={point.y - 60} r="20" fill={stages[i].color} opacity="0.15" />
                  <text x={point.x} y={point.y - 30} textAnchor="middle" fill="#333" fontSize="13" fontWeight="700" fontFamily="system-ui">
                    {stages[i].label}
                  </text>
                </g>
              ) : null;
            }
            const isReached = i <= activeIndex;
            const isCurrent = i === activeIndex;
            return (
              <g key={i}>
                {isCurrent && <circle cx={point.x} cy={point.y} r="20" fill={stages[i].color} opacity="0.15" />}
                <circle cx={point.x} cy={point.y} r={isCurrent ? 12 : 8} fill={isReached ? stages[i].color : '#CCC'} stroke="#FFF" strokeWidth="2.5" />
                {isCurrent && (
                  <text x={point.x} y={point.y + 26} textAnchor="middle" fill="#333" fontSize="13" fontWeight="700" fontFamily="system-ui">
                    {stages[i].label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Character */}
          <g style={{
            transform: `translate(${currentPos.x}px, ${currentPos.y - 55}px)`,
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <VRCharacter stage={activeIndex} />
          </g>
        </svg>
      </div>

      <p className="relative z-10 mt-4 text-sm text-gray-500">
        Crystal & Brooklyn Park, MN &bull; Licensed by Minnesota DCYF
      </p>
    </div>
  );
}

/* ============================================================
   VR-QUALITY CHARACTER COMPONENT
   Photorealistic rendering using layered SVG techniques:
   - Multiple gradient layers for skin depth
   - Realistic eye rendering with cornea, iris detail, reflections
   - Subsurface scattering simulation
   - Ambient occlusion in all creases
   - Rim lighting for 3D pop
   - Detailed hair with individual strand groupings
   ============================================================ */
function VRCharacter({ stage }: { stage: number }) {
  const s = stages[stage];
  const scale = [0.65, 0.75, 0.85, 0.95, 0.95][stage];
  const id = `vr-${stage}`;

  return (
    <g transform={`scale(${scale})`}>
      <defs>
        {/* Multi-layer skin gradient for subsurface scattering */}
        <radialGradient id={`${id}-skin-base`} cx="40%" cy="30%" r="70%" fx="30%" fy="20%">
          <stop offset="0%" stopColor={s.skinHighlight} />
          <stop offset="35%" stopColor={s.skin} />
          <stop offset="70%" stopColor={s.skinMid} />
          <stop offset="100%" stopColor={s.skinShadow} />
        </radialGradient>

        {/* Subsurface blood layer */}
        <radialGradient id={`${id}-subsurface`} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={s.subsurface} stopOpacity="0.5" />
          <stop offset="100%" stopColor={s.subsurface} stopOpacity="0" />
        </radialGradient>

        {/* Rim light - simulates back lighting */}
        <linearGradient id={`${id}-rim`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.35" />
          <stop offset="15%" stopColor="#FFF" stopOpacity="0" />
          <stop offset="85%" stopColor="#FFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFF" stopOpacity="0.25" />
        </linearGradient>

        {/* Ambient occlusion for creases */}
        <linearGradient id={`${id}-ao`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={s.skinDeep} stopOpacity="0.4" />
          <stop offset="100%" stopColor={s.skinDeep} stopOpacity="0" />
        </linearGradient>

        {/* Eye sclera gradient */}
        <radialGradient id={`${id}-sclera`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8F8F8" />
          <stop offset="100%" stopColor="#E8E0E0" />
        </radialGradient>

        {/* Iris gradient with depth */}
        <radialGradient id={`${id}-iris`} cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor={s.eyeColor} />
          <stop offset="40%" stopColor={s.eyeColor} />
          <stop offset="100%" stopColor="#0A0A0A" />
        </radialGradient>

        {/* Cornea reflection */}
        <radialGradient id={`${id}-cornea`} cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#FFF" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
        </radialGradient>

        {/* Hair base gradient */}
        <linearGradient id={`${id}-hair`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={s.hairHighlight} />
          <stop offset="40%" stopColor={s.hair} />
          <stop offset="100%" stopColor={s.hair} />
        </linearGradient>

        {/* Clothing gradient */}
        <linearGradient id={`${id}-shirt`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={s.color} />
          <stop offset="50%" stopColor={s.color} />
          <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
        </linearGradient>

        {/* Filters */}
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="0" cy="60" rx={20} ry={5} fill="#000" opacity="0.2" />
      <ellipse cx="0" cy="60" rx={14} ry={3} fill="#000" opacity="0.1" />

      {/* ========== INFANT ========== */}
      {stage === 0 && (
        <g filter={`url(#${id}-shadow)`}>
          {/* Crawling body - onesie */}
          <ellipse cx="0" cy="20" rx="28" ry="20" fill={s.color} />
          <ellipse cx="-8" cy="14" rx="14" ry="10" fill="#FFF" opacity="0.06" />

          {/* Back leg */}
          <ellipse cx="-18" cy="32" rx="12" ry="14" fill={`url(#${id}-skin-base)`} transform="rotate(-10, -18, 32)" />
          <ellipse cx="-22" cy="42" rx="9" ry="6" fill={`url(#${id}-skin-base)`} />

          {/* Front leg */}
          <ellipse cx="22" cy="30" rx="12" ry="14" fill={`url(#${id}-skin-base)`} transform="rotate(15, 22, 30)" />
          <ellipse cx="28" cy="42" rx="10" ry="6" fill={`url(#${id}-skin-base)`} />
          {/* Toes */}
          <circle cx="36" cy="40" r="2.5" fill={s.skin} />
          <circle cx="38" cy="42" r="2.2" fill={s.skin} />
          <circle cx="38" cy="44" r="2" fill={s.skin} />

          {/* Back arm */}
          <ellipse cx="-22" cy="12" rx="9" ry="12" fill={`url(#${id}-skin-base)`} transform="rotate(20, -22, 12)" />
          <circle cx="-28" cy="24" r="8" fill={`url(#${id}-skin-base)`} />
          {/* Fingers */}
          <ellipse cx="-34" cy="20" rx="2.5" ry="4" fill={s.skin} transform="rotate(-25, -34, 20)" />
          <ellipse cx="-36" cy="24" rx="2.2" ry="3.5" fill={s.skin} transform="rotate(-15, -36, 24)" />

          {/* Front arm */}
          <ellipse cx="24" cy="8" rx="9" ry="12" fill={`url(#${id}-skin-base)`} transform="rotate(-25, 24, 8)" />
          <ellipse cx="24" cy="8" rx="5" ry="7" fill={s.skinHighlight} opacity="0.15" transform="rotate(-25, 24, 8)" />
          <circle cx="32" cy="16" r="8" fill={`url(#${id}-skin-base)`} />
          {/* Detailed fingers */}
          <ellipse cx="38" cy="10" rx="2.5" ry="4" fill={s.skin} transform="rotate(25, 38, 10)" />
          <ellipse cx="40" cy="14" rx="2.2" ry="3.8" fill={s.skin} transform="rotate(35, 40, 14)" />
          <ellipse cx="40" cy="18" rx="2" ry="3.5" fill={s.skin} transform="rotate(40, 40, 18)" />
          <ellipse cx="38" cy="22" rx="1.8" ry="3" fill={s.skin} transform="rotate(30, 38, 22)" />

          {/* Neck */}
          <ellipse cx="-6" cy="-6" rx="10" ry="8" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="-6" cy="-2" rx="8" ry="5" fill={`url(#${id}-ao)`} />

          {/* Head - large baby proportions */}
          <circle cx="-4" cy="-28" r="28" fill={`url(#${id}-skin-base)`} />
          {/* Rim light */}
          <circle cx="-4" cy="-28" r="27" fill={`url(#${id}-rim)`} />
          {/* Cheek subsurface */}
          <ellipse cx="-20" cy="-18" rx="10" ry="7" fill={`url(#${id}-subsurface)`} />
          <ellipse cx="12" cy="-18" rx="10" ry="7" fill={`url(#${id}-subsurface)`} />

          {/* Ears */}
          <ellipse cx="-30" cy="-24" rx="6" ry="8" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="-30" cy="-24" rx="4" ry="5" fill={s.skinShadow} opacity="0.3" />
          <ellipse cx="-30" cy="-24" rx="2" ry="3" fill={s.subsurface} opacity="0.4" />
          <ellipse cx="22" cy="-24" rx="6" ry="8" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="22" cy="-24" rx="4" ry="5" fill={s.skinShadow} opacity="0.3" />

          {/* Baby hair - soft curls */}
          <ellipse cx="-4" cy="-52" rx="18" ry="10" fill={`url(#${id}-hair)`} />
          <circle cx="-16" cy="-50" r="6" fill={s.hair} />
          <circle cx="8" cy="-50" r="6" fill={s.hair} />
          <circle cx="-4" cy="-56" r="5" fill={s.hair} />
          <circle cx="-10" cy="-54" r="4" fill={s.hair} />
          <circle cx="2" cy="-54" r="4" fill={s.hair} />
          {/* Hair highlights */}
          <ellipse cx="-6" cy="-54" rx="6" ry="2" fill={s.hairHighlight} opacity="0.3" />

          {/* EYES - High detail baby eyes */}
          {/* Left eye */}
          <ellipse cx="-14" cy="-30" rx="9" ry="8" fill={`url(#${id}-sclera)`} />
          <ellipse cx="-14" cy="-30" rx="8.5" ry="7.5" fill="none" stroke="#C8C0C0" strokeWidth="0.5" />
          {/* Iris */}
          <circle cx="-12" cy="-29" r="5.5" fill={`url(#${id}-iris)`} />
          {/* Pupil */}
          <circle cx="-12" cy="-29" r="2.8" fill="#050505" />
          {/* Cornea highlight */}
          <circle cx="-12" cy="-29" r="5" fill={`url(#${id}-cornea)`} />
          {/* Primary catchlight */}
          <ellipse cx="-10" cy="-32" rx="2" ry="1.5" fill="#FFF" />
          {/* Secondary catchlight */}
          <circle cx="-14" cy="-27" r="0.8" fill="#FFF" opacity="0.7" />
          {/* Eyelid shadow */}
          <path d="M-22,-32 Q-14,-35 -6,-32" fill="none" stroke={s.skinShadow} strokeWidth="1.5" opacity="0.4" />

          {/* Right eye */}
          <ellipse cx="8" cy="-30" rx="9" ry="8" fill={`url(#${id}-sclera)`} />
          <ellipse cx="8" cy="-30" rx="8.5" ry="7.5" fill="none" stroke="#C8C0C0" strokeWidth="0.5" />
          <circle cx="10" cy="-29" r="5.5" fill={`url(#${id}-iris)`} />
          <circle cx="10" cy="-29" r="2.8" fill="#050505" />
          <circle cx="10" cy="-29" r="5" fill={`url(#${id}-cornea)`} />
          <ellipse cx="12" cy="-32" rx="2" ry="1.5" fill="#FFF" />
          <circle cx="8" cy="-27" r="0.8" fill="#FFF" opacity="0.7" />
          <path d="M0,-32 Q8,-35 16,-32" fill="none" stroke={s.skinShadow} strokeWidth="1.5" opacity="0.4" />

          {/* Eyebrows - soft baby brows */}
          <path d="M-20,-38 Q-14,-40 -8,-38" fill="none" stroke={s.hair} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M2,-38 Q8,-40 14,-38" fill="none" stroke={s.hair} strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* Nose */}
          <ellipse cx="-3" cy="-18" rx="5" ry="4" fill={s.skinMid} opacity="0.3" />
          <ellipse cx="-4" cy="-19" rx="2.5" ry="1.5" fill={s.skinHighlight} opacity="0.4" />
          <circle cx="-5" cy="-16" r="1.5" fill={s.skinShadow} opacity="0.2" />
          <circle cx="-1" cy="-16" r="1.5" fill={s.skinShadow} opacity="0.2" />

          {/* Mouth - baby smile */}
          <ellipse cx="-3" cy="-10" rx="6" ry="4" fill={s.lipColor} opacity="0.5" />
          <path d="M-8,-10 Q-3,-6 2,-10" fill="#8B4A4A" opacity="0.4" />
          <ellipse cx="-3" cy="-11" rx="3" ry="1" fill="#FFF" opacity="0.3" />

          {/* Cheek blush */}
          <ellipse cx="-20" cy="-18" rx="6" ry="4" fill="#E08080" opacity="0.35" />
          <ellipse cx="14" cy="-18" rx="6" ry="4" fill="#E08080" opacity="0.35" />

          {/* Forehead highlight */}
          <ellipse cx="-4" cy="-42" rx="10" ry="5" fill="#FFF" opacity="0.08" />
        </g>
      )}

      {/* ========== TODDLER THROUGH GRADUATE ========== */}
      {stage > 0 && (
        <g filter={`url(#${id}-shadow)`}>
          {/* Graduate gown */}
          {stage === 4 && (
            <>
              <path d="M-24,-10 Q-28,25 -32,58 L32,58 Q28,25 24,-10 Z" fill="#1A1A1A" />
              <path d="M-24,-10 Q-28,25 -32,58 L-12,58 Q-8,25 -12,-6 Z" fill="#2A2A2A" opacity="0.25" />
              <path d="M12,-6 Q8,25 12,58 L32,58 Q28,25 24,-10 Z" fill="#0A0A0A" opacity="0.25" />
              <path d="M-14,20 Q-12,32 -14,44" fill="none" stroke="#333" strokeWidth="1.2" opacity="0.25" />
              <path d="M14,20 Q12,32 14,44" fill="none" stroke="#333" strokeWidth="1.2" opacity="0.25" />
              <path d="M0,8 L0,56" stroke="#1A1A1A" strokeWidth="1" opacity="0.3" />
            </>
          )}

          {/* Legs */}
          {stage !== 4 && (
            stage === 3 ? (
              <>
                <rect x="-16" y="32" width="14" height="26" rx="6" fill="#2C5282" />
                <rect x="-15" y="33" width="5" height="22" rx="2" fill="#3B6DAA" opacity="0.25" />
                <rect x="2" y="32" width="14" height="26" rx="6" fill="#2C5282" />
                <rect x="3" y="33" width="5" height="22" rx="2" fill="#3B6DAA" opacity="0.25" />
                <line x1="-9" y1="34" x2="-9" y2="56" stroke="#1E3A5F" strokeWidth="1" opacity="0.3" />
                <line x1="9" y1="34" x2="9" y2="56" stroke="#1E3A5F" strokeWidth="1" opacity="0.3" />
              </>
            ) : (
              <>
                <rect x="-14" y="34" width="12" height="24" rx="6" fill={`url(#${id}-skin-base)`} />
                <rect x="-13" y="35" width="5" height="20" rx="2" fill={s.skinHighlight} opacity="0.2" />
                <rect x="2" y="34" width="12" height="24" rx="6" fill={`url(#${id}-skin-base)`} />
                <rect x="3" y="35" width="5" height="20" rx="2" fill={s.skinHighlight} opacity="0.2" />
              </>
            )
          )}

          {/* Shoes */}
          <ellipse cx="-8" cy="59" rx="10" ry="5" fill={stage === 4 ? '#1A1A1A' : stage === 3 ? '#3E3E3E' : s.color} />
          <ellipse cx="-8" cy="58" rx="9" ry="4" fill={stage === 4 ? '#2A2A2A' : stage === 3 ? '#4E4E4E' : s.color} />
          <ellipse cx="-8" cy="57" rx="5" ry="2" fill="#FFF" opacity="0.1" />
          <ellipse cx="8" cy="59" rx="10" ry="5" fill={stage === 4 ? '#1A1A1A' : stage === 3 ? '#3E3E3E' : s.color} />
          <ellipse cx="8" cy="58" rx="9" ry="4" fill={stage === 4 ? '#2A2A2A' : stage === 3 ? '#4E4E4E' : s.color} />
          <ellipse cx="8" cy="57" rx="5" ry="2" fill="#FFF" opacity="0.1" />

          {/* Body/Shirt */}
          {stage !== 4 && (
            <>
              <rect x="-20" y="-8" width="40" height="46" rx="12" fill={`url(#${id}-shirt)`} />
              <path d="M-8,-7 L0,4 L8,-7" fill="none" stroke={s.color} strokeWidth="3" opacity="0.4" />
              <rect x="-12" y="-4" width="10" height="28" rx="5" fill="#FFF" opacity="0.06" />
              <path d="M-6,22 Q0,27 6,22" fill="none" stroke="#000" strokeWidth="0.6" opacity="0.1" />
              <path d="M-5,30 Q0,33 5,30" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.08" />
            </>
          )}

          {/* Belt for school-age */}
          {stage === 3 && (
            <>
              <rect x="-20" y="32" width="40" height="6" rx="1" fill="#5D4037" />
              <rect x="-4" y="31" width="8" height="8" rx="2" fill="#8D6E63" />
              <rect x="-2" y="33" width="4" height="4" rx="1" fill="#A1887F" />
            </>
          )}

          {/* Arms */}
          {stage === 4 ? (
            <>
              <path d="M-24,-6 L-34,8 L-34,28 L-24,32 Z" fill="#1A1A1A" />
              <circle cx="-24" cy="34" r="7" fill={`url(#${id}-skin-base)`} />
              <ellipse cx="-28" cy="32" rx="3" ry="4" fill={s.skin} transform="rotate(-20, -28, 32)" />
              <ellipse cx="-30" cy="36" rx="2.5" ry="3.5" fill={s.skin} transform="rotate(-10, -30, 36)" />

              <path d="M24,-6 L34,8 L34,28 L24,32 Z" fill="#1A1A1A" />
              <circle cx="24" cy="34" r="7" fill={`url(#${id}-skin-base)`} />
              <ellipse cx="28" cy="32" rx="3" ry="4" fill={s.skin} transform="rotate(20, 28, 32)" />
              <ellipse cx="30" cy="36" rx="2.5" ry="3.5" fill={s.skin} transform="rotate(10, 30, 36)" />
            </>
          ) : (
            <>
              <rect x="-30" y="-4" width="14" height="30" rx="7" fill={`url(#${id}-skin-base)`} />
              <rect x="-28" y="-2" width="5" height="24" rx="2" fill={s.skinHighlight} opacity="0.2" />
              <circle cx="-22" cy="28" r="7" fill={`url(#${id}-skin-base)`} />
              <ellipse cx="-26" cy="26" rx="2.5" ry="3.5" fill={s.skin} transform="rotate(-15, -26, 26)" />
              <ellipse cx="-28" cy="30" rx="2.2" ry="3.2" fill={s.skin} transform="rotate(-5, -28, 30)" />
              <ellipse cx="-28" cy="34" rx="2" ry="3" fill={s.skin} />

              <rect x="16" y="-4" width="14" height="30" rx="7" fill={`url(#${id}-skin-base)`} />
              <rect x="18" y="-2" width="5" height="24" rx="2" fill={s.skinHighlight} opacity="0.2" />
              <circle cx="22" cy="28" r="7" fill={`url(#${id}-skin-base)`} />
              <ellipse cx="26" cy="26" rx="2.5" ry="3.5" fill={s.skin} transform="rotate(15, 26, 26)" />
              <ellipse cx="28" cy="30" rx="2.2" ry="3.2" fill={s.skin} transform="rotate(5, 28, 30)" />
              <ellipse cx="28" cy="34" rx="2" ry="3" fill={s.skin} />
            </>
          )}

          {/* Neck */}
          <rect x="-6" y="-16" width="12" height="12" rx="5" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="0" cy="-8" rx="10" ry="5" fill={`url(#${id}-ao)`} />

          {/* Head */}
          <ellipse cx="0" cy="-38" rx="26" ry="24" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="0" cy="-38" rx="25" ry="23" fill={`url(#${id}-rim)`} />

          {/* Cheek subsurface */}
          <ellipse cx="-14" cy="-28" rx="8" ry="6" fill={`url(#${id}-subsurface)`} />
          <ellipse cx="14" cy="-28" rx="8" ry="6" fill={`url(#${id}-subsurface)`} />

          {/* Ears */}
          <ellipse cx="-24" cy="-36" rx="6" ry="7" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="-24" cy="-36" rx="4" ry="5" fill={s.skinShadow} opacity="0.25" />
          <ellipse cx="24" cy="-36" rx="6" ry="7" fill={`url(#${id}-skin-base)`} />
          <ellipse cx="24" cy="-36" rx="4" ry="5" fill={s.skinShadow} opacity="0.25" />

          {/* Hair by stage */}
          {stage === 1 && (
            <>
              <path d="M-24,-38 Q-24,-64 0,-64 Q24,-64 24,-38" fill={`url(#${id}-hair)`} />
              <rect x="-20" y="-58" width="40" height="14" rx="5" fill={s.hair} />
              {[-16, -10, -4, 2, 8, 14].map((x, i) => (
                <path key={i} d={`M${x},-50 L${x},-42`} stroke={s.hair} strokeWidth="5" strokeLinecap="round" />
              ))}
              <ellipse cx="0" cy="-60" rx="10" ry="4" fill={s.hairHighlight} opacity="0.25" />
            </>
          )}
          {stage === 2 && (
            <>
              <path d="M-24,-38 Q-24,-68 0,-68 Q24,-68 24,-38" fill={`url(#${id}-hair)`} />
              <path d="M-20,-38 Q-20,-62 0,-62 Q20,-62 20,-38" fill={s.hairHighlight} opacity="0.3" />
              <path d="M-16,-52 Q-12,-58 -6,-52 Q0,-46 6,-52 Q12,-58 16,-52" fill="none" stroke={s.hair} strokeWidth="5" />
              <path d="M-20,-44 Q-14,-50 -8,-44 Q-2,-38 4,-44 Q10,-50 16,-44" fill="none" stroke={s.hair} strokeWidth="4" />
              <path d="M-24,-38 Q-30,-28 -28,-18 Q-26,-10 -28,-2" stroke={s.hair} strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M24,-38 Q30,-28 28,-18 Q26,-10 28,-2" stroke={s.hair} strokeWidth="6" fill="none" strokeLinecap="round" />
              <ellipse cx="0" cy="-62" rx="8" ry="3" fill="#FFF" opacity="0.12" />
            </>
          )}
          {stage === 3 && (
            <>
              <path d="M-24,-38 Q-24,-68 0,-68 Q24,-68 24,-38" fill={`url(#${id}-hair)`} />
              <line x1="0" y1="-66" x2="0" y2="-46" stroke={s.skinShadow} strokeWidth="1.2" opacity="0.25" />
              <path d="M-20,-40 Q-26,-30 -24,-18 Q-22,-6 -26,8 Q-24,22 -26,32" fill="none" stroke={s.hair} strokeWidth="8" strokeLinecap="round" />
              <path d="M-22,-36 L-20,-34 L-24,-32 L-20,-30 L-24,-28 L-20,-26 L-24,-24 L-20,-22 L-24,-20 L-20,-18 L-24,-16 L-20,-14 L-24,-12 L-22,-10 L-24,-8 L-22,-6 L-24,-4 L-22,-2 L-24,0 L-22,2 L-24,4 L-22,6 L-24,8 L-22,10 L-24,12 L-22,14 L-24,16 L-22,18 L-24,20 L-22,22 L-24,24 L-22,26 L-24,28 L-22,30" fill="none" stroke={s.hair} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
              <circle cx="-25" cy="32" r="5" fill="#F9A825" />
              <circle cx="-25" cy="32" r="2.5" fill="#FFF" opacity="0.4" />
              <path d="M20,-40 Q26,-30 24,-18 Q22,-6 26,8 Q24,22 26,32" fill="none" stroke={s.hair} strokeWidth="8" strokeLinecap="round" />
              <path d="M22,-36 L20,-34 L24,-32 L20,-30 L24,-28 L20,-26 L24,-24 L20,-22 L24,-20 L20,-18 L24,-16 L20,-14 L24,-12 L22,-10 L24,-8 L22,-6 L24,-4 L22,-2 L24,0 L22,2 L24,4 L22,6 L24,8 L22,10 L24,12 L22,14 L24,16 L22,18 L24,20 L22,22 L24,24 L22,26 L24,28 L22,30" fill="none" stroke={s.hair} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
              <circle cx="25" cy="32" r="5" fill="#F9A825" />
              <circle cx="25" cy="32" r="2.5" fill="#FFF" opacity="0.4" />
              <circle cx="-12" cy="-62" r="6" fill={s.hair} />
              <circle cx="12" cy="-62" r="6" fill={s.hair} />
              <circle cx="0" cy="-66" r="6" fill={s.hair} />
            </>
          )}
          {stage === 4 && (
            <>
              <path d="M-22,-38 Q-22,-66 0,-66 Q22,-66 22,-38" fill={`url(#${id}-hair)`} />
              {[-14, -7, 0, 7, 14].map((x) =>
                [-62, -56, -50].map((y) => (
                  <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill={s.hair} />
                ))
              )}
              {/* Graduation cap */}
              <rect x="-28" y="-74" width="56" height="8" rx="2" fill="#1A1A1A" />
              <rect x="-18" y="-84" width="36" height="12" rx="3" fill="#1A1A1A" />
              <circle cx="0" cy="-84" r="4" fill="#2A2A2A" />
              <line x1="0" y1="-84" x2="28" y2="-74" stroke="#F9A825" strokeWidth="2.5" />
              <line x1="28" y1="-74" x2="32" y2="-58" stroke="#F9A825" strokeWidth="3" />
              <circle cx="32" cy="-56" r="5" fill="#F9A825" />
              <rect x="-12" y="-82" width="16" height="4" rx="1" fill="#FFF" opacity="0.06" />
            </>
          )}

          {/* Eyebrows */}
          <path d={`M-12,-48 Q-7,-${stage === 1 ? 51 : 52} -2,-48`} fill="none" stroke={s.hair} strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M2,-48 Q7,-${stage === 1 ? 51 : 52} 12,-48`} fill="none" stroke={s.hair} strokeWidth="2.5" strokeLinecap="round" />

          {/* DETAILED EYES */}
          {/* Left eye */}
          <ellipse cx="-10" cy="-38" rx="7" ry="6" fill={`url(#${id}-sclera)`} />
          <ellipse cx="-10" cy="-38" rx="6.5" ry="5.5" fill="none" stroke="#D0C8C8" strokeWidth="0.5" />
          <circle cx="-9" cy="-37" r="4.5" fill={`url(#${id}-iris)`} />
          <circle cx="-9" cy="-37" r="2.2" fill="#050505" />
          <circle cx="-9" cy="-37" r="4" fill={`url(#${id}-cornea)`} />
          <ellipse cx="-7.5" cy="-39.5" rx="1.5" ry="1.2" fill="#FFF" />
          <circle cx="-10.5" cy="-35.5" r="0.7" fill="#FFF" opacity="0.6" />
          <path d="M-16,-40 Q-10,-42.5 -4,-40" fill="none" stroke={s.skinShadow} strokeWidth="1.2" opacity="0.35" />
          <path d="M-16,-39 L-15,-42" stroke={s.hair} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M-12,-41 L-12,-44" stroke={s.hair} strokeWidth="1.2" strokeLinecap="round" />

          {/* Right eye */}
          <ellipse cx="10" cy="-38" rx="7" ry="6" fill={`url(#${id}-sclera)`} />
          <ellipse cx="10" cy="-38" rx="6.5" ry="5.5" fill="none" stroke="#D0C8C8" strokeWidth="0.5" />
          <circle cx="9" cy="-37" r="4.5" fill={`url(#${id}-iris)`} />
          <circle cx="9" cy="-37" r="2.2" fill="#050505" />
          <circle cx="9" cy="-37" r="4" fill={`url(#${id}-cornea)`} />
          <ellipse cx="10.5" cy="-39.5" rx="1.5" ry="1.2" fill="#FFF" />
          <circle cx="7.5" cy="-35.5" r="0.7" fill="#FFF" opacity="0.6" />
          <path d="M4,-40 Q10,-42.5 16,-40" fill="none" stroke={s.skinShadow} strokeWidth="1.2" opacity="0.35" />
          <path d="M16,-39 L15,-42" stroke={s.hair} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12,-41 L12,-44" stroke={s.hair} strokeWidth="1.2" strokeLinecap="round" />

          {/* Nose */}
          <path d="M-2,-28 Q0,-26 2,-28" fill="none" stroke={s.skinShadow} strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
          <ellipse cx="-2.5" cy="-27" rx="1.5" ry="1.2" fill={s.skinShadow} opacity="0.2" />
          <ellipse cx="2.5" cy="-27" rx="1.5" ry="1.2" fill={s.skinShadow} opacity="0.2" />
          <ellipse cx="0" cy="-30" rx="2.5" ry="1.2" fill={s.skinHighlight} opacity="0.3" />

          {/* Mouth */}
          <path d="M-6,-20 Q-4,-18 0,-19 Q4,-18 6,-20" fill={s.lipColor} opacity="0.55" />
          <path d="M-5,-20 Q0,-15 5,-20" fill="none" stroke={s.lipColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
          <ellipse cx="0" cy="-19" rx="2.5" ry="1" fill="#FFF" opacity="0.12" />

          {/* Cheek blush */}
          <ellipse cx="-14" cy="-28" rx="6" ry="3.5" fill="#E08080" opacity={stage === 2 ? 0.4 : 0.25} />
          <ellipse cx="14" cy="-28" rx="6" ry="3.5" fill="#E08080" opacity={stage === 2 ? 0.4 : 0.25} />

          {/* Forehead highlight */}
          <ellipse cx="0" cy="-52" rx="10" ry="5" fill="#FFF" opacity="0.06" />

          {/* Accessories */}
          {stage === 2 && (
            <>
              <rect x="-32" y="6" width="12" height="20" rx="5" fill="#C62828" />
              <rect x="-31" y="7" width="10" height="6" rx="2" fill="#E53935" />
              <path d="M-20,4 L-20,12" stroke="#F9A825" strokeWidth="2.5" />
              <path d="M20,4 L20,12" stroke="#F9A825" strokeWidth="2.5" />
            </>
          )}
          {stage === 3 && (
            <>
              <rect x="20" y="4" width="18" height="28" rx="6" fill="#C62828" />
              <rect x="21" y="5" width="16" height="12" rx="4" fill="#E53935" />
              <rect x="26" y="18" width="8" height="8" rx="2" fill="#B71C1C" />
              <path d="M24,4 L24,-2 Q24,-4 26,-4 L26,4" fill="none" stroke="#8B1A1A" strokeWidth="2" />
            </>
          )}
          {stage === 4 && (
            <g transform="rotate(-18, 28, 12)">
              <rect x="24" y="4" width="16" height="8" rx="4" fill="#FFF5E1" />
              <rect x="24" y="4" width="16" height="8" rx="4" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
              <rect x="30" y="2" width="5" height="12" rx="1" fill="#C62828" opacity="0.75" />
            </g>
          )}
        </g>
      )}
    </g>
  );
}
