import React, { createContext, useState, useEffect } from 'react';
import { textToEmbedding, pca2D } from '../utils';
import * as api from '../api';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [allItems, setAllItems] = useState([]);
  const [pcaPoints, setPcaPoints] = useState([]);
  const [hitIds, setHitIds] = useState(new Set());
  const [queryPt, setQueryPt] = useState(null);
  const [hoverItem, setHoverItem] = useState(null);
  
  const [selAlgo, setSelAlgo] = useState('hnsw');
  const [searchResults, setSearchResults] = useState([]);
  
  const [activeTab, setActiveTab] = useState('search');
  
  const [k, setK] = useState(5);
  const [metric, setMetric] = useState('cosine');
  const [qInput, setQInput] = useState('');
  
  const [searchLatency, setSearchLatency] = useState(null);
  const [queryEmb, setQueryEmb] = useState(null);
  
  const [benchData, setBenchData] = useState(null);
  const [layerData, setLayerData] = useState(null);
  
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    loadItems();
    checkOllamaStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'docs') loadDocList();
  }, [activeTab]);

  const loadItems = async () => {
    try {
      const items = await api.fetchItems();
      setAllItems(items);
      if (items.length >= 2) {
        const coords = pca2D(items.map(v => v.embedding));
        const pts = items.map((item, i) => ({ x: coords[i][0], y: coords[i][1], item }));
        setPcaPoints(pts);
      } else {
        setPcaPoints([]);
      }
      loadHNSW();
    } catch (_) {}
  };

  const loadHNSW = async () => {
    try {
      const d = await api.getHNSWInfo();
      setLayerData(d);
    } catch (_) {}
  };

  const checkOllamaStatus = async () => {
    try {
      const d = await api.checkOllamaStatus();
      setOllamaStatus(d);
    } catch (_) {
      setOllamaStatus({ ollamaAvailable: false });
    }
  };

  const loadDocList = async () => {
    try {
      const d = await api.getDocList();
      setDocs(d || []);
    } catch (_) {}
  };

  const runSearch = async () => {
    const text = qInput.trim();
    if (!text) return;
    const emb = textToEmbedding(text);
    setQueryEmb(emb);
    try {
      const data = await api.searchVectors(emb, k, metric, selAlgo);
      const res = data.results || [];
      setSearchResults(res);
      setHitIds(new Set(res.map(r => r.id)));
      setSearchLatency({
        us: data.latencyUs || 0,
        sub: `${selAlgo.toUpperCase()}  ·  ${metric}  ·  k=${k}`
      });
      
      if (res.length > 0) {
        let sx = 0, sy = 0, sw = 0;
        for (let i = 0; i < Math.min(3, res.length); i++) {
          const pt = pcaPoints.find(p => p.item.id === res[i].id);
          if (pt) {
            const w = 1 / (i + 1);
            sx += pt.x * w;
            sy += pt.y * w;
            sw += w;
          }
        }
        if (sw > 0) {
          setQueryPt({ x: sx / sw + (Math.random() - .5) * .015, y: sy / sw + (Math.random() - .5) * .015 });
        }
      } else {
        setQueryPt(null);
      }
    } catch (_) {
      alert('Cannot reach server — is it running on :8080?');
    }
  };

  const runBenchmark = async () => {
    const text = qInput.trim() || 'binary tree algorithm';
    const emb = textToEmbedding(text);
    try {
      const d = await api.runBenchmark(emb, metric);
      setBenchData(d);
    } catch (_) {}
  };

  const deleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      setSearchResults(prev => prev.filter(r => r.id !== id));
      setHitIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await loadItems();
    } catch (_) {}
  };

  const deleteDocument = async (id) => {
    try {
      await api.deleteDoc(id);
      await loadDocList();
      await checkOllamaStatus();
    } catch (_) {}
  };

  const value = {
    allItems, pcaPoints, hitIds, queryPt, hoverItem, setHoverItem,
    selAlgo, setSelAlgo, searchResults, setSearchResults,
    activeTab, setActiveTab, k, setK, metric, setMetric, qInput, setQInput,
    searchLatency, queryEmb, benchData, layerData, ollamaStatus, docs,
    loadItems, loadHNSW, checkOllamaStatus, loadDocList, runSearch, runBenchmark, deleteItem, deleteDocument, setHitIds, setQueryPt
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
