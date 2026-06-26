import { useState } from "react";
import { predictionApi } from "../services/api";
import Navbar from "../components/shared/Navbar";

const TX_TYPES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"];
const INITIAL = {
  step: "", type: "TRANSFER", amount: "",
  nameOrig: "", oldbalanceOrg: "", newbalanceOrig: "",
  nameDest: "", oldbalanceDest: "", newbalanceDest: "",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

export default function PredictTransaction() {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        step: Number(form.step),
        amount: Number(form.amount),
        oldbalanceOrg: Number(form.oldbalanceOrg),
        newbalanceOrig: Number(form.newbalanceOrig),
        oldbalanceDest: Number(form.oldbalanceDest),
        newbalanceDest: Number(form.newbalanceDest),
      };
      const data = await predictionApi.submit(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  const isFraud = result?.prediction?.predicted_class === 1;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-6">Submit Transaction for Analysis</h2>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-600 rounded-lg text-red-300 text-sm">{error}</div>}

        {result && (
          <div className={`mb-6 p-5 rounded-xl border ${isFraud ? "bg-red-900/30 border-red-600" : "bg-green-900/30 border-green-600"}`}>
            <p className={`text-xl font-bold mb-1 ${isFraud ? "text-red-300" : "text-green-300"}`}>
              {isFraud ? "FRAUD DETECTED" : "LEGITIMATE TRANSACTION"}
            </p>
            <p className="text-slate-300 text-sm">
              Fraud probability: <strong>{(result.prediction.fraud_probability * 100).toFixed(2)}%</strong>
            </p>
            <p className="text-slate-300 text-sm">Prediction ID: {result.prediction.prediction_id}</p>
            {result.alert && <p className="text-yellow-300 text-sm mt-1">Alert #{result.alert.alert_id} created — status: {result.alert.alert_status}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Step (time unit)">
              <input className={inputCls} type="number" value={form.step} onChange={set("step")} required min="1" />
            </Field>
            <Field label="Transaction Type">
              <select className={inputCls} value={form.type} onChange={set("type")}>
                {TX_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Amount">
            <input className={inputCls} type="number" step="0.01" value={form.amount} onChange={set("amount")} required min="0" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Origin Account (nameOrig)">
              <input className={inputCls} value={form.nameOrig} onChange={set("nameOrig")} placeholder="C123456789" />
            </Field>
            <Field label="Destination Account (nameDest)">
              <input className={inputCls} value={form.nameDest} onChange={set("nameDest")} placeholder="C987654321" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Origin Old Balance">
              <input className={inputCls} type="number" step="0.01" value={form.oldbalanceOrg} onChange={set("oldbalanceOrg")} />
            </Field>
            <Field label="Origin New Balance">
              <input className={inputCls} type="number" step="0.01" value={form.newbalanceOrig} onChange={set("newbalanceOrig")} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Destination Old Balance">
              <input className={inputCls} type="number" step="0.01" value={form.oldbalanceDest} onChange={set("oldbalanceDest")} />
            </Field>
            <Field label="Destination New Balance">
              <input className={inputCls} type="number" step="0.01" value={form.newbalanceDest} onChange={set("newbalanceDest")} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Analysing…" : "Run Fraud Analysis"}
          </button>
        </form>
      </div>
    </div>
  );
}
