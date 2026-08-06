const NAVY = "#14224b";
const NAVY_LIGHT = "#1f3268";
const GOLD = "#c9972e";
const GOLD_LIGHT = "#e0b654";
const CREAM = "#fdfbf6";

export function TakingTestIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      className={className}
      role="img"
      aria-label="Illustration of a student taking a timed mock test on a laptop"
    >
      <circle cx="210" cy="180" r="200" fill={CREAM} />

      {/* Desk */}
      <rect x="20" y="250" width="380" height="16" rx="6" fill={NAVY_LIGHT} />
      <rect x="20" y="266" width="380" height="52" rx="0" fill={NAVY} />

      {/* Laptop */}
      <rect x="150" y="150" width="120" height="86" rx="6" fill="#ffffff" stroke={NAVY} strokeWidth="3" />
      <rect x="150" y="230" width="120" height="12" rx="4" fill={GOLD} />
      {/* Question lines */}
      <rect x="166" y="168" width="88" height="6" rx="3" fill={NAVY} opacity="0.15" />
      <rect x="166" y="180" width="60" height="6" rx="3" fill={NAVY} opacity="0.15" />
      {/* Option dots */}
      <circle cx="172" cy="200" r="5" fill={GOLD} />
      <rect x="184" y="197" width="50" height="6" rx="3" fill={NAVY} opacity="0.25" />
      <circle cx="172" cy="216" r="5" fill="none" stroke={NAVY} strokeWidth="2" opacity="0.4" />
      <rect x="184" y="213" width="40" height="6" rx="3" fill={NAVY} opacity="0.15" />

      {/* Person */}
      <rect x="178" y="220" width="64" height="70" rx="18" fill={GOLD_LIGHT} />
      <circle cx="210" cy="188" r="30" fill={NAVY} />
      <path d="M182 178 Q210 148 238 178 L238 168 Q210 140 182 168 Z" fill={NAVY} />

      {/* Clock */}
      <circle cx="360" cy="64" r="34" fill="#ffffff" stroke={GOLD} strokeWidth="4" />
      <line x1="360" y1="64" x2="360" y2="42" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <line x1="360" y1="64" x2="376" y2="70" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <circle cx="360" cy="64" r="3.5" fill={NAVY} />

      {/* Pencil */}
      <rect x="284" y="222" width="10" height="56" rx="3" fill={GOLD} transform="rotate(28 289 250)" />
      <rect x="284" y="222" width="10" height="12" rx="3" fill={NAVY} transform="rotate(28 289 228)" />
    </svg>
  );
}

export function ThinkingIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      className={className}
      role="img"
      aria-label="Illustration of a student thinking through a multiple-choice answer"
    >
      <circle cx="210" cy="180" r="200" fill={CREAM} />

      {/* Person */}
      <rect x="118" y="200" width="76" height="100" rx="20" fill={GOLD_LIGHT} />
      <circle cx="156" cy="150" r="34" fill={NAVY} />
      <path d="M126 140 Q156 106 186 140 L186 128 Q156 98 126 128 Z" fill={NAVY} />
      {/* Bent arm to chin */}
      <path
        d="M188 220 Q214 210 210 172 Q208 156 188 150"
        fill="none"
        stroke={NAVY_LIGHT}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <circle cx="188" cy="150" r="11" fill={GOLD_LIGHT} />

      {/* Thought bubble trail */}
      <circle cx="238" cy="108" r="7" fill="#ffffff" stroke={GOLD} strokeWidth="2.5" />
      <circle cx="256" cy="84" r="11" fill="#ffffff" stroke={GOLD} strokeWidth="2.5" />

      {/* Main thought bubble */}
      <rect x="234" y="18" width="164" height="96" rx="24" fill="#ffffff" stroke={GOLD} strokeWidth="3" />
      <text x="316" y="80" fontSize="52" fontWeight="600" fill={NAVY} textAnchor="middle">
        ?
      </text>

      {/* Answer option pills */}
      <g fontSize="13" fontWeight="600" fill={NAVY}>
        <rect x="80" y="292" width="46" height="28" rx="14" fill="#ffffff" stroke={NAVY} strokeWidth="2" opacity="0.5" />
        <text x="103" y="311" textAnchor="middle" opacity="0.6">
          A
        </text>
        <rect x="134" y="292" width="46" height="28" rx="14" fill={GOLD} />
        <text x="157" y="311" textAnchor="middle" fill={NAVY}>
          B
        </text>
        <rect x="188" y="292" width="46" height="28" rx="14" fill="#ffffff" stroke={NAVY} strokeWidth="2" opacity="0.5" />
        <text x="211" y="311" textAnchor="middle" opacity="0.6">
          C
        </text>
      </g>
    </svg>
  );
}
