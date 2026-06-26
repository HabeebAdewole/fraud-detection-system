import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AnalystDashboard from "./pages/AnalystDashboard";
import PredictTransaction from "./pages/PredictTransaction";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Analyst routes */}
          <Route path="/dashboard" element={<RequireAuth role="analyst"><AnalystDashboard /></RequireAuth>} />
          <Route path="/predict"   element={<RequireAuth role="analyst"><PredictTransaction /></RequireAuth>} />
          <Route path="/alerts"    element={<RequireAuth role="analyst"><Alerts /></RequireAuth>} />
          <Route path="/reports"   element={<RequireAuth role="analyst"><Reports /></RequireAuth>} />

          {/* Admin routes */}
          <Route path="/admin"         element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/users"   element={<RequireAuth role="admin"><AdminUsers /></RequireAuth>} />
          <Route path="/admin/metrics" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
