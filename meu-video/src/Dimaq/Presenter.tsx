import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import timing from "./timing.json";

const SKIN = "#C98E6B";
const SKIN_SHADE = "#B37A58";
const HAIR = "#2E1B12";

// Illustrated presenter whose mouth follows the narration loudness.
export const Presenter: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const m = timing.mouth[Math.min(frame, timing.mouth.length - 1)] ?? 0;
  const recent =
    timing.mouth
      .slice(Math.max(0, frame - 20), frame + 1)
      .reduce((a, b) => a + b, 0) / 21;

  const blinkPhase = frame % 110;
  const blink = blinkPhase < 4 ? interpolate(blinkPhase, [0, 2, 4], [1, 0.1, 1]) : 1;
  const tilt = Math.sin(frame / 37) * 2.5 + Math.sin(frame / 11) * recent * 2;
  const nod = Math.sin(frame / 7) * recent * 3;
  const brow = recent * 4;
  const open = m;

  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <defs>
        <radialGradient id="presenter-bg" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FFD27A" />
          <stop offset="100%" stopColor="#F5A500" />
        </radialGradient>
        <clipPath id="presenter-clip">
          <circle cx="200" cy="200" r="200" />
        </clipPath>
      </defs>
      <g clipPath="url(#presenter-clip)">
        <rect width="400" height="400" fill="url(#presenter-bg)" />
        <g transform={`translate(0 ${-recent * 2})`}>
          {/* Body */}
          <path d="M60 400 C70 320 120 290 200 290 C280 290 330 320 340 400 Z" fill="#262626" />
          <path d="M165 292 L200 360 L235 292 Z" fill="#F4F2EE" />
          <path d="M150 296 L200 400 L178 300 Z" fill="#1A1A1A" />
          <path d="M250 296 L200 400 L222 300 Z" fill="#1A1A1A" />
          <circle cx="262" cy="335" r="7" fill="#F5A500" />
          <rect x="178" y="245" width="44" height="55" rx="18" fill={SKIN_SHADE} />
          <g transform={`rotate(${tilt} 200 270) translate(0 ${nod})`}>
            {/* Hair back */}
            <ellipse cx="200" cy="185" rx="96" ry="112" fill={HAIR} />
            <path d="M108 190 C100 250 110 290 140 300 L150 200 Z" fill={HAIR} />
            <path d="M292 190 C300 250 290 290 260 300 L250 200 Z" fill={HAIR} />
            {/* Ears */}
            <ellipse cx="128" cy="195" rx="12" ry="18" fill={SKIN_SHADE} />
            <ellipse cx="272" cy="195" rx="12" ry="18" fill={SKIN_SHADE} />
            <circle cx="128" cy="218" r="5" fill="#F5A500" />
            <circle cx="272" cy="218" r="5" fill="#F5A500" />
            {/* Face */}
            <ellipse cx="200" cy="190" rx="72" ry="86" fill={SKIN} />
            {/* Fringe */}
            <path
              d="M126 170 C130 105 175 88 215 95 C255 100 280 130 276 170 C255 140 225 125 190 130 C165 133 140 148 126 170 Z"
              fill={HAIR}
            />
            {/* Brows */}
            <path
              d={`M160 ${158 - brow} Q175 ${150 - brow} 190 ${157 - brow}`}
              stroke={HAIR}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M210 ${157 - brow} Q225 ${150 - brow} 240 ${158 - brow}`}
              stroke={HAIR}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <g transform={`translate(0 182) scale(1 ${blink}) translate(0 -182)`}>
              <ellipse cx="175" cy="182" rx="11" ry="12" fill="#FBFAF7" />
              <ellipse cx="225" cy="182" rx="11" ry="12" fill="#FBFAF7" />
              <circle cx="176" cy="183" r="7" fill="#3B2418" />
              <circle cx="226" cy="183" r="7" fill="#3B2418" />
              <circle cx="178" cy="180" r="2.2" fill="#FFFFFF" />
              <circle cx="228" cy="180" r="2.2" fill="#FFFFFF" />
            </g>
            {/* Nose and cheeks */}
            <path d="M200 192 Q194 214 201 218" stroke={SKIN_SHADE} strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse cx="160" cy="215" rx="13" ry="7" fill="#E07A6A" opacity="0.35" />
            <ellipse cx="240" cy="215" rx="13" ry="7" fill="#E07A6A" opacity="0.35" />
            {/* Mouth */}
            {open < 0.08 ? (
              <path d="M180 236 Q200 250 220 236" stroke="#8A3A32" strokeWidth="5" fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <ellipse cx="200" cy={238 + open * 4} rx={16 + open * 5} ry={4 + open * 13} fill="#5E2420" />
                <ellipse cx="200" cy={230 + open * 1} rx={13 + open * 4} ry={3} fill="#FBFAF7" />
                <ellipse cx="200" cy={244 + open * 9} rx={9 + open * 3} ry={2 + open * 3} fill="#C25B55" />
              </g>
            )}
          </g>
        </g>
      </g>
      <circle cx="200" cy="200" r="197" fill="none" stroke="#F4F2EE" strokeWidth="6" />
    </svg>
  );
};
