const API = import.meta.env.VITE_API_BASE || "http://localhost:8081";

export async function uploadFiles(files) {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  const res = await fetch(`${API}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { files: [{kind,name,type,size,url}] }
}

export async function listTickets() {
  const res = await fetch(`${API}/tickets`);
  return res.json();
}

export async function createTicket(data) {
  const res = await fetch(`${API}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateStatus(id, status) {
  const res = await fetch(`${API}/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function addMessage(id, body, fromAdmin = true) {
  const res = await fetch(`${API}/tickets/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, fromAdmin }),
  });
  return res.json();
}

export async function deleteTicket(id) {
  const res = await fetch(`${API}/tickets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
