import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function Tabs() {
  const { activeTab, setActiveTab } = useContext(AppContext);

  return (
    <div className="tabs">
      <div className={`tab ${activeTab === 'search' ? 'on' : ''}`} onClick={() => setActiveTab('search')}>SEARCH</div>
      <div className={`tab ${activeTab === 'docs' ? 'on' : ''}`} onClick={() => setActiveTab('docs')}>DOCUMENTS</div>
      <div className={`tab ${activeTab === 'rag' ? 'on' : ''}`} onClick={() => setActiveTab('rag')}>ASK AI</div>
    </div>
  );
}
