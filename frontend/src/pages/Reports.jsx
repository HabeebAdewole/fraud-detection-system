import { useEffect, useState } from "react";
import { reportApi } from "../services/api";
import Layout from "../components/shared/Layout";

const TYPES = ["fraud_summary", "alert_resolution", "transaction_overview"];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ report_type: "fraud_summary", date_range_start: "", date_range_end: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    reportApi.list().then((d) => setReports(d.reports));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const report = await reportApi.generate(form);
      setReports((prev) => [report, ...prev]);
    } catch (err) {
      setError(err.message || "Could not generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout eyebrow="Operations" title="Reports">
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <form onSubmit={handleGenerate} className="panel p-6">
          <p className="eyebrow mb-1">New report</p>
          <h2 className="font-display font-bold tracking-tight mb-5">Export screening data</h2>

          {error && <div className="panel-2 border-red/30 bg-red/10 px-4 py-3 text-sm text-red mb-4">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="field-label">Report type</label>
              <select className="input" value={form.report_type} onChange={(e) => setForm((f) => ({ ...f, report_type: e.target.value }))}>
                {TYPES.map((t) => <option key={t} className="bg-panel">{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">From</label>
              <input type="date" className="input-mono" required value={form.date_range_start} onChange={(e) => setForm((f) => ({ ...f, date_range_start: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">To</label>
              <input type="date" className="input-mono" required value={form.date_range_end} onChange={(e) => setForm((f) => ({ ...f, date_range_end: e.target.value }))} />
            </div>
            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Generating…" : "Generate report"}
            </button>
          </div>
        </form>

        <div className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <p className="eyebrow mb-1">History</p>
            <h2 className="font-display font-bold tracking-tight">Generated reports</h2>
          </div>
          {reports.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">No reports yet — generate one to start a history.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Type</th><th>Range</th><th>Generated</th><th>File</th></tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.report_id}>
                      <td className="font-mono text-muted">#{r.report_id}</td>
                      <td className="capitalize">{r.report_type.replace(/_/g, " ")}</td>
                      <td className="font-mono text-[12px]">{r.date_range_start} → {r.date_range_end}</td>
                      <td className="font-mono text-[12px] text-muted">{new Date(r.generated_at).toLocaleDateString()}</td>
                      <td>
                        <a href={reportApi.downloadUrl(r.report_id)} download className="font-mono text-[11px] text-cyan hover:underline">
                          DOWNLOAD CSV ↓
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
