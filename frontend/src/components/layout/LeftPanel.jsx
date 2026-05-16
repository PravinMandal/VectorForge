import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { COL, textToEmbedding } from '../../utils';
import * as api from '../../api';

export default function LeftPanel() {
  const {
    qInput, setQInput,
    selAlgo, setSelAlgo,
    metric, setMetric,
    k, setK,
    runSearch, runBenchmark, loadItems,
  } = useContext(AppContext);

  const [meta, setMeta]     = useState('');
  const [cat, setCat]       = useState('cs');
  const [adding, setAdding] = useState(false);

  const addVector = async () => {
    const m = meta.trim();
    if (!m || adding) return;
    setAdding(true);
    try {
      await api.insertItem(m, cat, textToEmbedding(m + ' ' + cat));
      setMeta('');
      await loadItems();
    } catch (_) {}
    setAdding(false);
  };

  const legend = [
    { key: 'cs',     label: 'CS / Algorithms', color: 'var(--cs)' },
    { key: 'math',   label: 'Mathematics',     color: 'var(--math)' },
    { key: 'food',   label: 'Food & Cooking',  color: 'var(--food)' },
    { key: 'sports', label: 'Sports & Games',  color: 'var(--sports)' },
    { key: 'doc',    label: 'Documents (RAG)', color: 'var(--doc)' },
  ];

  return (
    <div className="left-panel">

      {/* Search */}
      <div className="panel-section">
        <div className="panel-section-label">Vector Search</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            placeholder="e.g. binary tree, sushi…"
            value={qInput}
            onChange={e => setQInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
          />
          <button
            className="btn btn-primary"
            onClick={runSearch}
            disabled={!qInput.trim()}
          >
            Search
          </button>
        </div>
      </div>

      {/* Algorithm */}
      <div className="panel-section">
        <div className="panel-section-label">Algorithm</div>
        <div className="algo-row">
          {[['hnsw', 'HNSW'], ['kdtree', 'KD-Tree'], ['bruteforce', 'Brute']].map(([v, l]) => (
            <div
              key={v}
              className={`algo-pill${selAlgo === v ? ' active' : ''}`}
              onClick={() => setSelAlgo(v)}
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Metric */}
      <div className="panel-section">
        <div className="panel-section-label">Distance Metric</div>
        <select value={metric} onChange={e => setMetric(e.target.value)}>
          <option value="cosine">Cosine</option>
          <option value="euclidean">Euclidean</option>
          <option value="manhattan">Manhattan</option>
        </select>
      </div>

      {/* Top-K */}
      <div className="panel-section">
        <div className="panel-section-label" style={{ marginBottom: 6 }}>
          Top-K &nbsp;<span style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{k}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={k}
          onChange={e => setK(parseInt(e.target.value))}
        />
      </div>

      {/* Legend */}
      <div className="panel-section">
        <div className="panel-section-label">Legend</div>
        <div className="legend-grid">
          {legend.map(({ key, label, color }) => (
            <div className="legend-item" key={key}>
              <div className="legend-dot" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insert Vector */}
      <div className="panel-section">
        <div className="panel-section-label">Insert Vector</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            placeholder="Description"
            value={meta}
            onChange={e => setMeta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addVector()}
          />
          <select value={cat} onChange={e => setCat(e.target.value)}>
            <option value="cs">CS / Algorithms</option>
            <option value="math">Mathematics</option>
            <option value="food">Food & Cooking</option>
            <option value="sports">Sports & Games</option>
          </select>
          <button
            className="btn btn-default"
            onClick={addVector}
            disabled={adding || !meta.trim()}
          >
            {adding ? 'Inserting…' : 'Insert'}
          </button>
        </div>
      </div>

      {/* Benchmark */}
      <div className="panel-section">
        <div className="panel-section-label">Benchmark</div>
        <button className="btn btn-default" onClick={runBenchmark}>
          Run Comparison
        </button>
      </div>

    </div>
  );
}
