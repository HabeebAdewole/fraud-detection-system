import { useEffect, useState } from "react";
import { predictionApi } from "../services/api";
import Navbar from "../components/shared/Navbar";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    predictionApi.listAlerts().then(d => setAlerts(d.alerts)).finally(() => setLoading(false));
  }, []);

  async function resolve(alertId) {
    const updated = await predictionApi.updateAlert(alertId, {
      alert_status: "resolved",
      notes: notes[alertId] || "",
    });
    setAlerts(prev => prev.map(a => a.alert_id === alertId ? updated : a));
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-6">Fraud Alerts</h2>
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-slate-500">No alerts found.</p>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.alert_id} className={`bg-slate-800 border rounded-xl p-5 ${alert.alert_status === "open" ? "border-yellow-600" : "border-slate-700"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-semibold">Alert #{alert.alert_id}</span>
                    <span className={`ml-3 px-2 py-0.5 text-xs rounded-full font-semibold ${alert.alert_status === "open" ? "bg-yellow-900/50 text-yellow-300" : "bg-green-900/50 text-green-300"}`}>
                      {alert.alert_status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm">Prediction #{alert.prediction_id}</span>
                </div>

                {alert.transaction && (
                  <div className="grid grid-cols-3 gap-2 text-sm text-slate-300 mb-3">
                    <span>Type: <strong>{alert.transaction.type}</strong></span>
                    <span>Amount: <strong>${alert.transaction.amount?.toLocaleString()}</strong></span>
                    <span>Fraud prob: <strong className="text-red-400">{(alert.fraud_probability * 100).toFixed(1)}%</strong></span>
                  </div>
                )}

                {alert.alert_status === "open" && (
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add resolution notes…"
                      value={notes[alert.alert_id] || ""}
                      onChange={e => setNotes(n => ({ ...n, [alert.alert_id]: e.target.value }))}
                    />
                    <button
                      onClick={() => resolve(alert.alert_id)}
                      className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg font-semibold transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                )}

                {alert.notes && <p className="text-slate-400 text-sm mt-2">Notes: {alert.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
