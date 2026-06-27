const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.error || "Request failed" };
  return data;
}

export const authApi = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => request("/auth/me"),
};

export const transactionApi = {
  list: (page = 1) => request(`/transactions/?page=${page}`),
  get: (id) => request(`/transactions/${id}`),
};

export const predictionApi = {
  submit: (payload) =>
    request("/predictions/", { method: "POST", body: JSON.stringify(payload) }),
  list: (page = 1) => request(`/predictions/?page=${page}`),
  listAlerts: (status) =>
    request(`/predictions/alerts${status ? `?status=${status}` : ""}`),
  updateAlert: (id, payload) =>
    request(`/predictions/alerts/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};

export const reportApi = {
  generate: (payload) =>
    request("/reports/", { method: "POST", body: JSON.stringify(payload) }),
  list: () => request("/reports/"),
  downloadUrl: (id) => `${BASE_URL}/reports/${id}/download`,
};

export const adminApi = {
  listUsers: () => request("/admin/users"),
  createUser: (payload) =>
    request("/admin/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteUser: (id) =>
    request(`/admin/users/${id}`, { method: "DELETE" }),
  getMetrics: () => request("/admin/metrics"),
};
