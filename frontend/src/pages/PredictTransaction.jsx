import { useState } from "react";
import { predictionApi } from "../services/api";
import Layout from "../components/shared/Layout";
import RiskMeter from "../components/shared/RiskMeter";

const TX_TYPES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"];
const INITIAL = {
  step: "", type: "TRANSFER", amount: "",
  nameOrig: "", oldbalanceOrg: "", newbalanceOrig: "",
  nameDest: "", oldbalanceDest: "", newbalanceDest: "",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function PredictTransaction() {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
      setResult(await predictionApi.submit(payload));
    } catch (err) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const isFraud = result?.prediction?.predicted_class === 1;

  return (
    <Layout eyebrow="Operations" title="Analyze Transaction">
      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="panel p-6">
          <p className="eyebrow mb-1">Transaction record</p>
          <h2 className="font-display font-bold tracking-tight mb-5">Enter the details to screen</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Step (time unit)">
              <input className="input-mono" type="number" value={form.step} onChange={set("step")} required min="1" />
            </Field>
            <Field label="Type">
              <select className="input" value={form.type} onChange={set("type")}>
                {TX_TYPES.map((t) => <option key={t} className="bg-panel">{t}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Amount">
              <input className="input-mono" type="number" step="0.01" value={form.amount} onChange={set("amount")} required min="0" />
            </Field>
          </div>

          <div className="mt-6 mb-3 flex items-center gap-3">
            <span className="eyebrow">Origin account</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Account ID">
              <input className="input-mono" value={form.nameOrig} onChange={set("nameOrig")} placeholder="C1234…" />
            </Field>
            <Field label="Balance before">
              <input className="input-mono" type="number" step="0.01" value={form.oldbalanceOrg} onChange={set("oldbalanceOrg")} />
            </Field>
            <Field label="Balance after">
              <input className="input-mono" type="number" step="0.01" value={form.newbalanceOrig} onChange={set("newbalanceOrig")} />
            </Field>
          </div>

          <div className="mt-6 mb-3 flex items-center gap-3">
            <span className="eyebrow">Destination account</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Account ID">
              <input className="input-mono" value={form.nameDest} onChange={set("nameDest")} placeholder="C9876…" />
            </Field>
            <Field label="Balance before">
              <input className="input-mono" type="number" step="0.01" value={form.oldbalanceDest} onChange={set("oldbalanceDest")} />
            </Field>
            <Field label="Balance after">
              <input className="input-mono" type="number" step="0.01" value={form.newbalanceDest} onChange={set("newbalanceDest")} />
            </Field>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-7">
            {loading ? "Screening…" : "Run fraud analysis"}
          </button>
        </form>

        {/* Readout */}
        <div className="panel p-6 lg:sticky lg:top-24">
          {error && (
            <div className="panel-2 border-red/30 bg-red/10 px-4 py-3 text-sm text-red mb-4">{error}</div>
          )}

          {!result && !error && (
            <div className="text-center py-10">
              <p className="eyebrow mb-3">Awaiting input</p>
              <p className="text-muted text-sm leading-relaxed">
                Submit a transaction and the model returns a risk verdict with its
                fraud probability here.
              </p>
              <div className="mt-6 h-2.5 rounded-full opacity-30" style={{ background: "linear-gradient(90deg,#1FA892,#2DE1C2 30%,#F6B73C 65%,#FB5468)" }} />
            </div>
          )}

          {result && (
            <div>
              <div className={`flex items-center gap-2 mb-5 ${isFraud ? "text-red" : "text-cyan"}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${isFraud ? "bg-red" : "bg-cyan"}`} style={{ boxShadow: `0 0 12px ${isFraud ? "#FB5468" : "#2DE1C2"}` }} />
                <p className="font-display text-lg font-bold tracking-tight">
                  {isFraud ? "Fraud detected" : "Transaction cleared"}
                </p>
              </div>

              <RiskMeter score={result.prediction.fraud_probability} />

              <dl className="mt-6 space-y-2.5 font-mono text-[12px]">
                <div className="flex justify-between"><dt className="text-muted">Prediction ID</dt><dd>#{result.prediction.prediction_id}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Transaction ID</dt><dd>#{result.transaction.transaction_id}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd>{Number(result.transaction.amount).toLocaleString()}</dd></div>
                {result.alert && (
                  <div className="flex justify-between"><dt className="text-muted">Alert raised</dt><dd className="text-amber">#{result.alert.alert_id} · {result.alert.alert_status}</dd></div>
                )}
              </dl>

              {result.alert && (
                <p className="mt-5 panel-2 border-amber/25 bg-amber/8 px-3 py-2.5 text-[12px] text-amber">
                  An open alert was created. Review it under Alerts to add notes and resolve.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
