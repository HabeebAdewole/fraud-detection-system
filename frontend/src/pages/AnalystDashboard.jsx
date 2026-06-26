import { useEffect, useState } from "react";
import { predictionApi, transactionApi } from "../services/api";
import Navbar from "../components/shared/Navbar";

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function AnalystDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([predictionApi.list(), predictionApi.listAlerts()])
      .then(([predData, alertData]) => {
        setPredictions(predData.predictions);
        setAlerts(alertData.alerts);
      })
      .finally(() => setLoading(false));
  }, []);

  const fraudCount = predictions.filter(p => p.predicted_class === 1).length;
  const openAlerts = alerts.filter(a => a.alert_status === "open").length;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-6">Analyst Dashboard</h2>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Predictions" value={predictions.length} />
              <StatCard label="Fraud Detected" value={fraudCount} color="text-red-400" />
              <StatCard label="Open Alerts" value={openAlerts} color="text-yellow-400" />
              <StatCard label="Resolved" value={alerts.filter(a => a.alert_status === "resolved").length} color="text-green-400" />
            </div>

            <h3 className="text-white font-semibold mb-3">Recent Predictions</h3>
            <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700">
              <table className="w-full text-sm text-slate-300">
                <thead className="text-slate-400 border-b border-slate-700">
                  <tr>
                    {["ID", "Transaction", "Result", "Probability", "Timestamp"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {predictions.slice(0, 10).map(p => (
                    <tr key={p.prediction_id} className="border-b border-slate-700 hover:bg-slate-700/40">
                      <td className="px-4 py-3">{p.prediction_id}</td>
                      <td className="px-4 py-3">{p.transaction_id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.predicted_class === 1 ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}`}>
                          {p.predicted_class === 1 ? "FRAUD" : "LEGITIMATE"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{(p.fraud_probability * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(p.prediction_timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {predictions.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No predictions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
