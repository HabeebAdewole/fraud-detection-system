import { useEffect, useState } from "react";
import { reportApi } from "../services/api";
import Navbar from "../components/shared/Navbar";

const TYPES = ["fraud_summary", "alert_resolution", "transaction_overview"];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ report_type: "fraud_summary", date_range_start: "", date_range_end: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    reportApi.list().then(d => setReports(d.reports));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const report = await reportApi.generate(form);
      setReports(prev => [report, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-6">Reports</h2>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-8">
          <h3 className="text-white font-semibold mb-4">Generate New Report</h3>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <form onSubmit={handleGenerate} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Report Type</label>
              <select className={inputCls} value={form.report_type} onChange={e => setForm(f => ({ ...f, report_type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Start Date</label>
              <input type="date" className={inputCls} required value={form.date_range_start} onChange={e => setForm(f => ({ ...f, date_range_start: e.target.value }))} />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">End Date</label>
              <input type="date" className={inputCls} required value={form.date_range_end} onChange={e => setForm(f => ({ ...f, date_range_end: e.target.value }))} />
            </div>
            <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              {loading ? "Generating…" : "Generate"}
            </button>
          </form>
        </div>

        <h3 className="text-white font-semibold mb-3">Report History</h3>
        {reports.length === 0 ? (
          <p className="text-slate-500">No reports generated yet.</p>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm text-slate-300">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr>
                  {["ID", "Type", "Date Range", "Generated At", "Download"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.report_id} className="border-b border-slate-700 hover:bg-slate-700/40">
                    <td className="px-4 py-3">{r.report_id}</td>
                    <td className="px-4 py-3 capitalize">{r.report_type.replace("_", " ")}</td>
                    <td className="px-4 py-3">{r.date_range_start} → {r.date_range_end}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.generated_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <a
                        href={reportApi.downloadUrl(r.report_id)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                        download
                      >
                        Download CSV
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
  );
}
