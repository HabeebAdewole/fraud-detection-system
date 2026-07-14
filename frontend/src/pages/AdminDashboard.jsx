import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import Layout from "../components/shared/Layout";

const PRETTY = {
  "RandomForest": "Random Forest",
  "GraphSAGE": "GraphSAGE (GNN)",
  "RandomForest + GNN embeddings": "RF + GNN embeddings",
};

function bar(pct) {
  const color = pct >= 90 ? "#2B44E8" : pct >= 70 ? "#E0870B" : "#E5484D";
  return (
    <div className="h-1.5 rounded-full bg-line overflow-hidden mt-1.5">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [models, setModels] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getMetrics()
      .then((d) => setModels(d.models))
      .catch((err) => setError(err.message));
  }, []);

  const best = models && [...models].sort((a, b) => b.f1_score - a.f1_score)[0];

  return (
    <Layout eyebrow="Administration" title="Model Health"
      actions={best && <span className="pill-cyan">best · {PRETTY[best.model_type] || best.model_type}</span>}>
      {error ? (
        <div className="panel p-8 max-w-lg">
          <p className="eyebrow mb-2 text-amber">No metrics yet</p>
          <p className="text-muted text-sm">{error}</p>
        </div>
      ) : !models ? (
        <p className="text-muted font-mono text-sm">Loading model health…</p>
      ) : (
        <div className="space-y-7">
          {/* Headline */}
          <div className="panel p-7 relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: "radial-gradient(500px 200px at 90% 0%, rgba(43,68,232,0.06), transparent 60%)" }} />
            <div className="relative">
              <p className="eyebrow mb-2">Best model · illicit F1</p>
              <p className="font-mono text-6xl font-semibold text-cyan leading-none">
                {(best.f1_score * 100).toFixed(1)}<span className="text-3xl align-top">%</span>
              </p>
              <p className="text-muted text-sm mt-3 max-w-lg leading-relaxed">
                {PRETTY[best.model_type] || best.model_type} leads on F1 — the balance of catching
                illicit transactions (recall) against false alarms (precision) on the Elliptic
                Bitcoin graph.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="panel overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <p className="eyebrow mb-1">Benchmark</p>
              <h2 className="font-display font-bold tracking-tight">Model comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th><th>AUC</th></tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.model_version}>
                      <td className="font-medium">{PRETTY[m.model_type] || m.model_type}</td>
                      {["accuracy", "precision", "recall", "f1_score", "auc_roc"].map((k) => (
                        <td key={k} className="w-[140px]">
                          <span className="font-mono">{(m[k] * 100).toFixed(1)}%</span>
                          {bar(m[k] * 100)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-4 text-[12px] text-muted border-t border-line-soft leading-relaxed">
              Evaluated on the temporal test split (time steps 35–49). Consistent with Weber et al. (2019),
              the feature-based Random Forest is the strongest single model; the GraphSAGE GNN demonstrates
              graph-based node classification over the transaction network.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
