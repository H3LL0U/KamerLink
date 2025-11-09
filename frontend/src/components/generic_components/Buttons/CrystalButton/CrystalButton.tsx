import React, { useState } from "react";
import { defaultScheme, type ColorScheme } from "../../../../main";

interface CrystalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  size?: number; // width (height is derived)
  scheme?: ColorScheme; // main colors
  glow?: string; // separate glow color
  hoverIntensity?: number; // 0..1, how much colors brighten on hover
}

// Utility to lighten a color
function lighten(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel: number) =>
    Math.min(255, Math.round(channel + (255 - channel) * amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function CrystalButton({
  text,
  size = 220,
  scheme = defaultScheme,
  glow,
  hoverIntensity = 0.15,
  style,
  onClick,
  ...rest
}: CrystalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primary = scheme.first ?? "#7be4ff";
  const accent = scheme.second ?? "#9b7bff";
  const textColor = scheme.fourth ?? "#0f1724";
  const glowColor = glow ?? "rgba(155,123,255,0.45)";

  const hoverPrimary = hoverIntensity > 0 ? lighten(primary, hoverIntensity) : primary;
  const hoverAccent = hoverIntensity > 0 ? lighten(accent, hoverIntensity) : accent;

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    width: size,
    height: Math.round(size * 0.6),
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    outline: "none",
    ...style,
  };

  return (
    <button
      aria-label={text}
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <defs>
          <linearGradient id="g-main" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={isHovered ? hoverPrimary : primary} />
            <stop offset="100%" stopColor={isHovered ? hoverAccent : accent} />
          </linearGradient>

          <linearGradient id="g-facet" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.22} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.06} />
          </linearGradient>

          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* main crystal */}
        <polygon
          points="50,2 92,18 78,52 50,58 22,52 8,18"
          fill="url(#g-main)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.8"
          style={{ transition: "transform 220ms ease, fill 220ms ease" }}
        />

        {/* inner facets */}
        <polygon
          points="50,8 80,20 68,46 50,52 32,46 20,20"
          fill="url(#g-facet)"
          style={{ mixBlendMode: "overlay", opacity: 0.95 }}
        />

        {/* glow */}
        <polygon
          points="50,2 92,18 78,52 50,58 22,52 8,18"
          fill={glowColor}
          opacity={isHovered ? 0.6 : 0}
          filter="url(#soft-glow)"
          style={{ transition: "opacity 220ms ease" }}
        />

        {/* text */}
        <text
          x="50"
          y="36"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 12.5,
            fill: textColor,
            textShadow: "0 1px 0 rgba(255,255,255,0.25)",
            pointerEvents: "none",
          }}
        >
          {text}
        </text>
      </svg>

      <style>{`
        button:focus { outline: none; }
        button:hover,
        button:focus {
          transform: translateY(-2px) scale(1.01);
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.22));
        }
        button:active {
          transform: translateY(0) scale(0.995);
        }
      `}</style>
    </button>
  );
}
