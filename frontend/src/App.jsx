import React, { useContext } from 'react';
import Header from './components/layout/Header';
import LeftPanel from './components/layout/LeftPanel';
import Tabs from './components/layout/Tabs';
import SearchTab from './components/search/SearchTab';
import DocsTab from './components/documents/DocsTab';
import RagTab from './components/rag/RagTab';
import ScatterPlot from './components/visualization/ScatterPlot';
import { AppContext } from './contexts/AppContext';
import { COL } from './utils';
import './index.css';

export default function App() {
  const { pcaPoints, hitIds, queryPt, hoverItem, setHoverItem } = useContext(AppContext);

  return (
    <>
      <Header />
      <div className="layout">
        <LeftPanel />
        
        {/* ══ CENTER: SCATTER PLOT ══ */}
        <div className="center-panel">
          <ScatterPlot 
            pcaPoints={pcaPoints} 
            hitIds={hitIds} 
            queryPt={queryPt} 
            hoverItem={hoverItem} 
            setHoverItem={setHoverItem} 
          />
        </div>
        
        {/* ══ RIGHT PANEL: TABS ══ */}
        <div className="right-panel">
          <Tabs />
          <SearchTab />
          <DocsTab />
          <RagTab />
        </div>
      </div>
      
      {hoverItem && hoverItem.item && (
        <div id="tip" style={{ display: 'block', left: (hoverItem.x + 14) + 'px', top: (hoverItem.y - 8) + 'px' }}>
          <span style={{ color: COL[hoverItem.item.category] || COL.default }}>[{hoverItem.item.category}]</span><br/>
          {hoverItem.item.metadata}
        </div>
      )}
    </>
  );
}
