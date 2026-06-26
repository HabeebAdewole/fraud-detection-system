import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-white font-bold text-lg">FraudGuard</span>
        {user?.role === "analyst" && (
          <>
            <Link className="text-slate-300 hover:text-white text-sm" to="/dashboard">Dashboard</Link>
            <Link className="text-slate-300 hover:text-white text-sm" to="/predict">Submit Transaction</Link>
            <Link className="text-slate-300 hover:text-white text-sm" to="/alerts">Alerts</Link>
            <Link className="text-slate-300 hover:text-white text-sm" to="/reports">Reports</Link>
          </>
        )}
        {user?.role === "admin" && (
          <>
            <Link className="text-slate-300 hover:text-white text-sm" to="/admin">Dashboard</Link>
            <Link className="text-slate-300 hover:text-white text-sm" to="/admin/users">Users</Link>
            <Link className="text-slate-300 hover:text-white text-sm" to="/admin/metrics">Model Metrics</Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm">{user?.username} · <span className="capitalize">{user?.role}</span></span>
        <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
      </div>
    </nav>
  );
}
