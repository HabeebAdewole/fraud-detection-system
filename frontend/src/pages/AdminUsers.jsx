import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import Navbar from "../components/shared/Navbar";

const BLANK = { username: "", email: "", password: "", role: "analyst" };
const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { adminApi.listUsers().then(d => setUsers(d.users)); }, []);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function handleCreate(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const user = await adminApi.createUser(form);
      setUsers(prev => [...prev, user]);
      setForm(BLANK);
      setSuccess("User created successfully.");
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(userId) {
    if (!window.confirm("Delete this user?")) return;
    await adminApi.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.user_id !== userId));
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-6">User Management</h2>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-8">
          <h3 className="text-white font-semibold mb-4">Create New User</h3>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-400 text-sm mb-3">{success}</p>}
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div><label className="block text-slate-400 text-xs mb-1">Username</label><input className={inputCls} value={form.username} onChange={set("username")} required /></div>
            <div><label className="block text-slate-400 text-xs mb-1">Email</label><input type="email" className={inputCls} value={form.email} onChange={set("email")} required /></div>
            <div><label className="block text-slate-400 text-xs mb-1">Password</label><input type="password" className={inputCls} value={form.password} onChange={set("password")} required minLength={6} /></div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Role</label>
              <select className={inputCls} value={form.role} onChange={set("role")}>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">Create User</button>
            </div>
          </form>
        </div>

        <h3 className="text-white font-semibold mb-3">All Users</h3>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-slate-300">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                {["ID", "Username", "Email", "Role", "Created", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} className="border-b border-slate-700 hover:bg-slate-700/40">
                  <td className="px-4 py-3">{u.user_id}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(u.user_id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
