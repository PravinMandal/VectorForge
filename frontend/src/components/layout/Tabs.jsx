import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

export default function Tabs() {
  const { activeTab, setActiveTab } = useContext(AppContext);
  const tabs = [
    { id: 'search',    label: 'Search' },
    { id: 'documents', label: 'Documents' },
    { id: 'rag',       label: 'Ask AI' },
  ];

  return (
    <div className="tabs">
      {tabs.map(t => (
        <div
          key={t.id}
          className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
