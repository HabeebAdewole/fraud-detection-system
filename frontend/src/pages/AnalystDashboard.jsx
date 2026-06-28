import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { predictionApi } from "../services/api";
import Layout from "../components/shared/Layout";
import { IconScan } from "../components/shared/icons";

function Stat({ label, value, accent = "text-text", hint }) {
  return (
    <div className="panel p-5">
      <p className="eyebrow mb-3">{label}</p>
      <p className={`font-mono text-3xl font-semibold leading-none ${accent}`}>{value}</p>
      {hint && <p className="text-[12px] text-muted mt-2">{hint}</p>}
    </div>
  );
}

export default function AnalystDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([predictionApi.list(), predictionApi.listAlerts()])
      .then(([p, a]) => {
        setPredictions(p.predictions);
        setAlerts(a.alerts);
      })
      .finally(() => setLoading(false));
  }, []);

  const fraudCount = predictions.filter((p) => p.predicted_class === 1).length;
  const openAlerts = alerts.filter((a) => a.alert_status === "open").length;
  const resolved = alerts.filter((a) => a.alert_status === "resolved").length;

  return (
    <Layout
      eyebrow="Operations"
      title="Overview"
      actions={
        <Link to="/predict" className="btn-primary !py-2"><IconScan /> Analyze</Link>
      }
    >
      {loading ? (
        <p className="text-muted font-mono text-sm">Loading console…</p>
      ) : (
        <div className="space-y-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Screened" value={predictions.length} hint="Transactions analyzed" />
            <Stat label="Flagged fraud" value={fraudCount} accent="text-red" hint="Predicted fraudulent" />
            <Stat label="Open alerts" value={openAlerts} accent="text-amber" hint="Awaiting review" />
            <Stat label="Resolved" value={resolved} accent="text-cyan" hint="Closed by analysts" />
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div>
                <p className="eyebrow mb-1">Activity</p>
                <h2 className="font-display font-bold tracking-tight">Recent screenings</h2>
              </div>
              <Link to="/alerts" className="font-mono text-[11px] text-cyan hover:underline">VIEW ALERTS →</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Txn</th><th>Verdict</th><th>Probability</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.slice(0, 12).map((p) => {
                    const fraud = p.predicted_class === 1;
                    return (
                      <tr key={p.prediction_id}>
                        <td className="font-mono text-muted">#{p.prediction_id}</td>
                        <td className="font-mono">#{p.transaction_id}</td>
                        <td>
                          <span className={fraud ? "pill-red" : "pill-cyan"}>
                            {fraud ? "Fraud" : "Cleared"}
                          </span>
                        </td>
                        <td className={`font-mono ${fraud ? "text-red" : "text-cyan"}`}>
                          {(p.fraud_probability * 100).toFixed(1)}%
                        </td>
                        <td className="font-mono text-[12px] text-muted">
                          {new Date(p.prediction_timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {predictions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted">
                        No screenings yet. <Link to="/predict" className="text-cyan hover:underline">Analyze your first transaction →</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
