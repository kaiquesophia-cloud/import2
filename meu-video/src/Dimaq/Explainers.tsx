import React from "react";
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ACCENT,
  body,
  brl,
  clamp,
  DANGER,
  DARK,
  display,
  LIGHT,
  MUTED_ON_DARK,
  MUTED_ON_LIGHT,
  OK,
} from "./theme";
import { usePortrait } from "./layout";

const useSpring = (delay: number, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// Mouse pointer moving between keyframes (x, y in % of the parent) with click ripples.
export const Cursor: React.FC<{
  path: { x: number; y: number; at: number }[];
  clicks: number[];
}> = ({ path, clicks }) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [path[0].at - 8, path[0].at], [0, 1], clamp);
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const t = interpolate(frame, [a.at, b.at], [0, 1], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    });
    if (frame >= a.at) {
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
    }
  }
  const pressed = clicks.some((c) => frame >= c && frame < c + 5);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        opacity: show,
        pointerEvents: "none",
      }}
    >
      {clicks.map((c) => {
        const r = interpolate(frame, [c, c + 18], [0, 1], clamp);
        return frame >= c ? (
          <div
            key={c}
            style={{
              position: "absolute",
              left: -40 * r,
              top: -40 * r,
              width: 80 * r,
              height: 80 * r,
              borderRadius: "50%",
              border: `4px solid ${ACCENT}`,
              opacity: 1 - r,
            }}
          />
        ) : null;
      })}
      <svg
        width={44}
        height={44}
        viewBox="0 0 24 24"
        style={{ transform: `scale(${pressed ? 0.85 : 1})`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))" }}
      >
        <path
          d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.3 L18 13.3 Z"
          fill="#FFFFFF"
          stroke="#1F1F1F"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// "O desafio": problems pop up and the cash tank drains with each one.
export const LeakTank: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const problems = [
    "Reserva dupla",
    "Diária esquecida",
    "Avaria sem registro",
    "Cobrança atrasada",
    "Preventiva atrasada",
    "Orçamento demorado",
  ];
  const appear = problems.map((_, i) =>
    spring({ frame: frame - start - i * 26, fps, config: { damping: 12 } }),
  );
  const level = 1 - appear.reduce((s, a) => s + a * 0.12, 0);
  const tank = useSpring(start - 30);
  const portrait = usePortrait();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: portrait ? "column" : "row",
        gap: portrait ? 40 : 80,
        alignItems: "center",
        flex: portrait ? "none" : 1,
      }}
    >
      <div
        style={{
          flex: portrait ? "none" : 1,
          width: portrait ? "100%" : undefined,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: portrait ? 18 : 24,
        }}
      >
        {problems.map((p, i) => (
          <div
            key={p}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              backgroundColor: "#FBFAF7",
              border: `2px solid ${DANGER}`,
              borderRadius: 16,
              padding: portrait ? "18px 18px" : "22px 26px",
              fontSize: portrait ? 27 : 32,
              fontWeight: 700,
              color: DARK,
              opacity: Math.min(1, appear[i] * 1.5),
              transform: `scale(${interpolate(appear[i], [0, 1], [0.6, 1])}) rotate(${(1 - appear[i]) * (i % 2 ? 6 : -6)}deg)`,
              boxShadow: "0 12px 30px rgba(214,69,53,0.15)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: DANGER,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                flexShrink: 0,
              }}
            >
              !
            </div>
            {p}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: tank,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: DARK }}>
          Caixa da Dimaq
        </div>
        <div
          style={{
            position: "relative",
            width: 260,
            height: portrait ? 300 : 440,
            borderRadius: 28,
            border: `6px solid ${DARK}`,
            overflow: "hidden",
            backgroundColor: "#FBFAF7",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: `${level * 100}%`,
              background: `linear-gradient(180deg, #FFC740 0%, ${ACCENT} 100%)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -10,
                left: 0,
                right: 0,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "#FFD36A",
                transform: `translateX(${Math.sin(frame / 8) * 10}px)`,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: display,
              fontSize: 72,
              fontWeight: 700,
              color: DARK,
            }}
          >
            R$
          </div>
        </div>
        <div style={{ position: "relative", width: 260, height: 90 }}>
          {appear.map((a, i) =>
            a > 0.5
              ? [0, 1].map((k) => {
                  const t = ((frame + i * 9 + k * 17) % 34) / 34;
                  return (
                    <div
                      key={`${i}-${k}`}
                      style={{
                        position: "absolute",
                        left: 40 + i * 34,
                        top: t * 80,
                        width: 14,
                        height: 20,
                        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                        backgroundColor: DANGER,
                        opacity: 1 - t,
                      }}
                    />
                  );
                })
              : null,
          )}
        </div>
      </div>
    </div>
  );
};

// "A solução": every module connected to the system, data flowing both ways.
export const Hub: React.FC<{
  start: number;
  items: { title: string; text: string }[];
}> = ({ start, items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = usePortrait();
  const W = portrait ? 960 : 1664;
  const H = portrait ? 1150 : 680;
  const cx = W / 2;
  const cy = portrait ? 560 : 290;
  const rx = portrait ? 300 : 640;
  const ry = portrait ? 440 : 215;
  const boxW = portrait ? 330 : 380;
  const center = useSpring(start, 12);
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {items.map((_, i) => {
          const ang = (-90 + i * 60) * (Math.PI / 180);
          const x = cx + Math.cos(ang) * rx;
          const y = cy + Math.sin(ang) * ry;
          const draw = interpolate(frame, [start + 10 + i * 6, start + 34 + i * 6], [0, 1], clamp);
          const len = Math.hypot(x - cx, y - cy);
          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={ACCENT}
                strokeWidth={4}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - draw)}
                opacity={0.7}
              />
              {draw >= 1
                ? [0, 0.5].map((o) => {
                    const t = ((frame / 40 + o + i * 0.13) % 1);
                    const dir = i % 2 ? t : 1 - t;
                    return (
                      <circle
                        key={o}
                        cx={cx + (x - cx) * dir}
                        cy={cy + (y - cy) * dir}
                        r={8}
                        fill={ACCENT}
                      />
                    );
                  })
                : null}
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx - 150,
          top: cy - 150,
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: DARK,
          border: `8px solid ${ACCENT}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transform: `scale(${center * (1 + Math.sin(frame / 15) * 0.02)})`,
          boxShadow: `0 0 ${40 + Math.sin(frame / 15) * 20}px rgba(245,165,0,0.5)`,
        }}
      >
        <Img src={staticFile("dimaq/logo.png")} style={{ width: 200 }} />
        <div style={{ color: ACCENT, fontSize: 26, fontWeight: 700, letterSpacing: 3 }}>
          SISTEMA
        </div>
      </div>
      {items.map((it, i) => {
        const ang = (-90 + i * 60) * (Math.PI / 180);
        const x = cx + Math.cos(ang) * rx;
        const y = cy + Math.sin(ang) * ry;
        const p = spring({ frame: frame - start - 26 - i * 6, fps, config: { damping: 13 } });
        return (
          <div
            key={it.title}
            style={{
              position: "absolute",
              left: x - boxW / 2,
              top: y - 62,
              width: boxW,
              backgroundColor: DARK,
              borderRadius: 18,
              padding: "18px 24px",
              borderTop: `6px solid ${ACCENT}`,
              transform: `scale(${p})`,
              boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT }}>{it.title}</div>
            <div style={{ fontSize: 24, lineHeight: 1.35, color: "#E4DFD7" }}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

// "10 dias = 1 semana + 3 diárias": days merge into the cheapest combination.
export const TariffBlocks: React.FC<{ start: number; dark: boolean }> = ({
  start,
  dark,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const merge = spring({ frame: frame - start - 40, fps, config: { damping: 200 } });
  const label = useSpring(start + 60);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: interpolate(merge, [0, 1], [8, 0]) }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const p = spring({ frame: frame - start - i * 3, fps, config: { damping: 14 } });
          const week = i < 7;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 70,
                backgroundColor: week ? ACCENT : dark ? "#3A3A3A" : "#E4DFD7",
                border: week ? "none" : `3px solid ${ACCENT}`,
                borderRadius: week
                  ? i === 0
                    ? "12px 0 0 12px"
                    : i === 6
                      ? `0 ${12 * (1 - merge)}px ${12 * (1 - merge)}px 0`
                      : interpolate(merge, [0, 1], [12, 0])
                  : 12,
                marginLeft: !week && i === 7 ? 10 : 0,
                transform: `scaleY(${p})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                whiteSpace: "nowrap",
                color: week ? DARK : dark ? LIGHT : DARK,
              }}
            >
              {week ? (merge > 0.5 ? (i === 3 ? "1 SEMANA" : "") : i + 1) : i + 1}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontSize: 28,
          color: dark ? MUTED_ON_DARK : MUTED_ON_LIGHT,
          opacity: label,
        }}
      >
        10 dias = <b style={{ color: dark ? LIGHT : DARK }}>1 semana + 3 diárias</b>: o
        menor preço, sem conta de cabeça.
      </div>
    </div>
  );
};

// Late return: planned end vs. real return, extra days charged automatically.
export const LateTimeline: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const base = interpolate(frame, [start, start + 30], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const late = interpolate(frame, [start + 40, start + 70], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const tag = useSpring(start + 72, 12);
  const W = 520;
  const planned = 0.78;
  return (
    <div style={{ position: "relative", width: W, height: 190 }}>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          height: 26,
          width: W * planned * base,
          backgroundColor: ACCENT,
          borderRadius: "13px 0 0 13px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 70,
          left: W * planned,
          height: 26,
          width: W * (1 - planned) * late,
          backgroundImage: `repeating-linear-gradient(135deg, ${DANGER} 0px, ${DANGER} 10px, #E86B5D 10px, #E86B5D 20px)`,
          borderRadius: "0 13px 13px 0",
        }}
      />
      {[
        { at: 0, label: "Retirada", date: "26/09", show: base },
        { at: planned, label: "Previsto", date: "06/10", show: base },
        { at: 1, label: "Devolvido", date: "08/10", show: late },
      ].map((m) => (
        <div
          key={m.label}
          style={{
            position: "absolute",
            left: W * m.at - 60,
            top: 0,
            width: 120,
            textAlign: "center",
            opacity: m.show,
            fontSize: 22,
            color: MUTED_ON_DARK,
          }}
        >
          <div style={{ fontWeight: 700, color: LIGHT }}>{m.date}</div>
          <div>{m.label}</div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 112,
          transform: `scale(${tag})`,
          transformOrigin: "right center",
          backgroundColor: DANGER,
          color: "#FFFFFF",
          borderRadius: 12,
          padding: "10px 18px",
          fontSize: 26,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        +2 diárias = R$ {brl(660 * tag)}
      </div>
    </div>
  );
};

// The two billing modes side by side, with a switch flipping between them.
export const BillingModes: React.FC<{ start: number; flip: number }> = ({
  start,
  flip,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const sw = spring({ frame: frame - flip, fps, config: { damping: 15 } });
  const fixedFill = interpolate(frame, [start + 15, start + 60], [0, 1], clamp);
  const proFill = interpolate(frame, [flip + 10, flip + 80], [0, 1], clamp);
  const bulletin = useSpring(flip + 85, 12);
  const portrait = usePortrait();
  const card = (active: number): React.CSSProperties => ({
    flex: 1,
    backgroundColor: DARK,
    borderRadius: 22,
    padding: portrait ? "24px 30px" : "30px 36px",
    display: "flex",
    flexDirection: "column",
    gap: portrait ? 14 : 18,
    border: `4px solid rgba(245,165,0,${0.25 + active * 0.75})`,
    opacity: 0.55 + active * 0.45,
    transform: `scale(${0.96 + active * 0.04})`,
    boxShadow: `0 20px 60px rgba(245,165,0,${0.3 * active})`,
  });
  // Escora metálica from the screenshot: 60 un × 24 d + 40 un × 6 d.
  const chartW = portrait ? 830 : 640;
  const chartH = portrait ? 160 : 190;
  const qty = (d: number) => (d < 24 ? 60 : 40);
  const days = 30;
  const shown = proFill * days;
  let path = `M0 ${chartH}`;
  for (let d = 0; d <= shown; d += 0.5) {
    path += ` L${(d / days) * chartW} ${chartH - (qty(d) / 70) * chartH}`;
  }
  path += ` L${(shown / days) * chartW} ${chartH} Z`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, opacity: enter }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, alignSelf: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 1 - sw * 0.5 }}>Período fechado</div>
        <div
          style={{
            width: 110,
            height: 56,
            borderRadius: 28,
            backgroundColor: DARK,
            position: "relative",
            border: `3px solid ${ACCENT}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 5,
              left: 6 + sw * 52,
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: ACCENT,
            }}
          />
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.5 + sw * 0.5 }}>Medição pró-rata</div>
        <div
          style={{
            display: portrait ? "none" : "block",
            marginLeft: 20,
            fontSize: 24,
            fontWeight: 700,
            color: DARK,
            backgroundColor: "#FBFAF7",
            border: `2px solid ${DARK}`,
            borderRadius: 999,
            padding: "6px 18px",
          }}
        >
          escolha por contrato
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: portrait ? 24 : 40 }}>
        <div style={card(1 - sw)}>
          <div style={{ fontSize: 40, fontWeight: 700, color: ACCENT }}>Período fechado</div>
          <div style={{ fontSize: 27, lineHeight: 1.4, color: "#E4DFD7" }}>
            Diária, semana, quinzena ou mês. O cliente paga o período contratado, com valor fixo.
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 70,
                  borderRadius: 4,
                  backgroundColor: i / 30 < fixedFill ? ACCENT : "#3A3A3A",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 26, color: MUTED_ON_DARK }}>
            30 dias = <b style={{ color: LIGHT }}>1 mês</b>, valor do pacote
          </div>
        </div>
        <div style={card(sw)}>
          <div style={{ fontSize: 40, fontWeight: 700, color: ACCENT }}>Medição pró-rata</div>
          <div style={{ fontSize: 27, lineHeight: 1.4, color: "#E4DFD7" }}>
            Ideal para obras: cobra quantidade × dias, só o que ficou com o cliente.
          </div>
          <div style={{ position: "relative", width: chartW, height: chartH }}>
            <svg width={chartW} height={chartH} style={{ position: "absolute", inset: 0 }}>
              <path d={path} fill="rgba(245,165,0,0.85)" />
              <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#777" strokeWidth={2} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 16,
                top: 40,
                fontSize: 24,
                fontWeight: 700,
                color: DARK,
                opacity: interpolate(proFill, [0.2, 0.4], [0, 1], clamp),
              }}
            >
              60 un × 24 dias
            </div>
            <div
              style={{
                position: "absolute",
                left: (24 / 30) * chartW - 10,
                top: 4,
                fontSize: 22,
                fontWeight: 700,
                color: LIGHT,
                opacity: interpolate(proFill, [0.82, 0.95], [0, 1], clamp),
                whiteSpace: "nowrap",
              }}
            >
              ↓ devolveu 20
            </div>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              transform: `scale(${bulletin})`,
              transformOrigin: "left center",
              backgroundColor: ACCENT,
              color: DARK,
              borderRadius: 12,
              padding: "8px 18px",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            Boletim de medição gerado: R$ {brl(2270 * bulletin)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hour meter counting up to the preventive service threshold.
export const HourGauge: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + 70], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const alert = useSpring(start + 72, 10);
  const hours = Math.round(t * 250);
  const ang = -180 + t * 180;
  const R = 130;
  const arc = Math.PI * R;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
      <div style={{ position: "relative", width: 300, height: 170 }}>
        <svg width={300} height={170}>
          <path
            d={`M20 160 A${R} ${R} 0 0 1 280 160`}
            fill="none"
            stroke="#E2DED6"
            strokeWidth={22}
            strokeLinecap="round"
          />
          <path
            d={`M20 160 A${R} ${R} 0 0 1 280 160`}
            fill="none"
            stroke={t > 0.97 ? DANGER : ACCENT}
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={arc}
            strokeDashoffset={arc * (1 - t)}
          />
          <line
            x1={150}
            y1={160}
            x2={150 + Math.cos((ang * Math.PI) / 180) * 105}
            y2={160 + Math.sin((ang * Math.PI) / 180) * 105}
            stroke={DARK}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <circle cx={150} cy={160} r={12} fill={DARK} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 70,
            textAlign: "center",
            fontFamily: display,
            fontSize: 44,
            fontWeight: 700,
            color: DARK,
          }}
        >
          {hours} h
        </div>
      </div>
      <div
        style={{
          transform: `scale(${alert}) rotate(${(1 - alert) * -10}deg)`,
          backgroundColor: DANGER,
          color: "#FFFFFF",
          borderRadius: 14,
          padding: "14px 20px",
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        250 h: hora da
        <br />
        revisão preventiva
      </div>
    </div>
  );
};

// Ghost card dragged from "Orçamento" to "Reservado" on the board screenshot.
export const DragDemo: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start + 15, start + 55], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const lift = interpolate(frame, [start + 8, start + 15, start + 55, start + 62], [0, 1, 1, 0], clamp);
  const done = interpolate(frame, [start + 60, start + 70], [0, 1], clamp);
  const x = 0.385 + (0.562 - 0.385) * t;
  const y = 0.285;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: "15.6%",
          height: "14%",
          borderRadius: 8,
          border: `4px solid ${ACCENT}`,
          backgroundColor: "rgba(255,255,255,0.92)",
          transform: `rotate(${lift * 4}deg) scale(${1 + lift * 0.08})`,
          boxShadow: `0 ${10 * lift}px ${30 * lift}px rgba(0,0,0,0.35)`,
          opacity: interpolate(frame, [start, start + 8], [0, 1], clamp),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: body,
          fontSize: 18,
          fontWeight: 700,
          color: DARK,
        }}
      >
        {done > 0.5 ? "✓ Reservado" : "Orçamento 6.576"}
      </div>
      <Cursor
        path={[
          { x: x + 0.07, y: y + 0.06, at: start },
          { x: 0.455, y: 0.345, at: start + 14 },
          { x: 0.632, y: 0.345, at: start + 55 },
          { x: 0.66, y: 0.42, at: start + 75 },
        ]}
        clicks={[start + 12]}
      />
    </>
  );
};

// Implementation steps on a line that fills up, each checked off in turn.
export const StepsProgress: React.FC<{ steps: string[]; start: number }> = ({
  steps,
  start,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = interpolate(frame, [start, start + steps.length * 30], [0, 1], clamp);
  const portrait = usePortrait();
  if (portrait) {
    return (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 44, marginTop: 40 }}>
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 60,
            bottom: 60,
            width: 8,
            backgroundColor: "#3A3A3A",
            borderRadius: 4,
          }}
        >
          <div style={{ height: `${fill * 100}%`, width: "100%", backgroundColor: ACCENT, borderRadius: 4 }} />
        </div>
        {steps.map((s, i) => {
          const reached = spring({ frame: frame - start - i * 30, fps, config: { damping: 12 } });
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 36 }}>
              <div
                style={{
                  width: 124,
                  height: 124,
                  flexShrink: 0,
                  borderRadius: "50%",
                  backgroundColor: reached > 0.5 ? ACCENT : "#2A2A2A",
                  border: `6px solid ${ACCENT}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: display,
                  fontSize: 54,
                  fontWeight: 700,
                  color: reached > 0.5 ? DARK : ACCENT,
                  transform: `scale(${0.8 + reached * 0.2})`,
                  position: "relative",
                }}
              >
                {reached > 0.5 ? "✓" : `0${i + 1}`}
              </div>
              <div
                style={{
                  fontSize: 36,
                  lineHeight: 1.3,
                  color: LIGHT,
                  opacity: 0.4 + reached * 0.6,
                  transform: `translateX(${(1 - reached) * 30}px)`,
                }}
              >
                {s}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ position: "relative", display: "flex", gap: 24, marginTop: 150 }}>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 58,
          height: 8,
          backgroundColor: "#3A3A3A",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            backgroundColor: ACCENT,
            borderRadius: 4,
          }}
        />
      </div>
      {steps.map((s, i) => {
        const reached = spring({ frame: frame - start - i * 30, fps, config: { damping: 12 } });
        return (
          <div
            key={s}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 124,
                height: 124,
                borderRadius: "50%",
                backgroundColor: reached > 0.5 ? ACCENT : "#2A2A2A",
                border: `6px solid ${ACCENT}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: display,
                fontSize: 54,
                fontWeight: 700,
                color: reached > 0.5 ? DARK : ACCENT,
                transform: `scale(${0.8 + reached * 0.2})`,
                position: "relative",
              }}
            >
              {reached > 0.5 ? "✓" : `0${i + 1}`}
            </div>
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.35,
                color: LIGHT,
                opacity: 0.4 + reached * 0.6,
                transform: `translateY(${(1 - reached) * 20}px)`,
              }}
            >
              {s}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Documents leave as a link: a paper plane flies to each channel.
export const SendLinks: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const channels = ["Imprimir", "PDF", "WhatsApp", "E-mail"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {channels.map((c, i) => {
        const at = start + i * 14;
        const fly = interpolate(frame, [at, at + 16], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const pop = spring({ frame: frame - at - 12, fps, config: { damping: 10 } });
        return (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, height: 60 }}>
            <div
              style={{
                fontSize: 40,
                transform: `translateX(${-120 + fly * 120}px) rotate(${(1 - fly) * -20}deg)`,
                opacity: fly > 0 && fly < 1 ? 1 : 0,
                width: 0,
              }}
            >
              ➤
            </div>
            <div
              style={{
                transform: `scale(${pop})`,
                transformOrigin: "left center",
                backgroundColor: c === "WhatsApp" ? OK : ACCENT,
                color: c === "WhatsApp" ? "#FFFFFF" : DARK,
                borderRadius: 999,
                padding: "10px 26px",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              ✓ {c}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Small phone notification card sliding in over the mobile screenshot.
export const PhoneToast: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 13 } });
  return (
    <div
      style={{
        position: "absolute",
        left: "5%",
        right: "5%",
        top: "3%",
        transform: `translateY(${(1 - p) * -140}%)`,
        backgroundColor: DARK,
        color: LIGHT,
        borderRadius: 14,
        padding: "10px 12px",
        fontFamily: body,
        fontSize: 15,
        lineHeight: 1.3,
        borderLeft: `5px solid ${ACCENT}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
        opacity: Math.min(1, p * 2),
      }}
    >
      <div style={{ fontWeight: 700, color: ACCENT }}>Novo pedido do site</div>
      {text}
    </div>
  );
};
