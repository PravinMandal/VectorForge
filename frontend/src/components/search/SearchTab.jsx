import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { COL } from '../../utils';
import VectorChart from '../visualization/VectorChart';

export default function SearchTab() {
  const {
    activeTab, searchLatency, searchResults,
    deleteItem, setHoverItem, queryEmb, benchData, layerData,
  } = useContext(AppContext);

  return (
    <div className={`tab-pane${activeTab === 'search' ? ' active' : ''}`}>
      <div className="pane-scroll">

        {/* Latency */}
        <div>
          <div className="section-title">Search Latency</div>
          {searchLatency ? (
            <>
              <div className="latency-value">
                {searchLatency.us < 1000
                  ? searchLatency.us
                  : (searchLatency.us / 1000).toFixed(2)}
                <span className="latency-unit">
                  {searchLatency.us < 1000 ? 'μs' : 'ms'}
                </span>
              </div>
              <div className="latency-sub">{searchLatency.sub}</div>
            </>
          ) : (
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>No query yet</div>
          )}
        </div>

        {/* Results */}
        <div>
          <div className="section-title">
            Results {searchResults.length > 0 && `— ${searchResults.length}`}
          </div>
          <div className="result-list">
            {searchResults.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 12 }}>
                Run a search to see nearest neighbors.
              </div>
            ) : (
              searchResults.map((r, i) => {
                const col = COL[r.category] || COL.default;
                return (
                  <div
                    className="result-card"
                    key={r.id}
                    onMouseEnter={() => setHoverItem({ item: r })}
                    onMouseLeave={() => setHoverItem(null)}
                  >
                    <div className="result-rank">#{i + 1}</div>
                    <div className="result-text">{r.metadata}</div>
                    <div className="result-footer">
                      <span
                        className="result-cat"
                        style={{ color: col, borderColor: col + '40', background: col + '12' }}
                      >
                        {r.category}
                      </span>
                      <span className="result-dist">{r.distance.toFixed(5)}</span>
                      <button
                        className="result-del"
                        onClick={() => deleteItem(r.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Embedding */}
        <div>
          <div className="section-title">Query Embedding — 16D</div>
          <VectorChart embedding={queryEmb} />
        </div>

        {/* Benchmark */}
        {benchData && (
          <div>
            <div className="section-title">Algorithm Benchmark</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Brute Force', us: benchData.bruteforceUs, color: '#e05c6a' },
                { label: 'KD-Tree',    us: benchData.kdtreeUs,     color: '#38bdf8' },
                { label: 'HNSW',       us: benchData.hnswUs,       color: '#a78bfa' },
              ].map(({ label, us, color }) => {
                const mx  = Math.max(benchData.bruteforceUs, benchData.kdtreeUs, benchData.hnswUs, 1);
                const pct = Math.max((us / mx) * 100, 3);
                const disp = us < 1000 ? `${us} μs` : `${(us / 1000).toFixed(2)} ms`;
                return (
                  <div className="bench-row" key={label}>
                    <div className="bench-header">
                      <span style={{ color }}>{label}</span>
                      <span>{disp}</span>
                    </div>
                    <div className="bench-track">
                      <div className="bench-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HNSW Layers */}
        <div>
          <div className="section-title">HNSW Graph Layers</div>
          {!layerData ? (
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {layerData.nodesPerLayer.map((cnt, lyr) => {
                const maxN = layerData.nodesPerLayer[0] || 1;
                const edg  = layerData.edgesPerLayer?.[lyr] ?? 0;
                return (
                  <div className="layer-row" key={lyr}>
                    <div className="layer-num">L{lyr}</div>
                    <div className="layer-track">
                      <div className="layer-fill" style={{ width: `${Math.max((cnt / maxN) * 100, 3)}%` }} />
                    </div>
                    <div className="layer-count">{cnt}n · {edg}e</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
