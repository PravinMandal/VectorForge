import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTheme } from '../../hooks/useTheme';

export default function Header() {
  const { allItems, ollamaStatus } = useContext(AppContext);
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <h1>VectorForge</h1>
      <span className="badge hl">HNSW</span>
      <span className="badge">KD-TREE</span>
      <span className="badge">BRUTE FORCE</span>
      <span className={`badge ${ollamaStatus?.ollamaAvailable ? 'ok' : (ollamaStatus ? 'err' : '')}`}>
        {ollamaStatus?.ollamaAvailable ? 'OLLAMA ✓' : (ollamaStatus ? 'OLLAMA ✗' : 'OLLAMA…')}
      </span>
      <span id="statsLabel">{allItems.length > 0 ? `${allItems.length} vectors · 16 dims` : 'loading…'}</span>
      <button className="theme-btn" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  );
}
