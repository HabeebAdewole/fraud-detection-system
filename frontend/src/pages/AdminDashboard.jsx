import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import Layout from "../components/shared/Layout";

const META = {
  accuracy:  { label: "Accuracy",  note: "Overall correct classifications" },
  precision: { label: "Precision", note: "Share of flags that were truly fraud" },
  recall:    { label: "Recall",    note: "Share of real fraud the model caught" },
  f1_score:  { label: "F1 Score",  note: "Balance of precision and recall" },
  auc_roc:   { label: "AUC-ROC",   note: "Ability to separate fraud from legitimate" },
};

function MetricBar({ value, label, note }) {
  const pct = (value ?? 0) * 100;
  const color = pct >= 90 ? "#2DE1C2" : pct >= 70 ? "#F6B73C" : "#FB5468";
  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="eyebrow">{label}</p>
        <p className="font-mono text-2xl font-semibold" style={{ color }}>{pct.toFixed(2)}%</p>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-[12px] text-muted mt-3 leading-snug">{note}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getMetrics().then(setMetrics).catch((err) => setError(err.message));
  }, []);

  return (
    <Layout
      eyebrow="Administration"
      title="Model Health"
      actions={metrics && <span className="pill-cyan">v{metrics.model_version}</span>}
    >
      {error ? (
        <div className="panel p-8 max-w-lg">
          <p className="eyebrow mb-2 text-amber">Model not evaluated</p>
          <p className="text-muted text-sm leading-relaxed">{error}</p>
          <p className="font-mono text-[12px] text-muted mt-4">
            Run <span className="text-cyan">python ml_pipeline/train.py</span> to train the model and populate metrics.
          </p>
        </div>
      ) : !metrics ? (
        <p className="text-muted font-mono text-sm">Loading model health…</p>
      ) : (
        <div className="space-y-7">
          {/* Hero — recall is the headline metric for fraud */}
          <div className="panel p-7 relative overflow-hidden">
            <div className="absolute inset-0 -z-0" style={{ background: "radial-gradient(500px 200px at 90% 0%, rgba(45,225,194,0.08), transparent 60%)" }} />
            <div className="relative">
              <p className="eyebrow mb-2">Headline · fraud caught</p>
              <p className="font-mono text-6xl font-semibold text-cyan leading-none">
                {(metrics.recall * 100).toFixed(1)}<span className="text-3xl align-top">%</span>
              </p>
              <p className="text-muted text-sm mt-3 max-w-md leading-relaxed">
                Recall is the metric that matters most for fraud detection — it's the
                proportion of genuinely fraudulent transactions the model successfully flags.
              </p>
              <p className="font-mono text-[11px] text-muted mt-4">
                Evaluated {new Date(metrics.evaluated_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">All metrics</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(META).map(([key, m]) => (
                <MetricBar key={key} value={metrics[key]} label={m.label} note={m.note} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
