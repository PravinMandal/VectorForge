import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { textToEmbedding } from '../../utils';
import * as api from '../../api';

export default function RagTab() {
  const { activeTab, hitIds, setHitIds, setQueryPt, pcaPoints } = useContext(AppContext);
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragK, setRagK] = useState(3);
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatHistory, isAsking]);

  if (activeTab !== 'rag') return null;

  const handleRagQuestionKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) askAI();
  };

  const askAI = async () => {
    const question = ragQuestion.trim();
    if (!question) return;
    
    setIsAsking(true);
    
    const newChat = [...chatHistory, { type: 'q', text: question }];
    setChatHistory(newChat);
    setRagQuestion('');

    try {
      const data = await api.docSearch(question, ragK);
      if (data.contexts && data.contexts.length > 0) {
        const newHitIds = new Set();
        let sx = 0, sy = 0, sw = 0;
        data.contexts.forEach((ctx, i) => {
          const pt = pcaPoints.find(p => p.item.category === 'doc' && ctx.title.startsWith(p.item.metadata));
          if (pt) {
            newHitIds.add(pt.item.id);
            const w = 1 / (i + 1); sx += pt.x * w; sy += pt.y * w; sw += w;
          }
        });
        setHitIds(newHitIds);
        if (sw > 0) setQueryPt({ x: sx / sw + (Math.random() - .5) * .015, y: sy / sw + (Math.random() - .5) * .015 });
      } else {
        setHitIds(new Set());
        const emb16 = textToEmbedding(question);
        api.searchVectors(emb16, 3, 'cosine', 'hnsw').then(data2 => {
          if (data2.results && data2.results.length > 0) {
            let sx = 0, sy = 0, sw = 0;
            for (let i = 0; i < Math.min(3, data2.results.length); i++) {
              const pt = pcaPoints.find(p => p.item.id === data2.results[i].id);
              if (pt) {
                const w = 1 / (i + 1); sx += pt.x * w; sy += pt.y * w; sw += w;
              }
            }
            if (sw > 0) setQueryPt({ x: sx / sw + (Math.random() - .5) * .015, y: sy / sw + (Math.random() - .5) * .015 });
          }
        }).catch(() => {});
      }
    } catch (_) {}
    
    try {
      const d = await api.askAI(question, ragK);
      if (d.error) {
        setChatHistory(prev => [...prev, { type: 'err', text: d.error }]);
      } else {
        setChatHistory(prev => [...prev, { type: 'a', data: d }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { type: 'err', text: 'Server error — is the backend running?' }]);
    }
    
    setIsAsking(false);
  };

  return (
    <div className="tab-content on">
      <div>
        <div className="sec">Ask a Question</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea rows="3" placeholder="What is dynamic programming?&#10;Explain the main idea of HNSW.&#10;How does the recipe differ from…" value={ragQuestion} onChange={e => setRagQuestion(e.target.value)} onKeyDown={handleRagQuestionKeyDown}></textarea>
          <div style={{ display: 'flex', gap: '6px' }}>
            <select style={{ width: 'auto', flexShrink: 0 }} value={ragK} onChange={e => setRagK(parseInt(e.target.value))}>
              <option value="2">Top 2</option>
              <option value="3">Top 3</option>
              <option value="5">Top 5</option>
            </select>
            <button className="btn-g" disabled={isAsking} onClick={askAI} style={{ flex: 1 }}>{isAsking ? 'Thinking…' : '🤖 ASK AI'}</button>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Uses your inserted documents as context. Answers come from the local LLM.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="sec">Conversation</div>
        <div className="chat-history" style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
          {chatHistory.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Ask a question about your inserted documents…</div>}
          {chatHistory.map((msg, i) => {
            if (msg.type === 'q') {
              return <div className="chat-q" key={i}>{msg.text}</div>;
            } else if (msg.type === 'err') {
              return (
                <div className="chat-a" key={i}>
                  <div className="chat-a-label">ERROR</div>
                  <div className="chat-a-text" style={{ color: 'var(--red)' }}>{msg.text}</div>
                </div>
              );
            } else if (msg.type === 'a') {
              return <ChatAnswer key={i} data={msg.data} scrollToBottom={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })} />;
            }
            return null;
          })}
          {isAsking && (
            <div className="thinking">
              <div className="spinner"></div>Retrieving context &amp; generating answer…
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

function ChatAnswer({ data, scrollToBottom }) {
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [expandedCtx, setExpandedCtx] = useState({});

  useEffect(() => {
    let i = 0;
    const full = data.answer;
    const timer = setInterval(() => {
      if (i >= full.length) {
        clearInterval(timer);
        setIsTyping(false);
        return;
      }
      const chunk = full.slice(i, i + 3);
      setTyped(prev => prev + chunk);
      i += 3;
      scrollToBottom();
    }, 18);
    return () => clearInterval(timer);
  }, [data.answer, scrollToBottom]);

  const toggleCtx = (idx) => {
    setExpandedCtx(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="chat-a">
      <div className="chat-a-label">🤖 {data.model || 'llm'}</div>
      <div className={`chat-a-text ${isTyping ? 'typing' : ''}`}>{typed}</div>
      <div className="chat-ctx">
        <div className="chat-ctx-label">RETRIEVED CONTEXT ({data.contexts.length} chunks)</div>
        {data.contexts.map((c, idx) => (
          <React.Fragment key={idx}>
            <span className="ctx-chip" onClick={() => toggleCtx(idx)}>#{idx + 1} {c.title} · {c.distance.toFixed(3)}</span>
            <div className="ctx-expand" style={{ display: expandedCtx[idx] ? 'block' : 'none' }}>{c.text}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
