import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { textToEmbedding } from '../../utils';
import * as api from '../../api';

export default function DocsTab() {
  const {
    activeTab, ollamaStatus, docs,
    deleteDocument, checkOllamaStatus, loadDocList, loadItems,
  } = useContext(AppContext);

  const [title, setTitle]         = useState('');
  const [text, setText]           = useState('');
  const [inserting, setInserting] = useState(false);
  const [status, setStatus]       = useState(null);

  const insertDoc = async () => {
    const t = title.trim(), c = text.trim();
    if (!t || !c || inserting) return;
    setInserting(true);
    setStatus({ ok: null, msg: 'Embedding with Ollama…' });
    try {
      const d = await api.insertDoc(t, c);
      if (d.error) {
        setStatus({ ok: false, msg: d.error });
      } else {
        setStatus({ ok: true, msg: `${d.chunks} chunk(s) · ${d.dims}D` });
        setTitle(''); setText('');
        await api.insertItem(t, 'doc', textToEmbedding(t + ' ' + c));
        await Promise.all([loadItems(), loadDocList(), checkOllamaStatus()]);
      }
    } catch {
      setStatus({ ok: false, msg: 'Server unreachable.' });
    }
    setInserting(false);
  };

  return (
    <div className={`tab-pane${activeTab === 'documents' ? ' active' : ''}`}>
      <div className="pane-scroll">

        {/* Ollama */}
        <div>
          <div className="section-title">Ollama Status</div>
          <div className={`status-box ${ollamaStatus?.ollamaAvailable ? 'ok' : 'err'}`}>
            {!ollamaStatus ? (
              <span style={{ color: 'var(--text3)' }}>Checking…</span>
            ) : ollamaStatus.ollamaAvailable ? (
              <div style={{ color: 'var(--text2)', fontSize: 11 }}>
                <div>
                  <span className="status-dot" style={{ background: 'var(--green)' }} />
                  <span style={{ color: 'var(--green)', fontWeight: 500 }}>Online</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  Embed: <span style={{ color: 'var(--text)' }}>{ollamaStatus.embedModel}</span>
                </div>
                <div>
                  Gen: <span style={{ color: 'var(--text)' }}>{ollamaStatus.genModel}</span>
                </div>
                <div>
                  Dims: <span style={{ color: 'var(--text)' }}>{ollamaStatus.docDims || '—'}</span>
                  &ensp;Docs: <span style={{ color: 'var(--text)' }}>{ollamaStatus.docCount}</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11 }}>
                <div>
                  <span className="status-dot" style={{ background: 'var(--red)' }} />
                  <span style={{ color: 'var(--red)', fontWeight: 500 }}>Offline</span>
                </div>
                <div style={{ marginTop: 6, color: 'var(--text3)', lineHeight: 1.8, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                  ollama pull nomic-embed-text<br />
                  ollama pull llama3.2
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insert */}
        <div>
          <div className="section-title">Insert Document</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Paste document content here…"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
            />
            <button
              className="btn btn-positive"
              disabled={inserting || !title.trim() || !text.trim()}
              onClick={insertDoc}
            >
              {inserting ? <><div className="spin" />Embedding…</> : 'Embed & Insert'}
            </button>
            {status && (
              <div
                className="form-status"
                style={{ color: status.ok === true ? 'var(--green)' : status.ok === false ? 'var(--red)' : 'var(--text3)' }}
              >
                {status.msg}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div>
          <div className="section-title">
            Documents {docs.length > 0 && `— ${docs.length}`}
          </div>
          {docs.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>No documents yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {docs.map(d => (
                <div className="doc-card" key={d.id}>
                  <div className="doc-title">{d.title}</div>
                  <div className="doc-preview">{d.preview}</div>
                  <div className="doc-meta">
                    <span className="doc-words">{d.words} words</span>
                    <button
                      className="result-del"
                      onClick={() => deleteDocument(d.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
