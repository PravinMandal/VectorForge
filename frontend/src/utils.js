export const DIMS = 16;

export const COL = {
  cs:      '#00d9ff',
  math:    '#b388ff',
  food:    '#ffb74d',
  sports:  '#69f0ae',
  doc:     '#a6e3a1',
  green:   '#a6e3a1',   // alias used in LeftPanel legend
  default: '#90a4ae',
};

export const DIM_COL = [
  '#00d9ff','#00d9ff','#00d9ff','#00d9ff',
  '#b388ff','#b388ff','#b388ff','#b388ff',
  '#ffb74d','#ffb74d','#ffb74d','#ffb74d',
  '#69f0ae','#69f0ae','#69f0ae','#69f0ae',
];

const KW = {
  cs:     ['algorithm','data','tree','graph','array','linked','hash','stack','queue','sort','binary','dynamic','programming','recursion','complexity','pointer','node','search','insert','bfs','dfs','heap','trie'],
  math:   ['calculus','matrix','probability','theorem','integral','derivative','linear','algebra','equation','function','prime','modular','combinatorics','permutation','eigenvalue','statistics','proof'],
  food:   ['food','pizza','sushi','ramen','pasta','recipe','cook','eat','restaurant','dish','ingredient','flavor','spice','noodle','bread','croissant','taco','fish','rice','soup'],
  sports: ['sport','basketball','football','tennis','chess','swim','game','play','score','team','athlete','competition','match','tournament','olympic','dribble','tackle','serve'],
};

export function textToEmbedding(text) {
  const t = text.toLowerCase(), ws = t.split(/\s+/);
  const s = { cs: 0, math: 0, food: 0, sports: 0 };
  for (const w of ws)
    for (const [cat, kws] of Object.entries(KW))
      for (const kw of kws) if (w.includes(kw) || kw.startsWith(w)) { s[cat] += 0.35; break; }
  const mx = Math.max(...Object.values(s), 0.01);
  const n = v => Math.min(v / mx * 0.88, 0.94);
  const jitter = () => (Math.random() - .5) * .04;
  const emb = new Array(16).fill(0.08);
  const fill = (i, score) => {
    if (score < .01) return;
    const b = n(score);
    emb[i]     = Math.max(.05, b + jitter());
    emb[i + 1] = Math.max(.05, b + jitter());
    emb[i + 2] = Math.max(.05, b * .92 + jitter());
    emb[i + 3] = Math.max(.05, b * .87 + jitter());
  };
  fill(0, s.cs); fill(4, s.math); fill(8, s.food); fill(12, s.sports);
  return emb;
}

export function pca2D(embs) {
  const n = embs.length, d = embs[0].length;
  if (n < 2) return embs.map(() => [0, 0]);
  const mean = new Array(d).fill(0);
  for (const e of embs) for (let i = 0; i < d; i++) mean[i] += e[i] / n;
  const centered = embs.map(e => e.map((v, i) => v - mean[i]));
  // Power iteration for top-2 PCs
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const scale = (a, k) => a.map(v => v * k);
  const addV = (a, b) => a.map((v, i) => v + b[i]);
  const norm = a => Math.sqrt(dot(a, a)) || 1;
  const project = (data, v) => data.map(e => dot(e, v));
  const outer = (scores, data) => {
    const res = new Array(d).fill(0);
    for (let i = 0; i < data.length; i++)
      for (let j = 0; j < d; j++) res[j] += scores[i] * data[i][j];
    return res;
  };
  let v1 = centered[0].map((_, i) => i === 0 ? 1 : 0);
  for (let iter = 0; iter < 40; iter++) {
    const sc = project(centered, v1);
    let nv = outer(sc, centered);
    const l = norm(nv); nv = scale(nv, 1 / l);
    v1 = nv;
  }
  const s1 = project(centered, v1);
  const deflated = centered.map((e, i) => e.map((v, j) => v - s1[i] * v1[j]));
  let v2 = deflated[1] ? deflated[1].map((_, i) => i === 1 ? 1 : 0) : new Array(d).fill(0);
  for (let iter = 0; iter < 40; iter++) {
    const sc = project(deflated, v2);
    let nv = outer(sc, deflated);
    const l = norm(nv); if (l < 1e-10) break; nv = scale(nv, 1 / l);
    v2 = nv;
  }
  const s2 = project(deflated, v2);
  return embs.map((_, i) => [s1[i], s2[i]]);
}
