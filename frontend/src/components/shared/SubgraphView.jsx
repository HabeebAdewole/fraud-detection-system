/**
 * SubgraphView — radial 1-hop network around the selected transaction.
 * Center node = the analysed transaction; ring = its neighbours, coloured by
 * their known label. The visual answer to "where does this sit in the network?"
 */
const COLOR = {
  illicit: "#FB5468",
  licit: "#2DE1C2",
  unknown: "#5B6478",
};

export default function SubgraphView({ data, centerScore }) {
  if (!data) return null;
  const { center, nodes, edges } = data;
  const neighbours = nodes.filter((n) => n.tx_id !== center);

  const W = 460, H = 360, cx = W / 2, cy = H / 2, R = 130;
  const MAX = 18;
  const shown = neighbours.slice(0, MAX);
  const hidden = neighbours.length - shown.length;

  const pos = {};
  shown.forEach((n, i) => {
    const a = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
    pos[n.tx_id] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  pos[center] = { x: cx, y: cy };

  const centerColor =
    centerScore >= 0.7 ? COLOR.illicit : centerScore >= 0.4 ? "#F6B73C" : COLOR.licit;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="eyebrow">Network · 1-hop neighbourhood</p>
        <span className="font-mono text-[11px] text-muted">{neighbours.length} linked</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Transaction network graph">
        {/* edges */}
        {shown.map((n, i) => {
          const p = pos[n.tx_id];
          return (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="#232C3C" strokeWidth="1.5" />
          );
        })}

        {/* neighbour nodes */}
        {shown.map((n) => {
          const p = pos[n.tx_id];
          return (
            <g key={n.tx_id}>
              <circle cx={p.x} cy={p.y} r="9" fill={COLOR[n.label] || COLOR.unknown}
                opacity={n.label === "unknown" ? 0.5 : 0.9} />
              <title>{`tx ${n.tx_id} · ${n.label}`}</title>
            </g>
          );
        })}

        {/* center node */}
        <circle cx={cx} cy={cy} r="20" fill="none" stroke={centerColor} strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="20;26;20" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r="14" fill={centerColor}
          style={{ filter: `drop-shadow(0 0 8px ${centerColor})` }} />
        <title>{`tx ${center} · analysed`}</title>
      </svg>

      {/* legend */}
      <div className="flex flex-wrap gap-4 mt-2 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.illicit }} /> illicit</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.licit }} /> licit</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: COLOR.unknown }} /> unknown</span>
        {hidden > 0 && <span>+{hidden} more not shown</span>}
      </div>
    </div>
  );
}
