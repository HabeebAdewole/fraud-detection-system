import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/shared/Layout";

const BLANK = { username: "", email: "", password: "", role: "analyst" };

export default function AdminUsers() {
  const { user } = useAuth();
  const readOnly = Boolean(user?.demo_mode);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    adminApi.listUsers().then((d) => setUsers(d.users));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const user = await adminApi.createUser(form);
      setUsers((prev) => [...prev, user]);
      setForm(BLANK);
      setSuccess(`${user.username} added as ${user.role}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm("Delete this account? This cannot be undone.")) return;
    setError(""); setSuccess("");
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (err) {
      // The API refuses to delete the last administrator or your own account.
      setError(err.message);
    }
  }

  return (
    <Layout
      eyebrow="Administration"
      title="User Accounts"
      actions={<span className="pill-muted">{users.length} accounts</span>}
    >
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <form onSubmit={handleCreate} className="panel p-6">
          <p className="eyebrow mb-1">New account</p>
          <h2 className="font-display font-bold tracking-tight mb-5">Add a team member</h2>

          {readOnly && (
            <div className="panel-2 border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber mb-4">
              <span className="font-medium">Read-only demo.</span> This deployment
              publishes its sign-in details, so account management is disabled.
              Run the project locally for the full admin panel.
            </div>
          )}
          {error && <div className="panel-2 border-red/30 bg-red/10 px-4 py-3 text-sm text-red mb-4">{error}</div>}
          {success && <div className="panel-2 border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan mb-4">{success}</div>}

          <fieldset disabled={readOnly} className="space-y-4 disabled:opacity-50">
            <div><label className="field-label">Username</label><input className="input" value={form.username} onChange={set("username")} required /></div>
            <div><label className="field-label">Email</label><input type="email" className="input" value={form.email} onChange={set("email")} required /></div>
            <div><label className="field-label">Password</label><input type="password" className="input" value={form.password} onChange={set("password")} required minLength={6} /></div>
            <div>
              <label className="field-label">Role</label>
              <select className="input" value={form.role} onChange={set("role")}>
                <option value="analyst" className="bg-panel">Fraud Analyst</option>
                <option value="admin" className="bg-panel">System Administrator</option>
              </select>
            </div>
            <button className="btn-primary w-full">Create account</button>
          </fieldset>
        </form>

        <div className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <p className="eyebrow mb-1">Directory</p>
            <h2 className="font-display font-bold tracking-tight">All accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td className="font-mono text-muted">#{u.user_id}</td>
                    <td className="font-medium">{u.username}</td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={u.role === "admin" ? "pill-cyan" : "pill-muted"}>{u.role}</span>
                    </td>
                    <td className="font-mono text-[12px] text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      {!readOnly && (
                        <button onClick={() => handleDelete(u.user_id)} className="font-mono text-[11px] text-muted hover:text-red transition-colors">
                          DELETE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted">No accounts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
