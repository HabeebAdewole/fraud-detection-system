import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/shared/ThemeToggle";
import { IconShield, IconScan, IconPulse, IconAlert, IconReport } from "../components/shared/icons";

const STATS = [
  { value: "203K", label: "Bitcoin transactions" },
  { value: "234K", label: "payment-flow edges" },
  { value: "0.807", label: "illicit F1 score" },
  { value: "2", label: "ML models" },
];

const FEATURES = [
  { Icon: IconScan, title: "Risk scoring", body: "Every transaction is scored by a Random Forest and a graph neural network, with a calibrated illicit-probability read-out." },
  { Icon: IconShield, title: "Network analysis", body: "GraphSAGE learns from each transaction's 2-hop neighbourhood — catching laundering patterns isolated features miss." },
  { Icon: IconPulse, title: "Live monitoring", body: "The stream is screened automatically as it arrives; only the highest-risk transactions surface as alerts." },
  { Icon: IconAlert, title: "Alert workflow", body: "Flagged transactions open cases analysts triage, annotate and resolve — the human stays in the loop." },
  { Icon: IconReport, title: "Reporting", body: "Export screening activity and alert outcomes over any date range as audit-ready CSV." },
  { Icon: IconShield, title: "Role-based access", body: "Separate analyst and administrator roles, enforced server-side with JWT authentication." },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const enter = () => navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login");
  const ctaLabel = user ? "Launch console" : "Sign in";

  return (
    <div className="min-h-screen bg-ink text-text">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-cyan"><IconShield width={22} height={22} /></span>
            <span className="font-display font-bold text-lg tracking-tight">Tracer</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={enter} className="btn-primary !py-2">{ctaLabel}</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="eyebrow mb-5">Bitcoin anti-money-laundering</p>
        <h1 className="font-display text-[2.75rem] sm:text-6xl font-extrabold leading-[1.03] tracking-tight max-w-4xl mx-auto">
          Trace illicit funds through the transaction graph.
        </h1>
        <p className="text-muted text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
          Tracer scores real Bitcoin transactions for money-laundering risk using
          machine learning and network analysis — turning millions of raw
          transactions into a short, ranked queue analysts can actually work.
        </p>
        <div className="flex items-center justify-center gap-3 mt-9">
          <button onClick={enter} className="btn-primary px-6 py-3 text-base">{ctaLabel} →</button>
          <a href="#how" className="btn-ghost px-6 py-3 text-base">How it works</a>
        </div>

        {/* Risk spectrum motif */}
        <div className="max-w-lg mx-auto mt-16">
          <div className="h-2.5 rounded-full" style={{ background: "linear-gradient(90deg,#2B44E8,#6E7CF0 40%,#E0870B 72%,#E5484D)" }} />
          <div className="flex justify-between mt-2.5 font-mono text-[10px] uppercase tracking-wide text-muted">
            <span>Cleared</span><span>Elevated</span><span>High risk</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="panel grid grid-cols-2 md:grid-cols-4 divide-x divide-line">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <p className="font-mono text-3xl font-semibold text-cyan leading-none">{s.value}</p>
              <p className="text-muted text-[13px] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="how" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">The platform</p>
          <h2 className="font-display text-3xl font-bold tracking-tight">From raw blockchain to a workable queue</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel p-6 hover:shadow-lift transition-shadow">
              <div className="h-10 w-10 rounded-lg grid place-items-center text-cyan mb-4"
                style={{ background: "rgb(var(--c-cyan) / 0.1)" }}>
                <f.Icon width={20} height={20} />
              </div>
              <h3 className="font-display font-bold tracking-tight mb-2">{f.title}</h3>
              <p className="text-muted text-[14px] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="panel p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(600px 220px at 50% 0%, rgb(var(--c-cyan) / 0.08), transparent 60%)" }} />
          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">See it screen live</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">
              Sign in to the console, replay the transaction stream, and watch alerts
              surface in real time.
            </p>
            <button onClick={enter} className="btn-primary px-6 py-3 text-base mt-7">{ctaLabel} →</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted">
            <span className="text-cyan"><IconShield width={16} height={16} /></span>
            <span className="font-mono text-[12px]">Tracer — Bitcoin AML</span>
          </div>
          <p className="font-mono text-[11px] text-muted">
            BSc Computer Science Final Year Project · Crescent University, Abeokuta
          </p>
        </div>
      </footer>
    </div>
  );
}
