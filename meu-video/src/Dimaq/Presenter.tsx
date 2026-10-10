import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import timing from "./timing.json";

const SKIN = "#D29B78";
const SKIN_SHADE = "#B98262";
const HAIR = "#4A3A30";
const BEARD = "rgba(90,70,60,0.35)";

// Illustrated presenter (hard hat, Dimaq colours) whose mouth follows the narration loudness.
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
          {/* Body: work shirt with a reflective vest */}
          <path d="M50 400 C60 318 115 292 200 292 C285 292 340 318 350 400 Z" fill="#3E5C76" />
          <path d="M168 294 L200 340 L232 294 Z" fill="#2F4A61" />
          <path d="M95 330 L150 300 L175 400 L110 400 Z" fill="#F5A500" />
          <path d="M305 330 L250 300 L225 400 L290 400 Z" fill="#F5A500" />
          <rect x="112" y="352" width="58" height="10" fill="#E8E8E8" transform="rotate(-8 140 357)" />
          <rect x="230" y="352" width="58" height="10" fill="#E8E8E8" transform="rotate(8 260 357)" />
          <rect x="180" y="245" width="40" height="55" rx="16" fill={SKIN_SHADE} />
          <g transform={`rotate(${tilt} 200 270) translate(0 ${nod})`}>
            {/* Ears */}
            <ellipse cx="130" cy="200" rx="12" ry="18" fill={SKIN_SHADE} />
            <ellipse cx="270" cy="200" rx="12" ry="18" fill={SKIN_SHADE} />
            {/* Face */}
            <path
              d="M130 175 C130 120 165 105 200 105 C235 105 270 120 270 175 L268 215 C262 262 232 282 200 282 C168 282 138 262 132 215 Z"
              fill={SKIN}
            />
            {/* Short hair at the temples and stubble */}
            <path d="M131 178 C129 160 132 150 138 145 L140 182 Z" fill={HAIR} />
            <path d="M269 178 C271 160 268 150 262 145 L260 182 Z" fill={HAIR} />
            <path
              d="M138 215 C142 258 170 280 200 280 C230 280 258 258 262 215 C250 232 232 238 200 238 C168 238 150 232 138 215 Z"
              fill={BEARD}
            />
            {/* Hard hat */}
            <path
              d="M118 158 C118 92 160 62 200 62 C240 62 282 92 282 158 Z"
              fill="#F6F4EF"
            />
            <path d="M196 64 L204 64 L206 158 L194 158 Z" fill="#E4E0D8" />
            <rect x="104" y="150" width="192" height="18" rx="9" fill="#ECE8E0" />
            <rect x="122" y="128" width="156" height="12" fill="#F5A500" />
            <circle cx="200" cy="105" r="13" fill="#1F1F1F" />
            <text x="200" y="110" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F5A500" fontFamily="Arial">
              D
            </text>
            {/* Brows */}
            <path
              d={`M158 ${184 - brow} Q174 ${176 - brow} 190 ${183 - brow}`}
              stroke={HAIR}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M210 ${183 - brow} Q226 ${176 - brow} 242 ${184 - brow}`}
              stroke={HAIR}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <g transform={`translate(0 202) scale(1 ${blink}) translate(0 -202)`}>
              <ellipse cx="175" cy="202" rx="10" ry="10" fill="#FBFAF7" />
              <ellipse cx="225" cy="202" rx="10" ry="10" fill="#FBFAF7" />
              <circle cx="176" cy="203" r="6.5" fill="#3B2418" />
              <circle cx="226" cy="203" r="6.5" fill="#3B2418" />
              <circle cx="178" cy="200" r="2" fill="#FFFFFF" />
              <circle cx="228" cy="200" r="2" fill="#FFFFFF" />
            </g>
            {/* Glasses */}
            <g stroke="#2A2A2A" strokeWidth="4" fill="none">
              <rect x="154" y="186" width="42" height="32" rx="10" />
              <rect x="204" y="186" width="42" height="32" rx="10" />
              <path d="M196 199 L204 199" />
            </g>
            {/* Nose and moustache */}
            <path d="M200 212 Q193 232 202 236" stroke={SKIN_SHADE} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M174 246 Q200 236 226 246 Q212 250 200 247 Q188 250 174 246 Z" fill="rgba(90,70,60,0.75)" />
            {/* Mouth */}
            {open < 0.08 ? (
              <path d="M182 256 Q200 266 218 256" stroke="#7A3A32" strokeWidth="5" fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <ellipse cx="200" cy={258 + open * 4} rx={15 + open * 4} ry={3 + open * 11} fill="#5E2420" />
                <ellipse cx="200" cy={251 + open * 1} rx={11 + open * 3} ry={2.5} fill="#FBFAF7" />
              </g>
            )}
          </g>
        </g>
      </g>
      <circle cx="200" cy="200" r="197" fill="none" stroke="#F4F2EE" strokeWidth="6" />
    </svg>
  );
};
