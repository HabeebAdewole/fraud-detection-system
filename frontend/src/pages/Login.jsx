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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand / atmosphere */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 border-r border-line overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(600px 400px at 20% 10%, rgba(45,225,194,0.10), transparent 60%), radial-gradient(500px 400px at 90% 90%, rgba(251,84,104,0.08), transparent 60%)",
          }}
        />
        <div className="flex items-center gap-2.5">
          <span className="text-cyan"><IconShield width={24} height={24} /></span>
          <span className="font-display font-bold text-xl tracking-tight">SENTINEL</span>
        </div>

        <div className="max-w-md">
          <p className="eyebrow mb-4">Real-time transaction screening</p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            Every transaction,<br />scored before it settles.
          </h1>
          <p className="text-muted mt-4 leading-relaxed">
            A machine-learning console that flags fraudulent activity the moment it
            appears — so analysts act on risk, not hunches.
          </p>

          {/* Spectrum motif */}
          <div className="mt-8">
            <div className="h-1.5 rounded-full" style={{ background: "linear-gradient(90deg,#1FA892,#2DE1C2 30%,#F6B73C 65%,#FB5468)" }} />
            <div className="flex justify-between mt-2 font-mono text-[10px] text-muted">
              <span>CLEARED</span><span>ELEVATED</span><span>HIGH RISK</span>
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
            <span className="font-display font-bold text-xl tracking-tight">SENTINEL</span>
          </div>

          <p className="eyebrow mb-2">Sign in</p>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-7">Access the console</h2>

          {error && (
            <div className="mb-5 panel-2 border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
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
