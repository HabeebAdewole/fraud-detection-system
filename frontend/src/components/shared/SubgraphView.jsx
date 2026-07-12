/**
 * SubgraphView — radial 2-hop network around the selected transaction.
 * Inner ring = direct neighbours (hop 1), outer ring = their neighbours
 * (hop 2) — mirroring the GNN's 2-layer message-passing reach.
 * Nodes are coloured by their known label.
 */
const COLOR = {
  illicit: "#FB5468",
  licit: "#2DE1C2",
  unknown: "#5B6478",
};

function ringPositions(items, cx, cy, radius, phase = 0) {
  const pos = {};
  items.forEach((n, i) => {
    const a = (i / Math.max(items.length, 1)) * Math.PI * 2 - Math.PI / 2 + phase;
    pos[n.tx_id] = { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  });
  return pos;
}

export default function SubgraphView({ data, centerScore }) {
  if (!data) return null;
  const { center, nodes, edges, neighbour_count, hop2_count, truncated } = data;

  const hop1 = nodes.filter((n) => n.hop === 1);
  const hop2 = nodes.filter((n) => n.hop === 2);

  const W = 460, H = 400, cx = W / 2, cy = H / 2;
  const pos = {
    [center]: { x: cx, y: cy },
    ...ringPositions(hop1, cx, cy, 95),
    ...ringPositions(hop2, cx, cy, 165, Math.PI / hop2.length || 0),
  };

  const centerColor =
    centerScore >= 0.7 ? COLOR.illicit : centerScore >= 0.4 ? "#F6B73C" : COLOR.licit;

  const drawable = edges.filter((e) => pos[e.source] && pos[e.target]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="eyebrow">Network · 2-hop neighbourhood</p>
        <span className="font-mono text-[11px] text-muted">
          {neighbour_count} direct · {hop2_count} at 2 hops{truncated ? " · trimmed" : ""}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Transaction network graph">
        {/* faint ring guides */}
        <circle cx={cx} cy={cy} r="95" fill="none" stroke="#1B2230" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="165" fill="none" stroke="#1B2230" strokeWidth="1" strokeDasharray="3 5" />

        {/* edges */}
        {drawable.map((e, i) => {
          const a = pos[e.source], b = pos[e.target];
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#232C3C" strokeWidth={e.source === center || e.target === center ? 1.6 : 0.8}
              opacity={e.source === center || e.target === center ? 1 : 0.7} />
          );
        })}

        {/* hop-2 nodes (smaller, dimmer) */}
        {hop2.map((n) => {
          const p = pos[n.tx_id];
          return (
            <g key={n.tx_id}>
              <circle cx={p.x} cy={p.y} r="5" fill={COLOR[n.label] || COLOR.unknown}
                opacity={n.label === "unknown" ? 0.4 : 0.75} />
              <title>{`tx ${n.tx_id} · ${n.label} · 2 hops`}</title>
            </g>
          );
        })}

        {/* hop-1 nodes */}
        {hop1.map((n) => {
          const p = pos[n.tx_id];
          return (
            <g key={n.tx_id}>
              <circle cx={p.x} cy={p.y} r="8" fill={COLOR[n.label] || COLOR.unknown}
                opacity={n.label === "unknown" ? 0.55 : 0.95} />
              <title>{`tx ${n.tx_id} · ${n.label} · direct`}</title>
            </g>
          );
        })}

        {/* center node */}
        <circle cx={cx} cy={cy} r="18" fill="none" stroke={centerColor} strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="18;24;18" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r="12" fill={centerColor}
          style={{ filter: `drop-shadow(0 0 8px ${centerColor})` }} />
        <title>{`tx ${center} · analysed`}</title>
      </svg>

      {/* legend */}
      <div className="flex flex-wrap gap-4 mt-2 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.illicit }} /> illicit</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.licit }} /> licit</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.unknown }} /> unknown</span>
        <span>inner ring = direct · outer = 2 hops (the GNN's reach)</span>
      </div>
    </div>
  );
}
