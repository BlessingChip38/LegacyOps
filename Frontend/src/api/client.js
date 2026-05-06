import API_BASE from "../api.js";

// ─── core fetch ─────────────────────────────
const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${url} failed (${res.status}): ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ─── GET ────────────────────────────────────
export const get = (path, auth) =>
  fetchJson(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${auth?.token}`,
      "Content-Type": "application/json"
    }
  });

// ─── WRITE (POST/PATCH/DELETE) ─────────────
export const request = (path, method, auth, body) =>
  fetchJson(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${auth?.token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });