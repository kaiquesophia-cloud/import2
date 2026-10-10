import { loadFont } from "@remotion/fonts";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  linearTiming,
  TransitionPresentation,
  TransitionSeries,
} from "@remotion/transitions";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Presenter } from "./Presenter";
import timing from "./timing.json";

const display = "Oswald";
const body = "Public Sans";

loadFont({
  family: display,
  url: staticFile("fonts/oswald-latin-700-normal.woff2"),
  weight: "700",
});
for (const weight of ["400", "600", "700"]) {
  loadFont({
    family: body,
    url: staticFile(`fonts/public-sans-latin-${weight}-normal.woff2`),
    weight,
  });
}

const DARK = "#1F1F1F";
const LIGHT = "#F4F2EE";
const ACCENT = "#F5A500";
const EYEBROW_ON_LIGHT = "#8A5A00";
const MUTED_ON_DARK = "#C9C4BC";
const MUTED_ON_LIGHT = "#4A4744";

const TRANSITION = 15;

const img = (name: string) => staticFile(`dimaq/${name}.png`);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const useEnter = (delay: number, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

const Rise: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Each word slides up out of a mask, one after the other.
const WordReveal: React.FC<{
  lines: React.ReactNode[][];
  delay: number;
  stagger?: number;
}> = ({ lines, delay, stagger = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let index = 0;
  return (
    <>
      {lines.map((words, l) => (
        <div key={l}>
          {words.map((w, i) => {
            const p = spring({
              frame: frame - delay - index++ * stagger,
              fps,
              config: { damping: 18, mass: 0.6 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  verticalAlign: "top",
                  paddingBottom: "0.14em",
                  marginBottom: "-0.14em",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 6}deg)`,
                  }}
                >
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </>
  );
};

const words = (text: string) => [text.split(" ")];

// Slowly moving background: glows and a drifting grid.
const Backdrop: React.FC<{ variant: "dark" | "light" | "accent" }> = ({
  variant,
}) => {
  const frame = useCurrentFrame();
  const gx = Math.sin(frame / 80) * 160;
  const gy = Math.cos(frame / 95) * 90;
  if (variant === "accent") {
    return (
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(31,31,31,0.07) 0px, rgba(31,31,31,0.07) 40px, transparent 40px, transparent 120px)",
          backgroundPosition: `${frame * 1.2}px 0px`,
        }}
      />
    );
  }
  const line =
    variant === "dark" ? "rgba(255,255,255,0.035)" : "rgba(31,31,31,0.045)";
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `${frame * 0.4}px ${frame * 0.25}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: 1250 + gx,
          top: -450 + gy,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(245,165,0,${variant === "dark" ? 0.16 : 0.13}) 0%, rgba(245,165,0,0) 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -400 - gx * 0.6,
          top: 520 - gy,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(245,165,0,${variant === "dark" ? 0.1 : 0.08}) 0%, rgba(245,165,0,0) 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{
  dark: boolean;
  children: React.ReactNode;
  accent?: boolean;
}> = ({ dark, children, accent }) => (
  <AbsoluteFill
    style={{
      backgroundColor: accent ? ACCENT : dark ? DARK : LIGHT,
      color: dark && !accent ? LIGHT : DARK,
      fontFamily: body,
      padding: "110px 128px 120px",
      flexDirection: "column",
      gap: 44,
    }}
  >
    <Backdrop variant={accent ? "accent" : dark ? "dark" : "light"} />
    {children}
  </AbsoluteFill>
);

const Heading: React.FC<{ eyebrow?: string; title: string; dark: boolean }> = ({
  eyebrow,
  title,
  dark,
}) => {
  const line = useEnter(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {eyebrow ? (
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: interpolate(line, [0, 1], [0, 56]),
              height: 5,
              backgroundColor: ACCENT,
            }}
          />
          <Rise delay={4}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: dark ? ACCENT : EYEBROW_ON_LIGHT,
              }}
            >
              {eyebrow}
            </div>
          </Rise>
        </div>
      ) : null}
      <div
        style={{
          fontFamily: display,
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        <WordReveal lines={words(title)} delay={6} />
      </div>
    </div>
  );
};

type Focus = { x: number; y: number; w: number; h: number; at: number };

// A screenshot that swings in in 3D, floats, gets a light sweep and can zoom
// into a highlighted region (x, y, w, h are fractions of the image).
const Shot: React.FC<{
  name: string;
  width: number;
  height: number;
  delay: number;
  dark: boolean;
  focus?: Focus;
  tilt?: number;
}> = ({ name, width, height, delay, dark, focus, tilt = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.9 } });
  const float = Math.sin((frame - delay) / 45) * 6;
  const shine = interpolate(frame, [delay + 12, delay + 42], [-60, 160], clamp);
  const f = focus
    ? spring({ frame: frame - focus.at, fps, config: { damping: 200 }, durationInFrames: 40 })
    : 0;
  const zoom = 1 + f * 0.32 + interpolate(frame, [delay, delay + 300], [0, 0.03], clamp);
  const origin = focus
    ? `${(focus.x + focus.w / 2) * 100}% ${(focus.y + focus.h / 2) * 100}%`
    : "50% 50%";
  const pulse = 1 + Math.sin(frame / 5) * 0.5;
  return (
    <div style={{ perspective: 1800, flexShrink: 0 }}>
      <div
        style={{
          width,
          height,
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          opacity: Math.min(1, p * 1.4),
          transform: `translateY(${float}px) rotateY(${(1 - p) * -28 * tilt}deg) rotateX(${(1 - p) * 8}deg) scale(${interpolate(p, [0, 1], [0.86, 1])})`,
          boxShadow: dark
            ? "0 40px 90px rgba(0,0,0,0.6)"
            : "0 30px 70px rgba(31,31,31,0.22)",
          border: dark ? "1px solid #3A3A3A" : "1px solid #E2DED6",
          backgroundColor: "#FBFAF7",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: origin,
          }}
        >
          <Img
            src={img(name)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          {focus ? (
            <div
              style={{
                position: "absolute",
                left: `${focus.x * 100}%`,
                top: `${focus.y * 100}%`,
                width: `${focus.w * 100}%`,
                height: `${focus.h * 100}%`,
                borderRadius: 10,
                border: `${3 + pulse}px solid ${ACCENT}`,
                boxShadow: `0 0 0 4000px rgba(20,20,20,${0.45 * f}), 0 0 30px rgba(245,165,0,${0.6 * f})`,
                opacity: f,
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${shine}%`,
            width: "30%",
            background:
              "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-15deg)",
          }}
        />
      </div>
    </div>
  );
};

const Point: React.FC<{
  delay: number;
  dark: boolean;
  children: React.ReactNode;
}> = ({ delay, dark, children }) => {
  const p = useEnter(delay);
  const bar = useEnter(delay - 4);
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div
        style={{
          width: 6,
          backgroundColor: ACCENT,
          borderRadius: 3,
          transform: `scaleY(${bar})`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          fontSize: 34,
          lineHeight: 1.4,
          color: dark ? MUTED_ON_DARK : MUTED_ON_LIGHT,
          opacity: p,
          transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Points: React.FC<{
  items: React.ReactNode[];
  dark: boolean;
  start: number;
}> = ({ items, dark, start }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 30, flex: 1 }}>
    {items.map((item, i) => (
      <Point key={i} delay={start + i * 14} dark={dark}>
        {item}
      </Point>
    ))}
  </div>
);

const Hi: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: ACCENT, fontWeight: 700 }}>{children}</span>
);
const B: React.FC<{ children: React.ReactNode; dark: boolean }> = ({
  children,
  dark,
}) => (
  <span style={{ color: dark ? LIGHT : DARK, fontWeight: 700 }}>
    {children}
  </span>
);

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CountUp: React.FC<{ value: number; delay: number }> = ({
  value,
  delay,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 40], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return <>R$ {brl(value * p)}</>;
};

type Badge = { label: string; value: number; at: number };

// Floating money badge that pops in and counts up.
const MoneyBadge: React.FC<{ badge: Badge; dark: boolean }> = ({
  badge,
  dark,
}) => {
  const frame = useCurrentFrame();
  const p = useEnter(badge.at, 12);
  return (
    <div
      style={{
        position: "absolute",
        right: 110,
        top: 120,
        transform: `scale(${p}) rotate(${(1 - p) * -8}deg) translateY(${Math.sin(frame / 20) * 4}px)`,
        backgroundColor: dark ? ACCENT : DARK,
        color: dark ? DARK : ACCENT,
        borderRadius: 20,
        padding: "18px 30px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.85 }}>
        {badge.label}
      </div>
      <div style={{ fontFamily: display, fontSize: 58, fontWeight: 700, lineHeight: 1.1 }}>
        <CountUp value={badge.value} delay={badge.at + 6} />
      </div>
    </div>
  );
};

const ScreenScene: React.FC<{
  dark: boolean;
  eyebrow: string;
  title: string;
  shot: string;
  points: React.ReactNode[];
  shotLeft?: boolean;
  focus?: Focus;
  badge?: Badge;
}> = ({ dark, eyebrow, title, shot, points, shotLeft, focus, badge }) => {
  const s = (
    <Shot
      name={shot}
      width={1040}
      height={650}
      delay={10}
      dark={dark}
      focus={focus}
      tilt={shotLeft ? -1 : 1}
    />
  );
  const p = <Points items={points} dark={dark} start={24} />;
  return (
    <Scene dark={dark}>
      <Heading eyebrow={eyebrow} title={title} dark={dark} />
      <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
        {shotLeft ? s : p}
        {shotLeft ? p : s}
      </div>
      {badge ? <MoneyBadge badge={badge} dark={dark} /> : null}
    </Scene>
  );
};

const Card: React.FC<{
  delay: number;
  dark: boolean;
  title: string;
  text: string;
  index: number;
}> = ({ delay, dark, title, text, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 } });
  const bar = spring({ frame: frame - delay - 10, fps, config: { damping: 200 } });
  return (
    <div style={{ perspective: 1200, height: "100%" }}>
      <div
        style={{
          backgroundColor: dark ? "#2A2A2A" : DARK,
          borderRadius: 18,
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          opacity: Math.min(1, p * 1.5),
          transform: `rotateX(${(1 - p) * 60}deg) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
          transformOrigin: "50% 100%",
          boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: 6,
            width: `${bar * 100}%`,
            backgroundColor: ACCENT,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 28,
            top: 14,
            fontFamily: display,
            fontSize: 64,
            fontWeight: 700,
            color: "rgba(245,165,0,0.16)",
          }}
        >
          0{index + 1}
        </div>
        <div style={{ fontSize: 38, fontWeight: 700, color: ACCENT }}>
          {title}
        </div>
        <div style={{ fontSize: 29, lineHeight: 1.4, color: "#E4DFD7" }}>
          {text}
        </div>
      </div>
    </div>
  );
};

const Cards: React.FC<{
  items: { title: string; text: string }[];
  dark: boolean;
  start: number;
  columns: number;
}> = ({ items, dark, start, columns }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 28,
    }}
  >
    {items.map((c, i) => (
      <Card
        key={c.title}
        delay={start + i * 7}
        dark={dark}
        title={c.title}
        text={c.text}
        index={i}
      />
    ))}
  </div>
);

const Divider: React.FC<{
  eyebrow: string;
  title: string;
  text: string;
  stats?: { label: string; value: number }[];
}> = ({ eyebrow, title, text, stats }) => {
  const frame = useCurrentFrame();
  const p = useEnter(0);
  return (
    <Scene dark accent>
      <div
        style={{
          position: "absolute",
          right: -60,
          bottom: -80,
          fontFamily: display,
          fontSize: 420,
          fontWeight: 700,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "3px rgba(31,31,31,0.14)",
          transform: `translateX(${-frame * 1.5}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            width: interpolate(p, [0, 1], [0, 220]),
            height: 10,
            backgroundColor: DARK,
          }}
        />
        <Rise delay={4}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>
            {eyebrow}
          </div>
        </Rise>
        <div
          style={{
            fontFamily: display,
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 1500,
          }}
        >
          <WordReveal lines={words(title)} delay={8} stagger={2} />
        </div>
        {stats ? (
          <div style={{ display: "flex", gap: 28, marginTop: 10 }}>
            {stats.map((s, i) => (
              <Rise key={s.label} delay={22 + i * 6}>
                <div
                  style={{
                    backgroundColor: DARK,
                    color: ACCENT,
                    borderRadius: 16,
                    padding: "18px 30px",
                  }}
                >
                  <div style={{ fontFamily: display, fontSize: 60, fontWeight: 700 }}>
                    <CountUp value={s.value} delay={24 + i * 6} />
                  </div>
                  <div style={{ fontSize: 24, color: "#E4DFD7" }}>{s.label}</div>
                </div>
              </Rise>
            ))}
          </div>
        ) : (
          <Rise delay={18}>
            <div style={{ fontSize: 38, lineHeight: 1.4, maxWidth: 1400 }}>
              {text}
            </div>
          </Rise>
        )}
      </div>
    </Scene>
  );
};

const TableRow: React.FC<{
  delay: number;
  cells: string[];
  widths: string;
  shade: boolean;
}> = ({ delay, cells, widths, shade }) => {
  const p = useEnter(delay);
  const sweep = useEnter(delay + 4);
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: widths,
        fontSize: 29,
        padding: "16px 28px",
        backgroundColor: shade ? "#EFEBE4" : "#FBFAF7",
        color: DARK,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: ACCENT,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${interpolate(sweep, [0, 1], [-30, 110])}%`,
          width: "25%",
          background:
            "linear-gradient(90deg, rgba(245,165,0,0) 0%, rgba(245,165,0,0.18) 50%, rgba(245,165,0,0) 100%)",
        }}
      />
      {cells.map((c, j) => (
        <div
          key={j}
          style={{
            fontWeight: j === 0 ? 700 : 400,
            color: j === 0 ? DARK : MUTED_ON_LIGHT,
            paddingRight: 24,
            position: "relative",
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
};

const Table: React.FC<{
  head: string[];
  rows: string[][];
  start: number;
  widths: string;
}> = ({ head, rows, start, widths }) => {
  const p = useEnter(start - 6);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(31,31,31,0.12)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: widths,
          backgroundColor: DARK,
          color: ACCENT,
          fontWeight: 700,
          fontSize: 30,
          padding: "18px 28px",
          transform: `scaleX(${interpolate(p, [0, 1], [0.6, 1])})`,
          opacity: p,
        }}
      >
        {head.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => (
        <TableRow
          key={r[0]}
          delay={start + i * 9}
          cells={r}
          widths={widths}
          shade={i % 2 === 1}
        />
      ))}
    </div>
  );
};

const Rings: React.FC<{ cx: number; cy: number; base: number }> = ({
  cx,
  cy,
  base,
}) => {
  const frame = useCurrentFrame();
  const p = useEnter(4);
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", left: 0, top: 0, opacity: p }}
    >
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={base + i * 46 + Math.sin(frame / 20 + i) * 4}
          fill="none"
          stroke={ACCENT}
          strokeOpacity={0.5 - i * 0.14}
          strokeWidth={i === 0 ? 3 : 2}
          strokeDasharray={i === 1 ? "14 18" : i === 2 ? "4 14" : undefined}
          transform={`rotate(${frame * (i % 2 ? -0.6 : 0.4)} ${cx} ${cy})`}
        />
      ))}
    </svg>
  );
};

const LogoShine: React.FC<{ width: number; delay: number }> = ({
  width,
  delay,
}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [delay, delay + 30], [-40, 140], clamp);
  return (
    <div style={{ position: "relative", width, overflow: "hidden" }}>
      <Img src={img("logo")} style={{ width, display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${x}%`,
          width: "25%",
          background:
            "linear-gradient(100deg, rgba(31,31,31,0) 0%, rgba(245,165,0,0.55) 50%, rgba(31,31,31,0) 100%)",
          mixBlendMode: "screen",
          transform: "skewX(-15deg)",
        }}
      />
    </div>
  );
};

const Intro: React.FC = () => {
  const p = useEnter(0);
  return (
    <Scene dark>
      <Rings cx={1650} cy={540} base={240} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 24,
          backgroundColor: ACCENT,
          transform: `scaleY(${p})`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <Rise delay={0}>
          <LogoShine width={460} delay={20} />
        </Rise>
        <Rise delay={10}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 6,
              color: ACCENT,
            }}
          >
            APRESENTAÇÃO DO NOVO SISTEMA
          </div>
        </Rise>
        <div
          style={{
            fontFamily: display,
            fontSize: 128,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          <WordReveal
            delay={16}
            lines={[
              ["Cada", "diária", "cobrada."],
              ["Cada", "máquina", <span key="r" style={{ color: ACCENT }}>rendendo.</span>],
            ]}
          />
        </div>
        <Rise delay={40}>
          <div style={{ fontSize: 36, color: MUTED_ON_DARK, maxWidth: 1200 }}>
            Locação, medição, ordens de serviço, financeiro e site em um só
            lugar, feitos sob medida para a Dimaq.
          </div>
        </Rise>
      </div>
    </Scene>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useEnter(0, 12);
  return (
    <Scene dark>
      <Rings cx={960} cy={500} base={330} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          textAlign: "center",
        }}
      >
        <div style={{ transform: `scale(${logo * (1 + Math.sin(frame / 30) * 0.015)})` }}>
          <LogoShine width={520} delay={14} />
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          <WordReveal
            delay={10}
            lines={[
              ["Gestão", "de", "locações"],
              [
                <span key="a" style={{ color: ACCENT }}>em</span>,
                <span key="b" style={{ color: ACCENT }}>um</span>,
                <span key="c" style={{ color: ACCENT }}>só</span>,
                <span key="d" style={{ color: ACCENT }}>lugar</span>,
              ],
            ]}
          />
        </div>
        <Rise delay={32}>
          <div style={{ fontSize: 32, color: "#A8A29A" }}>
            Desenvolvido por{" "}
            <span style={{ color: LIGHT, fontWeight: 700 }}>SEO AMPLIFY</span>
          </div>
        </Rise>
      </div>
    </Scene>
  );
};

const scenes: { duration: number; node: React.ReactNode }[] = [
  { duration: 180, node: <Intro /> },
  {
    duration: 270,
    node: (
      <Scene dark={false}>
        <Heading
          eyebrow="O desafio"
          title="O custo escondido do papel e da planilha"
          dark={false}
        />
        <Table
          widths="1.1fr 1.3fr 1fr"
          head={["Situação", "O que acontece", "Impacto"]}
          start={14}
          rows={[
            ["Reserva dupla", "Cliente fica sem a máquina", "Pedido perdido"],
            [
              "Diária de atraso esquecida",
              "Contrato fecha sem o excedente",
              "Receita que não entra",
            ],
            ["Avaria sem registro", "A Dimaq paga o conserto", "Custo que era do cliente"],
            ["Preventiva atrasada", "Máquina quebra na obra", "Parada e frete extra"],
            ["Cobrança atrasada", "Vencidos acumulam sem alerta", "Caixa apertado"],
            ["Orçamento demorado", "Cliente fecha com outro", "Venda perdida"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="A solução" title="Um sistema, toda a operação" dark={false} />
        <Cards
          columns={3}
          start={12}
          dark={false}
          items={[
            { title: "Locação", text: "Orçamento, reserva, entrega, renovação e devolução." },
            { title: "Medição", text: "Cobrança pro-rata por ciclo, opcional por contrato." },
            { title: "Ordens de serviço", text: "Preventiva por horímetro, corretiva e revisão." },
            { title: "Vendas e estoque", text: "Peças e produtos com baixa automática." },
            { title: "Financeiro e NF", text: "Receber, pagar, juros, recibos e dados da nota." },
            { title: "Site e cliente", text: "Catálogo, pedido de orçamento e área do cliente." },
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark
        eyebrow="Painel"
        title="O dia inteiro numa tela"
        shot="painel"
        focus={{ x: 0.19, y: 0.17, w: 0.79, h: 0.28, at: 80 }}
        badge={{ label: "Vencido a receber, em destaque", value: 1315, at: 120 }}
        points={[
          <>Cada locação vira um cartão com <Hi>contagem regressiva</Hi>.</>,
          <>Atrasos, devoluções do dia, pedidos do site e vencidos em indicadores.</>,
          <>Renovar, devolver ou chamar no WhatsApp direto do cartão.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark={false}
        shotLeft
        eyebrow="Nova locação"
        title="Preço certo, sem conflito de reserva"
        shot="novaloc"
        focus={{ x: 0.73, y: 0.46, w: 0.25, h: 0.18, at: 90 }}
        points={[
          <><B dark={false}>Disponibilidade ao vivo</B> por peça ou por quantidade.</>,
          <><B dark={false}>Melhor tarifa automática:</B> 10 dias = 1 semana + 3 diárias.</>,
          <>Sem estoque no período, só salva como orçamento: <B dark={false}>reserva dupla nunca mais</B>.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading title="Quadro e agenda: a frota à vista" dark={false} />
        <div style={{ display: "flex", gap: 64 }}>
          {[
            { shot: "quadro", label: "Quadro:", text: "arraste o cartão e o sistema faz a reserva, a entrega ou a devolução." },
            { shot: "agenda", label: "Agenda:", text: "cada equipamento numa linha do tempo; clique num dia livre para orçar." },
          ].map((x, i) => (
            <div key={x.shot} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
              <Shot name={x.shot} width={800} height={500} delay={8 + i * 10} dark={false} />
              <Rise delay={24 + i * 10}>
                <div style={{ fontSize: 30, lineHeight: 1.4, color: MUTED_ON_LIGHT }}>
                  <B dark={false}>{x.label}</B> {x.text}
                </div>
              </Rise>
            </div>
          ))}
        </div>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark
        eyebrow="Devolução"
        title="Nenhuma diária esquecida"
        shot="devolucao"
        focus={{ x: 0.17, y: 0.64, w: 0.66, h: 0.15, at: 80 }}
        badge={{ label: "2 diárias de atraso cobradas", value: 660, at: 110 }}
        points={[
          <><Hi>Devolução parcial:</Hi> voltam 50 de 60 andaimes e o contrato segue com o resto.</>,
          <><Hi>Atraso</Hi> calculado e lançado sozinho: 2 dias = R$ 660,00.</>,
          <><Hi>Avaria</Hi> vira cobrança e abre a OS de revisão na hora.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark={false}
        shotLeft
        eyebrow="Cobrança por medição"
        title="Pro-rata: cobra só o que ficou na obra"
        shot="medicao"
        focus={{ x: 0.17, y: 0.41, w: 0.66, h: 0.11, at: 80 }}
        badge={{ label: "Medição pro-rata do ciclo", value: 2270, at: 110 }}
        points={[
          <>A cada ciclo, soma <B dark={false}>quantidade × dias</B> de cada item.</>,
          <>Devolução parcial e item novo entram pela data real.</>,
          <>Gera a conta a receber e o <B dark={false}>boletim de medição</B>.</>,
        ]}
      />
    ),
  },
  {
    duration: 120,
    node: (
      <Divider
        eyebrow="ECONOMIA"
        title="Onde o sistema devolve dinheiro para o caixa"
        text="Receita que escapava, custos que eram do cliente e horas de trabalho manual."
        stats={[
          { label: "diárias de atraso", value: 660 },
          { label: "medição pro-rata", value: 2270 },
          { label: "vencido em destaque", value: 1315 },
        ]}
      />
    ),
  },
  {
    duration: 270,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Economia" title="Dinheiro que deixa de escapar" dark={false} />
        <Table
          widths="0.9fr 1.4fr 1.1fr"
          head={["Fonte de ganho", "Como o sistema resolve", "Exemplo nas telas"]}
          start={14}
          rows={[
            ["Diárias excedentes", "Atraso calculado na devolução", "2 dias = R$ 660,00"],
            ["Medição pro-rata", "Quantidade × dias, pela data real", "Boletim de R$ 2.270,00"],
            ["Avarias", "Viram cobrança e abrem OS", "Custo volta ao cliente"],
            ["Multa e juros", "Calculados na baixa", "Sem conta de cabeça"],
            ["Inadimplência", "Vencidos em destaque no painel", "R$ 1.315,00 à vista"],
            ["Reserva dupla", "Disponibilidade bloqueia conflito", "Sem frete perdido"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 270,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Economia de tempo" title="Antes e depois do sistema" dark={false} />
        <Table
          widths="0.9fr 1.1fr 1.3fr"
          head={["Tarefa", "Antes", "Com o sistema"]}
          start={14}
          rows={[
            ["Orçar", "Conferir estoque e calcular", "Preço e disponibilidade na hora"],
            ["Quem devolve hoje", "Revisar contrato por contrato", "Painel com contagem regressiva"],
            ["Medição mensal", "Planilha por obra", "Boletim gerado em um clique"],
            ["Contrato", "Digitar no Word", "Pronto com a marca, por link"],
            ["Avisar o cliente", "Mensagem do zero", "WhatsApp com texto pronto"],
            ["Fechar o mês", "Juntar recibos e extratos", "Relatórios de caixa prontos"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 120,
    node: (
      <Divider
        eyebrow="QUALIDADE"
        title="O mesmo padrão em todo contrato, toda máquina, todo cliente"
        text="Documentos, manutenção, atendimento e controle de acesso."
      />
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark>
        <Heading eyebrow="Documentos" title="Prontos com a marca Dimaq" dark />
        <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
          {[
            ["doc-contrato", "Contrato de locação"],
            ["doc-devolucao", "Devolução"],
            ["doc-boletim", "Boletim de medição"],
          ].map(([name, label], i) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
              <Shot name={name} width={400} height={566} delay={8 + i * 8} dark />
              <Rise delay={20 + i * 8}>
                <div style={{ fontSize: 30, fontWeight: 600 }}>{label}</div>
              </Rise>
            </div>
          ))}
          <Points
            dark
            start={40}
            items={[
              <>Também: orçamento, checklist, fatura, OS, pedido de venda e recibo.</>,
              <Hi key="x">Imprimir, salvar em PDF ou mandar o link.</Hi>,
            ]}
          />
        </div>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <ScreenScene
        dark={false}
        eyebrow="Ordens de serviço"
        title="Máquina revisada é máquina alugando"
        shot="os"
        focus={{ x: 0.19, y: 0.53, w: 0.53, h: 0.11, at: 90 }}
        points={[
          <><B dark={false}>Preventiva por horímetro</B> (ex.: a cada 250 h), com alerta no painel.</>,
          <>Corretiva, revisão de retorno e serviço para cliente.</>,
          <>Peças saem do estoque; a máquina fica bloqueada com a OS aberta.</>,
        ]}
      />
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Site e celular" title="O site vende, o celular opera" dark={false} />
        <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Cards
              columns={2}
              start={10}
              dark={false}
              items={[
                { title: "Catálogo", text: "Equipamentos, preços e disponibilidade no site." },
                { title: "Orçamento online", text: "Chega no sistema já com preço." },
                { title: "Área do cliente", text: "Locações, faturas e pedido de renovação." },
                { title: "WhatsApp", text: "Botão no site e mensagens prontas." },
              ]}
            />
          </div>
          <Shot name="celular" width={290} height={628} delay={20} dark={false} />
        </div>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Segurança" title="Cada pessoa vê o que precisa" dark={false} />
        <Table
          widths="0.6fr 1.8fr"
          head={["Perfil", "Acesso"]}
          start={12}
          rows={[
            ["Administrador", "Tudo, inclusive configurações e o site"],
            ["Gerente", "Operação completa, financeiro e relatórios"],
            ["Operador", "Clientes, frota, locações, OS, vendas e estoque"],
            ["Cliente", "Só a própria área no site"],
          ]}
        />
        <Rise delay={60}>
          <div style={{ fontSize: 30, color: MUTED_ON_LIGHT }}>
            Login próprio em /sistema e histórico de alterações em cada registro.
          </div>
        </Rise>
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark>
        <Heading eyebrow="Financeiro e relatórios" title="O caixa sob controle" dark />
        <div style={{ display: "flex", gap: 64 }}>
          {[
            { shot: "financeiro", label: "Receber e pagar:", text: "baixa parcial, multa e juros automáticos, recibo." },
            { shot: "relatorios", label: "Relatórios:", text: "utilização e retorno por máquina, fluxo de caixa, inadimplência." },
          ].map((x, i) => (
            <div key={x.shot} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
              <Shot name={x.shot} width={800} height={500} delay={8 + i * 10} dark />
              <Rise delay={24 + i * 10}>
                <div style={{ fontSize: 30, lineHeight: 1.4, color: MUTED_ON_DARK }}>
                  <Hi>{x.label}</Hi> {x.text}
                </div>
              </Rise>
            </div>
          ))}
        </div>
      </Scene>
    ),
  },
  {
    duration: 120,
    node: (
      <Divider
        eyebrow="OPORTUNIDADES"
        title="O que o sistema abre de novo para a Dimaq"
        text="Mais pedidos, frota mais ocupada e decisões com dados."
      />
    ),
  },
  {
    duration: 300,
    node: (
      <Scene dark>
        <Heading eyebrow="Oportunidades" title="Seis caminhos para crescer" dark />
        <Cards
          columns={3}
          start={12}
          dark
          items={[
            { title: "Vender 24 horas", text: "O site recebe orçamentos fora do horário, já com preço." },
            { title: "Ocupar a frota parada", text: "A agenda mostra o que está livre: base para promoções." },
            { title: "Decidir a frota", text: "Retorno por máquina mostra o que comprar, manter ou vender." },
            { title: "Atender obras maiores", text: "Medição pro-rata e boletim no formato que construtoras pedem." },
            { title: "Peças e serviços", text: "OS para terceiros e vendas com estoque viram nova receita." },
            { title: "Fidelizar", text: "Área do cliente com renovação e avisos pelo WhatsApp." },
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 240,
    node: (
      <Scene dark={false}>
        <Heading eyebrow="Indicadores" title="Números para acompanhar todo mês" dark={false} />
        <Table
          widths="0.9fr 1.2fr"
          head={["Indicador", "Para que serve"]}
          start={12}
          rows={[
            ["Utilização da frota", "Achar máquina ociosa e agir"],
            ["Faturamento previsto × recebido", "Prever o caixa"],
            ["Inadimplência", "Cobrar antes de virar perda"],
            ["Ranking de clientes", "Priorizar quem mais rende"],
            ["Manutenção", "Custo real por máquina"],
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 240,
    node: (
      <Scene dark accent>
        <Heading title="O que a Dimaq ganha" dark={false} />
        <Cards
          columns={3}
          start={10}
          dark={false}
          items={[
            { title: "Nenhuma reserva dupla", text: "O sistema bloqueia o que já está comprometido." },
            { title: "Nenhuma diária perdida", text: "Atraso, avaria e medição calculados sozinhos." },
            { title: "Atendimento rápido", text: "Orçamento com preço e disponibilidade na hora." },
            { title: "Caixa previsível", text: "Contas a receber geradas e cobradas em dia." },
            { title: "Frota que rende", text: "Preventiva em dia e retorno por máquina." },
            { title: "Sistema da casa", text: "No próprio site, com a marca da Dimaq." },
          ]}
        />
      </Scene>
    ),
  },
  {
    duration: 210,
    node: (
      <Scene dark>
        <Heading eyebrow="Implantação" title="Próximos passos" dark />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            "Instalar no site e cadastrar a equipe",
            "Migrar clientes, frota e contratos em aberto",
            "Ajustar cláusulas do contrato e regras da medição",
            "Treinamento com o manual e ligar e-mail e nota fiscal",
          ].map((t, i) => (
            <Rise key={t} delay={12 + i * 12}>
              <div
                style={{
                  display: "flex",
                  gap: 48,
                  alignItems: "center",
                  padding: "26px 0",
                  borderBottom: "1px solid #3A3A3A",
                }}
              >
                <div style={{ fontFamily: display, fontSize: 56, fontWeight: 700, color: ACCENT, width: 90 }}>
                  0{i + 1}
                </div>
                <div style={{ fontSize: 38 }}>{t}</div>
              </div>
            </Rise>
          ))}
        </div>
      </Scene>
    ),
  },
  { duration: 180, node: <Outro /> },
];

// Each scene lasts as long as its narration line (see timing.json).
scenes.forEach((s, i) => {
  s.duration = timing.durations[i];
});

const sceneStarts = scenes.map(
  (_, i) =>
    scenes.slice(0, i).reduce((sum, s) => sum + s.duration, 0) -
    i * TRANSITION,
);

export const DIMAQ_DURATION =
  scenes.reduce((sum, s) => sum + s.duration, 0) -
  (scenes.length - 1) * TRANSITION;

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let index = 0;
  sceneStarts.forEach((start, i) => {
    if (frame >= start) {
      index = i;
    }
  });
  const local = frame - sceneStarts[index];
  const end = scenes[index].duration - Math.round(0.6 * fps);
  const opacity = interpolate(local, [6, 14, end - 8, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 128,
        bottom: 34,
        maxWidth: 1440,
        opacity,
        backgroundColor: "rgba(20,20,20,0.86)",
        color: "#FBFAF7",
        fontFamily: body,
        fontSize: 28,
        lineHeight: 1.35,
        padding: "12px 22px",
        borderRadius: 10,
      }}
    >
      {timing.lines[index]}
    </div>
  );
};

const DIVIDERS = [8, 11, 17];

// Dividers open with a clock wipe; other scenes rotate through a few moves.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transitionFor = (i: number): TransitionPresentation<any> => {
  if (DIVIDERS.includes(i) || DIVIDERS.includes(i - 1)) {
    return clockWipe({ width: 1920, height: 1080 });
  }
  const moves = [
    slide({ direction: "from-right" }),
    wipe({ direction: "from-left" }),
    slide({ direction: "from-bottom" }),
    fade(),
  ];
  return moves[i % moves.length];
};

const CHAPTERS: { from: number; label: string }[] = [
  { from: 1, label: "O desafio" },
  { from: 2, label: "O sistema" },
  { from: 8, label: "Economia" },
  { from: 11, label: "Qualidade" },
  { from: 17, label: "Oportunidades" },
  { from: 20, label: "Resultado" },
];

// Chapter pill at the top right that announces each part of the video.
const ChapterPill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let scene = 0;
  sceneStarts.forEach((start, i) => {
    if (frame >= start) {
      scene = i;
    }
  });
  if (scene === 0 || scene === scenes.length - 1) {
    return null;
  }
  let chapter = 0;
  CHAPTERS.forEach((c, i) => {
    if (scene >= c.from) {
      chapter = i;
    }
  });
  const start = sceneStarts[CHAPTERS[chapter].from];
  const p = spring({ frame: frame - start - 6, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        position: "absolute",
        right: 128,
        top: 46,
        display: "flex",
        alignItems: "center",
        gap: 14,
        backgroundColor: "rgba(20,20,20,0.88)",
        color: LIGHT,
        fontFamily: body,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        padding: "10px 22px",
        borderRadius: 999,
        transform: `translateY(${(1 - p) * -60}px)`,
        opacity: p,
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {CHAPTERS.map((c, i) => (
          <div
            key={c.label}
            style={{
              width: i === chapter ? 26 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: i <= chapter ? ACCENT : "#555",
            }}
          />
        ))}
      </div>
      {CHAPTERS[chapter].label}
    </div>
  );
};

const PresenterOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shrink = spring({
    frame: frame - (scenes[0].duration - TRANSITION),
    fps,
    config: { damping: 200 },
  });
  const appear = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const size = interpolate(shrink, [0, 1], [400, 230]);
  const right = interpolate(shrink, [0, 1], [70, 36]);
  const bottom = interpolate(shrink, [0, 1], [340, 36]);
  return (
    <div
      style={{
        position: "absolute",
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        transform: `scale(${appear})`,
      }}
    >
      <Presenter size={size} />
    </div>
  );
};

export const DimaqApresentacao: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      <Audio src={staticFile("dimaq/audio/narracao-e-musica.mp3")} />
      <TransitionSeries>
        {scenes.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 ? (
              <TransitionSeries.Transition
                presentation={transitionFor(i)}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={s.duration}>
              {s.node}
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Caption />
      <ChapterPill />
      <PresenterOverlay />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 8,
          width: `${(frame / durationInFrames) * 100}%`,
          backgroundColor: ACCENT,
        }}
      />
    </AbsoluteFill>
  );
};
