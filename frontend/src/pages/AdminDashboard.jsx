import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import Navbar from "../components/shared/Navbar";

function MetricCard({ label, value, suffix = "" }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-blue-400">{value !== undefined ? `${(value * 100).toFixed(1)}${suffix}` : "—"}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState("");

  useEffect(() => {
    adminApi.getMetrics()
      .then(setMetrics)
      .catch(err => setMetricsError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-6">Admin Dashboard</h2>

        <h3 className="text-white font-semibold mb-3">Model Performance Metrics</h3>
        {metricsError ? (
          <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl text-yellow-300 text-sm mb-6">{metricsError}</div>
        ) : metrics ? (
          <>
            <p className="text-slate-400 text-sm mb-4">Model version: <strong className="text-white">{metrics.model_version}</strong> · Evaluated: {new Date(metrics.evaluated_at).toLocaleString()}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
              <MetricCard label="Accuracy" value={metrics.accuracy} suffix="%" />
              <MetricCard label="Precision" value={metrics.precision} suffix="%" />
              <MetricCard label="Recall" value={metrics.recall} suffix="%" />
              <MetricCard label="F1-Score" value={metrics.f1_score} suffix="%" />
              <MetricCard label="AUC-ROC" value={metrics.auc_roc} suffix="%" />
            </div>
          </>
        ) : (
          <p className="text-slate-400 mb-8">Loading metrics…</p>
        )}
      </div>
    </div>
  );
}
