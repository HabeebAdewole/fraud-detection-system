/**
 * Chart components for the admin evaluation page and the XAI panel.
 * Series colors come from theme CSS vars (--chart-1 indigo, --chart-2 orange),
 * validated for both surfaces (lightness band, chroma, CVD separation, contrast).
 * Identity is never color-alone: every chart carries direct labels + a legend,
 * and the numeric table lives beside the charts.
 */
import { useRef, useState } from "react";

const S1 = "var(--chart-1)"; // Random Forest
const S2 = "var(--chart-2)"; // GraphSAGE

/* ---------------- ROC curves ---------------- */
export function RocChart({ rf, gnn }) {
  const W = 380, H = 320, P = 36; // plot box with padding
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const x = (fpr) => P + fpr * (W - P - 12);
  const y = (tpr) => H - P + -tpr * (H - P - 12);

  const path = (pts) => pts.map(([f, t], i) => `${i ? "L" : "M"}${x(f)},${y(t)}`).join(" ");

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, ((e.clientX - rect.left) * (W / rect.width) - P) / (W - P - 12)));
    const nearest = (pts) => pts.reduce((a, b) => (Math.abs(b[0] - fx) < Math.abs(a[0] - fx) ? b : a));
    setHover({ fx, rf: nearest(rf.roc), gnn: nearest(gnn.roc) });
  }

  return (
    <div className="relative">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full"
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        role="img" aria-label="ROC curves for Random Forest and GraphSAGE">
        {/* grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <g key={g}>
            <line x1={x(g)} y1={y(0)} x2={x(g)} y2={y(1)} stroke="rgb(var(--c-line-soft))" strokeWidth="1" />
            <line x1={x(0)} y1={y(g)} x2={x(1)} y2={y(g)} stroke="rgb(var(--c-line-soft))" strokeWidth="1" />
          </g>
        ))}
        {/* axes */}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(0)} stroke="rgb(var(--c-line))" strokeWidth="1" />
        <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(1)} stroke="rgb(var(--c-line))" strokeWidth="1" />
        {/* chance diagonal */}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="rgb(var(--c-muted))"
          strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

        {/* series */}
        <path d={path(gnn.roc)} fill="none" stroke={S2} strokeWidth="2" strokeLinejoin="round" />
        <path d={path(rf.roc)} fill="none" stroke={S1} strokeWidth="2" strokeLinejoin="round" />

        {/* direct labels at the elbow */}
        <text x={x(0.16)} y={y(0.965)} fill={S1} fontSize="11" fontFamily="Inter" fontWeight="600">RF · AUC {rf.auc}</text>
        <text x={x(0.32)} y={y(0.70)} fill={S2} fontSize="11" fontFamily="Inter" fontWeight="600">GNN · AUC {gnn.auc}</text>

        {/* hover crosshair */}
        {hover && (
          <g>
            <line x1={x(hover.fx)} y1={y(0)} x2={x(hover.fx)} y2={y(1)} stroke="rgb(var(--c-muted))" strokeWidth="1" opacity="0.5" />
            <circle cx={x(hover.rf[0])} cy={y(hover.rf[1])} r="4" fill={S1} stroke="rgb(var(--c-panel))" strokeWidth="2" />
            <circle cx={x(hover.gnn[0])} cy={y(hover.gnn[1])} r="4" fill={S2} stroke="rgb(var(--c-panel))" strokeWidth="2" />
          </g>
        )}

        {/* axis labels */}
        <text x={(W + P) / 2} y={H - 8} textAnchor="middle" fill="rgb(var(--c-muted))" fontSize="10" fontFamily="JetBrains Mono">FALSE POSITIVE RATE</text>
        <text x={12} y={(H - P) / 2} textAnchor="middle" fill="rgb(var(--c-muted))" fontSize="10" fontFamily="JetBrains Mono"
          transform={`rotate(-90 12 ${(H - P) / 2})`}>TRUE POSITIVE RATE</text>
      </svg>

      {hover && (
        <div className="absolute top-2 right-2 panel-2 px-3 py-2 font-mono text-[11px] leading-relaxed pointer-events-none">
          <p><span style={{ color: S1 }}>●</span> RF — FPR {hover.rf[0].toFixed(3)} · TPR {hover.rf[1].toFixed(3)}</p>
          <p><span style={{ color: S2 }}>●</span> GNN — FPR {hover.gnn[0].toFixed(3)} · TPR {hover.gnn[1].toFixed(3)}</p>
        </div>
      )}

      {/* legend */}
      <div className="flex gap-5 mt-1 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: S1 }} /> Random Forest</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: S2 }} /> GraphSAGE</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-muted" /> chance</span>
      </div>
    </div>
  );
}

/* ---------------- Confusion matrix ---------------- */
export function ConfusionGrid({ title, confusion }) {
  const { tp, fp, fn, tn } = confusion;
  const total = tp + fp + fn + tn;
  const Cell = ({ label, value, good, sub }) => (
    <div className={`rounded-lg border p-3.5 ${good
      ? "border-cyan/25" : "border-red/25"}`}
      style={{ background: good ? "rgb(var(--c-cyan) / 0.06)" : "rgb(var(--c-red) / 0.06)" }}>
      <p className="eyebrow mb-1.5" style={{ letterSpacing: "0.08em" }}>{label}</p>
      <p className="font-mono text-xl font-semibold text-text leading-none">{value.toLocaleString()}</p>
      <p className="text-[11px] text-muted mt-1">{sub} · {((value / total) * 100).toFixed(1)}%</p>
    </div>
  );
  return (
    <div>
      <p className="font-medium text-sm text-text mb-2.5">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        <Cell label="True positive" value={tp} good sub="illicit caught" />
        <Cell label="False negative" value={fn} good={false} sub="illicit missed" />
        <Cell label="False positive" value={fp} good={false} sub="false alarm" />
        <Cell label="True negative" value={tn} good sub="licit cleared" />
      </div>
    </div>
  );
}

/* ---------------- Feature importance (global) ---------------- */
export function ImportanceBars({ top, groupShare }) {
  const max = Math.max(...top.map((f) => f.importance));
  return (
    <div>
      <div className="space-y-1.5">
        {top.map((f) => (
          <div key={f.name} className="flex items-center gap-2.5" title={`${f.name}: ${(f.importance * 100).toFixed(1)}% of the model's decisions`}>
            <span className="font-mono text-[11px] text-muted w-10">{f.name}</span>
            <div className="flex-1 h-3.5 rounded-[4px] bg-panel-2 overflow-hidden">
              <div className="h-full rounded-[4px]"
                style={{ width: `${(f.importance / max) * 100}%`, background: f.group === "local" ? S1 : S2 }} />
            </div>
            <span className="font-mono text-[11px] text-text w-11 text-right">{(f.importance * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-5 mt-3 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: S1 }} /> local (the tx itself) · {(groupShare.local * 100).toFixed(0)}%</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: S2 }} /> neighbourhood aggregate · {(groupShare.aggregate * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

/* ---------------- Per-decision contributions (XAI) ---------------- */
export function ContributionBars({ contributions }) {
  const max = Math.max(...contributions.map((c) => Math.abs(c.value)));
  return (
    <div className="space-y-1.5">
      {contributions.map((c) => {
        const pct = (Math.abs(c.value) / max) * 50; // half-width from the midline
        const pos = c.value >= 0;
        return (
          <div key={c.feature} className="flex items-center gap-2.5"
            title={`${c.feature} (${c.group}) ${pos ? "raised" : "lowered"} the illicit probability by ${Math.abs(c.value).toFixed(3)}`}>
            <span className="font-mono text-[11px] text-muted w-10">{c.feature}</span>
            <span className={`pill-muted !px-1.5 !py-0 w-[4.6rem] justify-center`}>{c.group}</span>
            <div className="relative flex-1 h-3.5">
              <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
              <div className="absolute inset-y-0 rounded-[4px]"
                style={pos
                  ? { left: "50%", width: `${pct}%`, background: "rgb(var(--c-red))" }
                  : { right: "50%", width: `${pct}%`, background: S1 }} />
            </div>
            <span className={`font-mono text-[11px] w-14 text-right ${pos ? "text-red" : "text-cyan"}`}>
              {pos ? "+" : ""}{c.value.toFixed(3)}
            </span>
          </div>
        );
      })}
      <div className="flex justify-between font-mono text-[10px] text-muted pt-1.5">
        <span>← pushes toward licit</span>
        <span>pushes toward illicit →</span>
      </div>
    </div>
  );
}
