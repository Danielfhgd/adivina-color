import { hslToCss } from "../utils/color";

export default function RobotCharacter({ color, characterName, zoneName }) {
  const selectedColor = hslToCss(color);

  return (
    <section className="character-card">
      <div className="character-copy">
        <p className="section-label">Personaje de la ronda</p>
        <h2>{characterName}</h2>
        <p>
          Encuentra el color real de su <strong>{zoneName.toLowerCase()}</strong>.
        </p>
      </div>

      <div className="robot-stage">
        <svg
          className="robot"
          viewBox="0 0 360 360"
          role="img"
          aria-label={`Robot Nova con ${zoneName} recoloreable`}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse cx="180" cy="330" rx="112" ry="17" fill="#172033" opacity="0.25" />

          <path
            d="M180 46 L180 25"
            stroke="#8c9bb4"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="180" cy="20" r="13" fill="#eef6ff" stroke="#253149" strokeWidth="7" />

          <rect
            x="78"
            y="72"
            width="204"
            height="142"
            rx="52"
            fill="#526178"
            stroke="#253149"
            strokeWidth="10"
          />

          <rect
            x="98"
            y="94"
            width="164"
            height="89"
            rx="35"
            fill="#19243a"
          />

          <circle cx="139" cy="137" r="22" fill="#ecf6ff" />
          <circle cx="221" cy="137" r="22" fill="#ecf6ff" />
          <circle cx="139" cy="137" r="10" fill="#263247" />
          <circle cx="221" cy="137" r="10" fill="#263247" />

          <path
            d="M144 168 Q180 193 216 168"
            fill="none"
            stroke="#ecf6ff"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <rect
            x="102"
            y="205"
            width="156"
            height="112"
            rx="35"
            fill="#64748b"
            stroke="#253149"
            strokeWidth="10"
          />

          <path
            d="M102 233 L57 260"
            stroke="#526178"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M258 233 L303 260"
            stroke="#526178"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <circle cx="49" cy="265" r="20" fill="#8c9bb4" stroke="#253149" strokeWidth="7" />
          <circle cx="311" cy="265" r="20" fill="#8c9bb4" stroke="#253149" strokeWidth="7" />

          <rect
            x="126"
            y="309"
            width="37"
            height="30"
            rx="13"
            fill="#526178"
            stroke="#253149"
            strokeWidth="8"
          />
          <rect
            x="197"
            y="309"
            width="37"
            height="30"
            rx="13"
            fill="#526178"
            stroke="#253149"
            strokeWidth="8"
          />

          <circle
            cx="180"
            cy="258"
            r="35"
            fill={selectedColor}
            stroke="#eaf7ff"
            strokeWidth="8"
            filter="url(#glow)"
          />
          <circle cx="180" cy="258" r="13" fill="#ffffff" opacity="0.55" />
        </svg>
      </div>
    </section>
  );
}