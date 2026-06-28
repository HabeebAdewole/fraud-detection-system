/**
 * RiskMeter — the signature instrument.
 * Maps a fraud probability (0..1) onto a cyan→amber→red spectrum with a
 * precise marker and a large monospace readout that recolors by zone.
 */

function zone(score) {
  if (score >= 0.7) return { label: "High Risk", color: "text-red", line: "#FB5468" };
  if (score >= 0.4) return { label: "Elevated", color: "text-amber", line: "#F6B73C" };
  return { label: "Cleared", color: "text-cyan", line: "#2DE1C2" };
}

export default function RiskMeter({ score, size = "lg" }) {
  const pct = Math.max(0, Math.min(1, score ?? 0));
  const z = zone(pct);
  const big = size === "lg";

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="eyebrow mb-1">Fraud probability</p>
          <p className={`font-mono font-semibold leading-none ${z.color} ${big ? "text-5xl" : "text-2xl"}`}>
            {(pct * 100).toFixed(1)}
            <span className={`${big ? "text-2xl" : "text-base"} align-top`}>%</span>
          </p>
        </div>
        <span className={`pill ${pct >= 0.7 ? "pill-red" : pct >= 0.4 ? "pill-amber" : "pill-cyan"}`}>
          {z.label}
        </span>
      </div>

      {/* Spectrum track */}
      <div className="relative h-2.5 rounded-full overflow-hidden border border-line">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #1FA892 0%, #2DE1C2 28%, #F6B73C 62%, #FB5468 100%)",
            opacity: 0.85,
          }}
        />
      </div>

      {/* Marker */}
      <div className="relative h-0">
        <div
          className="absolute -top-[18px] -translate-x-1/2 transition-all duration-500"
          style={{ left: `${pct * 100}%` }}
        >
          <div
            className="w-[3px] h-5 rounded-full"
            style={{ background: z.line, boxShadow: `0 0 10px ${z.line}` }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-2.5">
        <span className="font-mono text-[10px] text-muted">0 · LEGITIMATE</span>
        <span className="font-mono text-[10px] text-muted">FRAUDULENT · 100</span>
      </div>
    </div>
  );
}
