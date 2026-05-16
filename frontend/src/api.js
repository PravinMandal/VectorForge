// Handled by Vite proxy
const API = '';

export async function fetchItems() {
  const r = await fetch(`${API}/items`);
  return r.json();
}

export async function insertItem(meta, cat, emb) {
  const r = await fetch(`${API}/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: meta, category: cat, embedding: emb })
  });
  return r.text();
}

export async function deleteItem(id) {
  const r = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
  return r.text();
}

export async function searchVectors(emb, k, metric, algo) {
  const r = await fetch(`${API}/search?v=${emb.join(',')}&k=${k}&metric=${metric}&algo=${algo}`);
  return r.json();
}

export async function runBenchmark(emb, metric) {
  const r = await fetch(`${API}/benchmark?v=${emb.join(',')}&k=5&metric=${metric}`);
  return r.json();
}

export async function getHNSWInfo() {
  const r = await fetch(`${API}/hnsw-info`);
  return r.json();
}

export async function checkOllamaStatus() {
  const r = await fetch(`${API}/status`);
  return r.json();
}

export async function insertDoc(title, text) {
  const r = await fetch(`${API}/doc/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, text })
  });
  return r.json();
}

export async function getDocList() {
  const r = await fetch(`${API}/doc/list`);
  return r.json();
}

export async function deleteDoc(id) {
  const r = await fetch(`${API}/doc/delete/${id}`, { method: 'DELETE' });
  return r.text();
}

export async function askAI(question, k) {
  const r = await fetch(`${API}/doc/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, k })
  });
  return r.json();
}

export async function docSearch(question, k) {
  const r = await fetch(`${API}/doc/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, k })
  });
  return r.json();
}
