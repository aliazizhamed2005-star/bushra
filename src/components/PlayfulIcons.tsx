import React from 'react';

export function KurdistanFlagIcon({ className = 'w-12 h-8' }: { className?: string }) {
  // 21 golden sun rays centered on the white stripe
  const rays = Array.from({ length: 21 }, (_, i) => {
    const angle = (i * 360) / 21;
    const rad = (angle * Math.PI) / 180;
    const radPrev = ((angle - 6.5) * Math.PI) / 180;
    const radNext = ((angle + 6.5) * Math.PI) / 180;
    const cx = 45;
    const cy = 30;
    const rOuter = 13.5;
    const rInner = 6.5;
    const x1 = cx + rOuter * Math.cos(rad);
    const y1 = cy + rOuter * Math.sin(rad);
    const x2 = cx + rInner * Math.cos(radPrev);
    const y2 = cy + rInner * Math.sin(radPrev);
    const x3 = cx + rInner * Math.cos(radNext);
    const y3 = cy + rInner * Math.sin(radNext);
    return `${x2.toFixed(2)},${y2.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)} ${x3.toFixed(2)},${y3.toFixed(2)}`;
  });

  return (
    <svg
      viewBox="0 0 90 60"
      className={`${className} rounded-md shadow-md overflow-hidden select-none`}
      aria-label="Ala Kurdistanê"
      role="img"
    >
      <rect width="90" height="20" y="0" fill="#ED2024" />
      <rect width="90" height="20" y="20" fill="#FFFFFF" />
      <rect width="90" height="20" y="40" fill="#278E43" />
      {rays.map((points, idx) => (
        <polygon key={idx} points={points} fill="#FEBD11" />
      ))}
      <circle cx="45" cy="30" r="7" fill="#FEBD11" />
      <rect width="90" height="60" fill="url(#flagSheen)" opacity="0.22" />
      <defs>
        <linearGradient id="flagSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Heart3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <defs>
        <radialGradient id="heartGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FF9AD5" />
          <stop offset="45%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#BE123C" />
        </radialGradient>
      </defs>
      <path
        d="M32 56C32 56 8 40.5 8 22.5C8 14.5 14.2 8.5 21.8 8.5C26.4 8.5 30.2 10.9 32 14.4C33.8 10.9 37.6 8.5 42.2 8.5C49.8 8.5 56 14.5 56 22.5C56 40.5 32 56 32 56Z"
        fill="url(#heartGrad)"
      />
      <ellipse cx="21" cy="20" rx="5.5" ry="3.2" transform="rotate(-28 21 20)" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
}

export function Star3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path
        d="M32 6L39.6 21.5L56.7 24L44.3 36L47.2 53L32 45L16.8 53L19.7 36L7.3 24L24.4 21.5L32 6Z"
        fill="url(#starGrad)"
        stroke="#FEF08A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="24" r="3" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
}

export function Cloud3DIcon({ className = 'w-12 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 48" className={`${className} drop-shadow-md`} aria-hidden="true">
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
      </defs>
      <path
        d="M18 40H54C61.2 40 67 34.4 67 27.5C67 21 61.9 15.7 55.4 15.1C53.2 8.1 46.7 3 39 3C29.8 3 22.3 10.2 21.8 19.2C14.1 19.6 8 25.8 8 33.4C8 37.1 12.5 40 18 40Z"
        fill="url(#cloudGrad)"
      />
      <ellipse cx="34" cy="14" rx="7" ry="4" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

export function Question3DIcon({ className = 'w-9 h-9', isAlert = false }: { className?: string; isAlert?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <defs>
        <linearGradient id={isAlert ? 'qAlertGrad' : 'qGrad'} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isAlert ? '#FB7185' : '#60A5FA'} />
          <stop offset="100%" stopColor={isAlert ? '#EF4444' : '#7C3AED'} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill={`url(#${isAlert ? 'qAlertGrad' : 'qGrad'})`} />
      <circle cx="24" cy="20" r="6" fill="#FFFFFF" opacity="0.22" />
      {isAlert ? (
        <>
          <rect x="29" y="15" width="6" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="32" cy="45" r="3.6" fill="#FFFFFF" />
        </>
      ) : (
        <>
          <path
            d="M24 24.5C24 20 27.6 17 32.3 17C36.8 17 40 19.9 40 23.8C40 27.3 37.5 29.1 34.7 30.8C32.4 32.2 31.8 33.5 31.8 36.2V37.5"
            stroke="#FFFFFF"
            strokeWidth="5.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="32" cy="45.5" r="3.4" fill="#FFFFFF" />
        </>
      )}
    </svg>
  );
}

export function Smiley3DIcon({
  className = 'w-10 h-10',
  mood = 'happy',
}: {
  className?: string;
  mood?: 'happy' | 'wink' | 'laugh' | 'love';
}) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <defs>
        <radialGradient id="smileGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="65%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#smileGrad)" />
      <ellipse cx="22" cy="18" rx="6" ry="3.5" transform="rotate(-20 22 18)" fill="#FFFFFF" opacity="0.55" />
      {/* Cheeks */}
      <circle cx="17" cy="36" r="3.8" fill="#FB7185" opacity="0.55" />
      <circle cx="47" cy="36" r="3.8" fill="#FB7185" opacity="0.55" />
      {/* Eyes */}
      {mood === 'love' ? (
        <>
          <path d="M18 26C18 23.8 20.5 23 22 25C23.5 23 26 23.8 26 26C26 28.5 22 31 22 31C22 31 18 28.5 18 26Z" fill="#EF4444" />
          <path d="M38 26C38 23.8 40.5 23 42 25C43.5 23 46 23.8 46 26C46 28.5 42 31 42 31C42 31 38 28.5 38 26Z" fill="#EF4444" />
        </>
      ) : mood === 'wink' ? (
        <>
          <circle cx="22" cy="26" r="3.4" fill="#1E1B4B" />
          <path d="M37 26.5C38.5 23.5 43.5 23.5 45 26.5" stroke="#1E1B4B" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'laugh' ? (
        <>
          <path d="M17 26L25 24L17 22" stroke="#1E1B4B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M47 26L39 24L47 22" stroke="#1E1B4B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="22" cy="26" r="3.4" fill="#1E1B4B" />
          <circle cx="42" cy="26" r="3.4" fill="#1E1B4B" />
        </>
      )}
      {/* Mouth */}
      {mood === 'laugh' ? (
        <path d="M20 35C22 45 42 45 44 35Z" fill="#1E1B4B" />
      ) : (
        <path
          d="M21 36C24 43 40 43 43 36"
          stroke="#1E1B4B"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

export function Flower3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      {petals.map((deg, idx) => (
        <ellipse
          key={deg}
          cx="32"
          cy="16"
          rx="8"
          ry="12"
          fill={idx % 2 === 0 ? '#F472B6' : '#C084FC'}
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="9.5" fill="#FACC15" stroke="#FEF08A" strokeWidth="2" />
      <circle cx="29" cy="29" r="2.2" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

export function Warning3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <defs>
        <linearGradient id="warnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <path
        d="M28.2 10.6C29.9 7.6 34.1 7.6 35.8 10.6L56.2 46.4C57.9 49.4 55.8 53 52.4 53H11.6C8.2 53 6.1 49.4 7.8 46.4L28.2 10.6Z"
        fill="url(#warnGrad)"
        stroke="#FFE4E6"
        strokeWidth="2.5"
      />
      <rect x="29.5" y="22" width="5" height="15" rx="2.5" fill="#FFFFFF" />
      <circle cx="32" cy="43.5" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

export function MiniComputer3DIcon({ className = 'w-10 h-10', dizzy = false }: { className?: string; dizzy?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <rect x="8" y="10" width="48" height="34" rx="8" fill="#60A5FA" stroke="#DBEAFE" strokeWidth="2" />
      <rect x="14" y="16" width="36" height="22" rx="4" fill="#1E1B4B" />
      {dizzy ? (
        <>
          <text x="21" y="31" fill="#F472B6" fontSize="12" fontWeight="bold">x</text>
          <text x="37" y="31" fill="#F472B6" fontSize="12" fontWeight="bold">x</text>
        </>
      ) : (
        <>
          <circle cx="25" cy="26" r="2.6" fill="#F472B6" />
          <circle cx="39" cy="26" r="2.6" fill="#F472B6" />
          <path d="M27 32C29 34 35 34 37 32" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}
      <rect x="24" y="44" width="16" height="5" rx="2" fill="#93C5FD" />
      <rect x="16" y="49" width="32" height="5" rx="2.5" fill="#C084FC" />
    </svg>
  );
}

export function KurdishGeometricPattern({ className = 'w-full h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 24" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <pattern id="kurdishMotif" width="40" height="24" patternUnits="userSpaceOnUse">
          <polygon points="20,2 30,12 20,22 10,12" fill="none" stroke="#EF4444" strokeWidth="2" />
          <polygon points="20,6 25,12 20,18 15,12" fill="#FEBD11" />
          <circle cx="0" cy="12" r="3" fill="#278E43" />
          <circle cx="40" cy="12" r="3" fill="#278E43" />
          <path d="M0,2 L10,12 L0,22" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.65" />
          <path d="M40,2 L30,12 L40,22" fill="none" stroke="#EC4899" strokeWidth="1.5" opacity="0.65" />
        </pattern>
      </defs>
      <rect width="400" height="24" fill="url(#kurdishMotif)" />
    </svg>
  );
}

export function OnionIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      {/* Green sprout */}
      <path d="M32 6C29 12 29 16 32 18C35 16 35 12 32 6Z" fill="#4ADE80" />
      <path d="M27 9C26 14 28 17 31 18" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Purple-pink onion bulb */}
      <path
        d="M32 15C20 18 12 28 12 39C12 49 21 56 32 56C43 56 52 49 52 39C52 28 44 18 32 15Z"
        fill="#C084FC"
        stroke="#A855F7"
        strokeWidth="2.5"
      />
      <path d="M32 16C25 25 25 46 32 55" stroke="#E9D5FF" strokeWidth="2" fill="none" opacity="0.65" />
      <path d="M32 16C39 25 39 46 32 55" stroke="#E9D5FF" strokeWidth="2" fill="none" opacity="0.65" />
      {/* Funny goofy eyes */}
      <circle cx="25" cy="37" r="3" fill="#1E1B4B" />
      <circle cx="39" cy="37" r="3" fill="#1E1B4B" />
      <path d="M26 45Q32 41 38 45" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PotatoIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} drop-shadow-md`} aria-hidden="true">
      <ellipse
        cx="32"
        cy="34"
        rx="22"
        ry="17"
        transform="rotate(-10 32 34)"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="2.5"
      />
      <circle cx="20" cy="28" r="2" fill="#B45309" opacity="0.5" />
      <circle cx="44" cy="40" r="2.2" fill="#B45309" opacity="0.5" />
      {/* Derpy eyes */}
      <circle cx="25" cy="33" r="3.2" fill="#FFFFFF" />
      <circle cx="25" cy="33" r="1.6" fill="#1E1B4B" />
      <circle cx="38" cy="31" r="3.2" fill="#FFFFFF" />
      <circle cx="38" cy="31" r="1.6" fill="#1E1B4B" />
      {/* Wiggly mouth */}
      <path d="M26 41Q32 45 38 40" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BasketIcon({ className = 'w-24 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 68" className={`${className} drop-shadow-lg`} aria-hidden="true">
      {/* Rim */}
      <rect x="6" y="10" width="108" height="14" rx="7" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
      {/* Basket body */}
      <path
        d="M14 24H106L96 58C94.5 62 90 64 85 64H35C30 64 25.5 62 24 58L14 24Z"
        fill="#A855F7"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
      {/* Cute woven stripes */}
      <line x1="28" y1="36" x2="92" y2="36" stroke="#FBCFE8" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
      <line x1="32" y1="49" x2="88" y2="49" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      {/* Cute smiling face on basket */}
      <circle cx="48" cy="41" r="3" fill="#FFFFFF" />
      <circle cx="72" cy="41" r="3" fill="#FFFFFF" />
      <path d="M54 45Q60 51 66 45" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

