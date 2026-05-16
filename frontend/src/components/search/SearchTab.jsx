import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { COL } from '../../utils';
import VectorChart from '../visualization/VectorChart';

export default function SearchTab() {
  const { activeTab, searchLatency, searchResults, deleteItem, setHoverItem, queryEmb, benchData, layerData } = useContext(AppContext);

  if (activeTab !== 'search') return null;

  return (
    <div className="tab-content on">
      <div>
        <div className="sec">Search Latency</div>
        <div className="lat-big">{searchLatency ? (searchLatency.us < 1000 ? searchLatency.us + ' μs' : (searchLatency.us / 1000).toFixed(2) + ' ms') : '—'}</div>
        <div className="lat-sub">{searchLatency ? searchLatency.sub : 'No query yet'}</div>
      </div>
      <div>
        <div className="sec">Top Matches</div>
        <div className="results">
          {searchResults.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Run a search to see results…</div>
          ) : (
            searchResults.map((r, i) => {
              const col = COL[r.category] || COL.default;
              return (
                <div className="rcard" key={r.id} onMouseEnter={() => setHoverItem({ item: { id: r.id } })} onMouseLeave={() => setHoverItem(null)}>
                  <div className="rrank">#{i + 1} NEAREST</div>
                  <div className="rmeta">{r.metadata}</div>
                  <div className="rfoot">
                    <span className="rcat" style={{ background: col + '18', color: col, border: `1px solid ${col}44` }}>{r.category.toUpperCase()}</span>
                    <span className="rdist">dist: {r.distance.toFixed(5)}</span>
                    <button className="del" onClick={() => deleteItem(r.id)}>✕</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div>
        <div className="sec">Query Embedding (16D)</div>
        <VectorChart embedding={queryEmb} />
      </div>
      
      {benchData && (
        <div>
          <div className="sec">Algorithm Comparison</div>
          <div className="bench">
            {[
              { lbl: 'Brute Force', us: benchData.bruteforceUs, col: '#f38ba8' },
              { lbl: 'KD-Tree', us: benchData.kdtreeUs, col: '#89dceb' },
              { lbl: 'HNSW', us: benchData.hnswUs, col: '#b388ff' }
            ].map(({ lbl, us, col }) => {
              const mx = Math.max(benchData.bruteforceUs, benchData.kdtreeUs, benchData.hnswUs, 1);
              const pct = Math.max((us / mx) * 100, 2);
              const disp = us < 1000 ? us + ' μs' : (us / 1000).toFixed(2) + ' ms';
              return (
                <div className="brow" key={lbl}>
                  <div className="blabel"><span style={{ color: col }}>{lbl}</span><span style={{ color: 'var(--muted)' }}>{disp}</span></div>
                  <div className="btrack"><div className="bfill" style={{ width: pct + '%', background: col }}></div></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div>
        <div className="sec">HNSW Graph Layers</div>
        <div className="layers">
          {!layerData ? (
            <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Loading…</div>
          ) : (
            layerData.nodesPerLayer.map((cnt, lyr) => {
              const maxN = layerData.nodesPerLayer[0] || 1;
              const pct = Math.max((cnt / maxN) * 100, 2);
              const edg = layerData.edgesPerLayer[lyr] || 0;
              return (
                <div className="lrow" key={lyr}>
                  <div className="lnum">L{lyr}</div>
                  <div className="ltrack"><div className="lfill" style={{ width: pct + '%' }}></div></div>
                  <div className="lcount">{cnt}n · {edg}e</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
