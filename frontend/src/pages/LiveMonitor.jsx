import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { monitorApi } from "../services/api";
import Layout from "../components/shared/Layout";

const PLAY_INTERVAL_MS = 4000;

function Stat({ label, value, accent = "text-text" }) {
  return (
    <div className="panel p-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className={`font-mono text-2xl font-semibold leading-none ${accent}`}>{value}</p>
    </div>
  );
}

export default function LiveMonitor() {
  const [status, setStatus] = useState(null);
  const [feed, setFeed] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    monitorApi.status().then(setStatus).catch((e) => setError(e.message));
    return () => clearInterval(timerRef.current);
  }, []);

  async function advance() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await monitorApi.advance();
      setFeed((prev) => [r, ...prev].slice(0, 30));
      const s = await monitorApi.status();
      setStatus(s);
      if (r.done) stop();
    } catch (e) {
      setError(e.message || "Screening failed");
      stop();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function play() {
    setPlaying(true);
    advance();
    timerRef.current = setInterval(advance, PLAY_INTERVAL_MS);
  }
  function stop() {
    setPlaying(false);
    clearInterval(timerRef.current);
  }

  const progress = status ? ((status.last_step - 34) / (status.final_step - 34)) * 100 : 0;

  return (
    <Layout
      eyebrow="Operations"
      title="Live Monitor"
      actions={
        status && !status.done && (
          <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
            {playing && <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />}
            {playing ? "SCREENING LIVE" : "PAUSED"}
          </span>
        )
      }
    >
      {error && <div className="panel-2 border-red/30 bg-red/10 px-4 py-3 text-sm text-red mb-5">{error}</div>}

      {!status ? (
        <p className="text-muted font-mono text-sm">Loading monitor…</p>
      ) : (
        <div className="space-y-6">
          {/* Controls + progress */}
          <div className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <p className="eyebrow mb-1">Replaying the test period as a live stream</p>
                <p className="text-sm text-muted max-w-xl leading-relaxed">
                  Each time step arrives as a batch of transactions the models have never seen.
                  Every one is screened automatically; the highest-risk crossings open alerts.
                </p>
              </div>
              <div className="flex gap-2">
                {!status.done && (playing ? (
                  <button onClick={stop} className="btn-ghost">Pause</button>
                ) : (
                  <button onClick={play} className="btn-primary">▶ Start monitoring</button>
                ))}
                {!status.done && !playing && (
                  <button onClick={advance} disabled={busy} className="btn-ghost">
                    {busy ? "Screening…" : "Advance one step"}
                  </button>
                )}
                {status.done && <span className="pill-cyan">Replay complete — step 49 reached</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-muted whitespace-nowrap">step {status.last_step}/{status.final_step}</span>
              <div className="h-1.5 flex-1 rounded-full bg-line overflow-hidden">
                <div className="h-full rounded-full bg-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Steps screened" value={`${status.last_step - 34}/15`} />
            <Stat label="Screened (session)" value={feed.reduce((a, r) => a + r.screened, 0).toLocaleString()} />
            <Stat label="Flags (session)" value={feed.reduce((a, r) => a + r.flagged, 0)} accent="text-amber" />
            <Stat label="Open alerts" value={status.open_alerts} accent="text-red" />
          </div>

          {/* Screening feed */}
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div>
                <p className="eyebrow mb-1">Feed</p>
                <h2 className="font-display font-bold tracking-tight">Screening log</h2>
              </div>
              <Link to="/alerts" className="font-mono text-[11px] text-cyan hover:underline">OPEN ALERT QUEUE →</Link>
            </div>
            {feed.length === 0 ? (
              <p className="p-8 text-center text-muted text-sm">
                Press <span className="text-cyan">Start monitoring</span> to begin the replay from step {status.next_step ?? "—"}.
              </p>
            ) : (
              <ul>
                {feed.map((r) => (
                  <li key={r.time_step} className="px-5 py-3.5 border-b border-line-soft flex flex-wrap items-center gap-x-6 gap-y-1">
                    <span className="font-mono text-sm text-text w-16">step {r.time_step}</span>
                    <span className="font-mono text-[12px] text-muted">{r.screened.toLocaleString()} screened</span>
                    <span className={`font-mono text-[12px] ${r.flagged > 0 ? "text-amber" : "text-muted"}`}>
                      {r.flagged} crossed threshold
                    </span>
                    <span className={`font-mono text-[12px] ${r.new_alerts > 0 ? "text-red" : "text-muted"}`}>
                      {r.new_alerts} alerts raised{r.flagged > r.new_alerts ? ` (top ${r.alert_budget} by score)` : ""}
                    </span>
                    <span className="font-mono text-[11px] text-muted ml-auto">
                      RF {r.flagged_by.rf} · GNN {r.flagged_by.gnn} · both {r.flagged_by.both}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
