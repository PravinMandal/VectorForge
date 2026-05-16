import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { COL, textToEmbedding } from '../../utils';
import * as api from '../../api';

export default function LeftPanel() {
  const { qInput, setQInput, selAlgo, setSelAlgo, metric, setMetric, k, setK, runSearch, runBenchmark, loadItems } = useContext(AppContext);
  const [addMeta, setAddMeta] = useState('');
  const [addCat, setAddCat] = useState('cs');

  const addVector = async () => {
    const meta = addMeta.trim();
    if (!meta) return;
    const emb = textToEmbedding(meta + ' ' + addCat);
    try {
      await api.insertItem(meta, addCat, emb);
      setAddMeta('');
      await loadItems();
    } catch (_) {}
  };

  const handleQInputKeyDown = (e) => {
    if (e.key === 'Enter') runSearch();
  };

  return (
    <div className="left-panel">
      <div>
        <div className="sec">Query (Demo Vectors)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input type="text" placeholder="binary tree, sushi, basketball…" value={qInput} onChange={e => setQInput(e.target.value)} onKeyDown={handleQInputKeyDown} />
          <button className="btn-p" onClick={runSearch}>⚡ SEARCH</button>
        </div>
      </div>
      <div>
        <div className="sec">Algorithm</div>
        <div className="algo-row">
          <div className={`algo-btn ${selAlgo === 'hnsw' ? 'on' : ''}`} onClick={() => setSelAlgo('hnsw')}>HNSW</div>
          <div className={`algo-btn ${selAlgo === 'kdtree' ? 'on' : ''}`} onClick={() => setSelAlgo('kdtree')}>KD-TREE</div>
          <div className={`algo-btn ${selAlgo === 'bruteforce' ? 'on' : ''}`} onClick={() => setSelAlgo('bruteforce')}>BRUTE</div>
        </div>
      </div>
      <div>
        <div className="sec">Distance Metric</div>
        <select value={metric} onChange={e => setMetric(e.target.value)}>
          <option value="cosine">Cosine Similarity</option>
          <option value="euclidean">Euclidean Distance</option>
          <option value="manhattan">Manhattan Distance</option>
        </select>
      </div>
      <div>
        <div className="sec">Top-K: <span>{k}</span></div>
        <input type="range" min="1" max="10" value={k} onChange={e => setK(parseInt(e.target.value))} />
      </div>
      <div>
        <div className="sec">Category Legend</div>
        <div className="legend">
          <div className="leg-row"><div className="dot" style={{ background: COL.cs, boxShadow: `0 0 5px ${COL.cs}` }}></div>CS / Algorithms</div>
          <div className="leg-row"><div className="dot" style={{ background: COL.math, boxShadow: `0 0 5px ${COL.math}` }}></div>Mathematics</div>
          <div className="leg-row"><div className="dot" style={{ background: COL.food, boxShadow: `0 0 5px ${COL.food}` }}></div>Food &amp; Cooking</div>
          <div className="leg-row"><div className="dot" style={{ background: COL.sports, boxShadow: `0 0 5px ${COL.sports}` }}></div>Sports &amp; Games</div>
          <div className="leg-row"><div className="dot" style={{ background: COL.green, boxShadow: `0 0 5px ${COL.green}` }}></div>Documents (RAG)</div>
        </div>
      </div>
      <div>
        <div className="sec">Insert Demo Vector</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input type="text" placeholder="Description…" value={addMeta} onChange={e => setAddMeta(e.target.value)} />
          <select value={addCat} onChange={e => setAddCat(e.target.value)}>
            <option value="cs">CS / Algorithms</option>
            <option value="math">Mathematics</option>
            <option value="food">Food &amp; Cooking</option>
            <option value="sports">Sports &amp; Games</option>
          </select>
          <button className="btn-s" onClick={addVector}>+ INSERT</button>
        </div>
      </div>
      <div>
        <div className="sec">Benchmark</div>
        <button className="btn-s" onClick={runBenchmark}>▶ COMPARE ALL ALGOS</button>
      </div>
    </div>
  );
}
