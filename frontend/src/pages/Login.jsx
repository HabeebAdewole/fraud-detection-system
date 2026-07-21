import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconShield } from "../components/shared/icons";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-panel border-r border-line">
        <div className="flex items-center gap-2.5">
          <span className="text-cyan"><IconShield width={24} height={24} /></span>
          <span className="font-display font-bold text-xl tracking-tight">Tracer</span>
        </div>

        <div className="max-w-md">
          <p className="eyebrow mb-4">Bitcoin anti-money-laundering</p>
          <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-text">
            Trace illicit funds through the transaction graph.
          </h1>
          <p className="text-muted mt-5 leading-relaxed text-[15px]">
            Machine-learning risk scoring and network analysis over the Bitcoin
            blockchain — so analysts act on evidence, not hunches.
          </p>

          {/* Risk spectrum motif */}
          <div className="mt-9">
            <div className="h-2 rounded-full" style={{ background: "linear-gradient(90deg,#2B44E8,#6E7CF0 40%,#E0870B 72%,#E5484D)" }} />
            <div className="flex justify-between mt-2 font-mono text-[10px] uppercase tracking-wide text-muted">
              <span>Cleared</span><span>Elevated</span><span>High risk</span>
            </div>
          </div>
        </div>

        <p className="font-mono text-[11px] text-muted">
          Crescent University, Abeokuta — BSc Computer Science
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="text-cyan"><IconShield width={24} height={24} /></span>
            <span className="font-display font-bold text-xl tracking-tight">Tracer</span>
          </div>

          <p className="eyebrow mb-2">Sign in</p>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-7 text-text">Access the console</h2>

          {error && (
            <div className="mb-5 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Username</label>
              <input
                className="input"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Verifying…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 font-mono text-[11px] text-muted leading-relaxed">
            Demo access — analyst / analyst123 · admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
