export type TrendPoint = { label: string; date: Date; percent: number };

// Score % across a student's submitted attempts, oldest to newest. Hidden
// until there are at least two attempts, since one point shows no trend.
export function ProgressTrend({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) return null;

  const W = 480;
  const H = 210;
  const pad = { l: 44, r: 16, t: 14, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const x = (i: number) => pad.l + (innerW * i) / (points.length - 1);
  const y = (percent: number) => pad.t + innerH * (1 - percent / 100);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.percent).toFixed(1)}`).join(" ");

  const percents = points.map((p) => p.percent);
  const average = Math.round(percents.reduce((s, v) => s + v, 0) / percents.length);
  const best = Math.max(...percents);
  const latest = percents[percents.length - 1];
  const change = latest - percents[0];

  return (
    <section className="mt-8 rounded-xl border border-black/5 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">Your progress</h2>
          <p className="mt-0.5 text-sm text-brand-ink/60">
            Score % across your {points.length} submitted attempts, oldest to newest.
          </p>
        </div>
        <dl className="flex gap-6 text-center">
          <div>
            <dt className="text-xs text-brand-ink/50">Average</dt>
            <dd className="text-lg font-bold text-brand-navy">{average}%</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-ink/50">Best</dt>
            <dd className="text-lg font-bold text-brand-navy">{best}%</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-ink/50">Since first</dt>
            <dd className={`text-lg font-bold ${change >= 0 ? "text-green-700" : "text-red-700"}`}>
              {change >= 0 ? "+" : ""}
              {change} pts
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Score trend across ${points.length} attempts, from ${percents[0]}% to ${latest}%`}
        className="h-auto w-full min-w-[300px]"
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line x1={pad.l} x2={W - pad.r} y1={y(tick)} y2={y(tick)} stroke="currentColor" className="text-black/10" />
            <text x={pad.l - 8} y={y(tick) + 5} textAnchor="end" className="fill-brand-ink/50 text-[13px]">
              {tick}%
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#c9972e" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.percent)} r={4} fill="#14224b" stroke="white" strokeWidth={1.5}>
            <title>{`${p.label} - ${p.percent}% (${p.date.toLocaleDateString("en-IN")})`}</title>
          </circle>
        ))}
        <text x={pad.l} y={H - 8} className="fill-brand-ink/50 text-[13px]">
          {points[0].date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </text>
        <text x={W - pad.r} y={H - 8} textAnchor="end" className="fill-brand-ink/50 text-[13px]">
          {points[points.length - 1].date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </text>
      </svg>
      </div>
    </section>
  );
}
