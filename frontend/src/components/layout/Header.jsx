import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTheme } from '../../hooks/useTheme';

const SunIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Header() {
  const { allItems, ollamaStatus } = useContext(AppContext);
  const { theme, toggleTheme }     = useTheme();

  const ollamaTag = ollamaStatus == null
    ? null
    : ollamaStatus.ollamaAvailable
      ? <span className="tag green">Ollama</span>
      : <span className="tag red">No Ollama</span>;

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-brand-mark">
          <svg viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <span className="header-title">VectorForge</span>
      </div>

      <div className="header-tags">
        <span className="tag accent">HNSW</span>
        <span className="tag">KD-Tree</span>
        <span className="tag">Brute Force</span>
        {ollamaTag}
      </div>

      <span className="header-stat">
        {allItems.length > 0 ? `${allItems.length} vectors · 16d` : '—'}
      </span>

      <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}
