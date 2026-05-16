import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { textToEmbedding } from '../../utils';
import * as api from '../../api';

/* ─── RagTab ─────────────────────────────────────────── */
export default function RagTab() {
  const { activeTab, setHitIds, setQueryPt, pcaPoints } = useContext(AppContext);

  const [question, setQuestion]   = useState('');
  const [ragK, setRagK]           = useState(3);
  const [asking, setAsking]       = useState(false);

  /* Single Q&A state — replaces on new submission */
  const [currentQ, setCurrentQ]   = useState('');
  const [answer, setAnswer]       = useState(null);  // { model, answer, contexts } | { error }
  const [typed, setTyped]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [expandedCtx, setExpandedCtx] = useState({});

  const answerScrollRef = useRef(null);
  const typeTimerRef    = useRef(null);

  /* Scroll the answer area to top whenever new answer arrives */
  useEffect(() => {
    if (answer && answerScrollRef.current) {
      answerScrollRef.current.scrollTop = 0;
    }
  }, [answer]);

  /* Typewriter for current answer */
  useEffect(() => {
    if (!answer || answer.error) return;
    clearInterval(typeTimerRef.current);

    setTyped('');
    setIsTyping(true);

    let i = 0;
    const full = answer.answer;
    typeTimerRef.current = setInterval(() => {
      if (i >= full.length) {
        clearInterval(typeTimerRef.current);
        setIsTyping(false);
        return;
      }
      setTyped(full.slice(0, i + 4));
      i += 4;
    }, 16);

    return () => clearInterval(typeTimerRef.current);
  }, [answer]);

  const submit = async () => {
    const q = question.trim();
    if (!q || asking) return;

    /* Clear previous state immediately */
    setCurrentQ(q);
    setQuestion('');
    setAnswer(null);
    setTyped('');
    setIsTyping(false);
    setExpandedCtx({});
    clearInterval(typeTimerRef.current);
    setAsking(true);

    /* Scatter viz: retrieve context first */
    try {
      const data = await api.docSearch(q, ragK);
      if (data.contexts?.length > 0) {
        const hits = new Set();
        let sx = 0, sy = 0, sw = 0;
        data.contexts.forEach((ctx, i) => {
          const pt = pcaPoints.find(p => p.item.category === 'doc' && ctx.title.startsWith(p.item.metadata));
          if (pt) {
            hits.add(pt.item.id);
            const w = 1 / (i + 1);
            sx += pt.x * w; sy += pt.y * w; sw += w;
          }
        });
        setHitIds(hits);
        if (sw > 0) setQueryPt({ x: sx / sw + (Math.random() - .5) * .01, y: sy / sw + (Math.random() - .5) * .01 });
      } else {
        setHitIds(new Set());
        const e16 = textToEmbedding(q);
        api.searchVectors(e16, 3, 'cosine', 'hnsw').then(d2 => {
          if (d2.results?.length > 0) {
            let sx = 0, sy = 0, sw = 0;
            d2.results.slice(0, 3).forEach((r, i) => {
              const pt = pcaPoints.find(p => p.item.id === r.id);
              if (pt) { const w = 1 / (i + 1); sx += pt.x * w; sy += pt.y * w; sw += w; }
            });
            if (sw > 0) setQueryPt({ x: sx / sw + (Math.random() - .5) * .01, y: sy / sw + (Math.random() - .5) * .01 });
          }
        }).catch(() => {});
      }
    } catch (_) {}

    /* LLM answer */
    try {
      const d = await api.askAI(q, ragK);
      setAnswer(d.error ? { error: d.error } : d);
    } catch {
      setAnswer({ error: 'Server unreachable — is the backend running?' });
    }

    setAsking(false);
  };

  const onKeyDown = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
  };

  const showEmpty = !asking && !answer;

  return (
    <div className={`tab-pane${activeTab === 'rag' ? ' active' : ''}`}>
      <div className="rag-pane">

        {/* ── Input ── */}
        <div className="rag-input-area">
          <textarea
            rows={3}
            placeholder="Ask a question about your documents…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="rag-controls">
            <select
              value={ragK}
              onChange={e => setRagK(parseInt(e.target.value))}
              style={{ width: 'auto', flexShrink: 0 }}
            >
              <option value="2">Top 2</option>
              <option value="3">Top 3</option>
              <option value="5">Top 5</option>
            </select>
            <button
              className="btn btn-positive"
              disabled={asking || !question.trim()}
              onClick={submit}
              style={{ flex: 1 }}
            >
              {asking ? <><div className="spin" />Thinking</> : 'Ask'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            Ctrl+Enter to submit
          </div>
        </div>

        {/* ── Answer area ── */}
        <div className="rag-answer-area" ref={answerScrollRef}>
          {showEmpty && (
            <div className="rag-empty">
              Insert documents in the Documents tab,<br />then ask questions here.
            </div>
          )}

          {(currentQ && (asking || answer)) && (
            <>
              {/* Question */}
              <div>
                <div className="rag-question-label">Question</div>
                <div className="rag-question">{currentQ}</div>
              </div>

              {/* Thinking */}
              {asking && (
                <div className="rag-thinking">
                  <div className="spin" />
                  Retrieving context and generating answer…
                </div>
              )}

              {/* Answer */}
              {answer && !answer.error && (
                <div className="rag-answer">
                  <div className="rag-answer-label">
                    Answer
                    <span style={{ color: 'var(--text3)', fontWeight: 400 }}>{answer.model}</span>
                  </div>
                  <div className={`rag-answer-text${isTyping ? ' rag-cursor' : ''}`}>
                    {typed}
                  </div>

                  {/* Context chips */}
                  {answer.contexts?.length > 0 && (
                    <div className="rag-context">
                      <div className="rag-context-label">
                        Retrieved — {answer.contexts.length} chunk{answer.contexts.length !== 1 ? 's' : ''}
                      </div>
                      {answer.contexts.map((c, idx) => (
                        <React.Fragment key={idx}>
                          <span
                            className="ctx-pill"
                            onClick={() => setExpandedCtx(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          >
                            {idx + 1}. {c.title} · {c.distance.toFixed(3)}
                          </span>
                          {expandedCtx[idx] && (
                            <div className="ctx-body">{c.text}</div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {answer?.error && (
                <div className="rag-error">{answer.error}</div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
