const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8080';
console.log('API_BASE =', API_BASE);

async function handle(res) {
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data ?? {};
}

export const apiGet = (path) =>
  fetch(`${API_BASE}${path}`, { method: 'GET' }).then(handle);

export const apiPost = (path, body) =>
  fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handle);

export const apiPatch = (path, body) =>
  fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handle);
