import { useEffect, useState } from "react";
import { predictionApi } from "../services/api";
import Layout from "../components/shared/Layout";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    predictionApi.listAlerts().then((d) => setAlerts(d.alerts)).finally(() => setLoading(false));
  }, []);

  async function resolve(alertId) {
    const updated = await predictionApi.updateAlert(alertId, {
      alert_status: "resolved",
      notes: notes[alertId] || "",
    });
    setAlerts((prev) => prev.map((a) => (a.alert_id === alertId ? updated : a)));
  }

  const shown = alerts.filter((a) => filter === "all" || a.alert_status === filter);
  const openCount = alerts.filter((a) => a.alert_status === "open").length;

  const Tab = ({ id, label }) => (
    <button
      onClick={() => setFilter(id)}
      className={`font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-md transition-colors ${
        filter === id ? "bg-cyan/12 text-cyan" : "text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Layout
      eyebrow="Operations"
      title="Alerts"
      actions={openCount > 0 && <span className="pill-amber">{openCount} open</span>}
    >
      <div className="flex items-center gap-1 mb-5 panel-2 inline-flex p-1 w-fit">
        <Tab id="all" label="All" />
        <Tab id="open" label="Open" />
        <Tab id="resolved" label="Resolved" />
      </div>

      {loading ? (
        <p className="text-muted font-mono text-sm">Loading alerts…</p>
      ) : shown.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="eyebrow mb-2">All clear</p>
          <p className="text-muted text-sm">No alerts match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((alert) => {
            const open = alert.alert_status === "open";
            return (
              <div key={alert.alert_id} className={`panel p-5 ${open ? "border-amber/25" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm">Alert #{alert.alert_id}</span>
                      <span className={open ? "pill-amber" : "pill-cyan"}>{alert.alert_status}</span>
                    </div>

                    {alert.transaction && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="eyebrow mb-1">Transaction</p>
                          <p className="font-mono text-sm">{alert.transaction.tx_id}</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-1">Ground truth</p>
                          <p className={`font-mono text-sm ${alert.transaction.label === "illicit" ? "text-red" : alert.transaction.label === "licit" ? "text-cyan" : "text-muted"}`}>
                            {alert.transaction.label}
                          </p>
                        </div>
                        <div>
                          <p className="eyebrow mb-1">Probability</p>
                          <p className="font-mono text-sm text-red">{(alert.fraud_probability * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="eyebrow mb-1">Model</p>
                          <p className="font-mono text-sm text-muted">{alert.model_type}</p>
                        </div>
                      </div>
                    )}

                    {alert.notes && (
                      <p className="mt-4 text-[13px] text-muted">
                        <span className="font-mono text-[10px] uppercase tracking-wide mr-2">Note</span>
                        {alert.notes}
                      </p>
                    )}
                  </div>
                </div>

                {open && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-line-soft">
                    <input
                      className="input flex-1"
                      placeholder="Add a resolution note…"
                      value={notes[alert.alert_id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [alert.alert_id]: e.target.value }))}
                    />
                    <button onClick={() => resolve(alert.alert_id)} className="btn-primary whitespace-nowrap">
                      Mark resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
