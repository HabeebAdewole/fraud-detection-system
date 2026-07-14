import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  IconGrid, IconScan, IconAlert, IconReport, IconUsers, IconPulse, IconLogout, IconShield,
} from "./icons";
import ThemeToggle from "./ThemeToggle";

const ANALYST_NAV = [
  { to: "/dashboard", label: "Overview", Icon: IconGrid },
  { to: "/monitor", label: "Live Monitor", Icon: IconPulse },
  { to: "/predict", label: "Analyze Transaction", Icon: IconScan },
  { to: "/alerts", label: "Alerts", Icon: IconAlert },
  { to: "/reports", label: "Reports", Icon: IconReport },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", Icon: IconGrid },
  { to: "/admin/users", label: "User Accounts", Icon: IconUsers },
  { to: "/admin/metrics", label: "Model Health", Icon: IconPulse },
];

export default function Layout({ title, eyebrow, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? ADMIN_NAV : ANALYST_NAV;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Command rail */}
      <aside className="fixed inset-y-0 left-0 w-60 border-r border-line bg-panel flex flex-col">
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-line">
          <span className="text-cyan"><IconShield width={22} height={22} /></span>
          <div className="leading-none">
            <p className="font-display font-bold tracking-tight text-text text-lg">Tracer</p>
            <p className="font-mono text-[9px] uppercase tracking-eyebrow text-muted mt-0.5">Bitcoin AML</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="eyebrow px-2 mb-2">{user?.role === "admin" ? "Administration" : "Operations"}</p>
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors relative ${
                  isActive
                    ? "bg-cyan/10 text-cyan"
                    : "text-muted hover:text-text hover:bg-panel-2/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-cyan" />
                  )}
                  <Icon />
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line">
          <div className="panel-2 px-3 py-2.5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-cyan/15 text-cyan grid place-items-center font-mono text-sm font-semibold uppercase">
              {user?.username?.[0] ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text truncate">{user?.username}</p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{user?.role}</p>
            </div>
            <button onClick={handleLogout} title="Sign out" className="text-muted hover:text-red transition-colors">
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="pl-60">
        <header className="sticky top-0 z-10 h-16 border-b border-line bg-ink/85 backdrop-blur-md flex items-center justify-between px-8">
          <div>
            {eyebrow && <p className="eyebrow mb-0.5">{eyebrow}</p>}
            <h1 className="font-display text-xl font-bold tracking-tight text-text leading-none">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {actions}
            <span className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
              MODEL ONLINE
            </span>
            <ThemeToggle />
          </div>
        </header>

        <main className="px-8 py-7 max-w-[1200px]">{children}</main>
      </div>
    </div>
  );
}
