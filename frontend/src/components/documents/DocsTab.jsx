import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { textToEmbedding } from '../../utils';
import * as api from '../../api';

export default function DocsTab() {
  const { activeTab, ollamaStatus, docs, deleteDocument, checkOllamaStatus, loadDocList, loadItems } = useContext(AppContext);
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [isInsertingDoc, setIsInsertingDoc] = useState(false);
  const [insertStatus, setInsertStatus] = useState(null);

  if (activeTab !== 'docs') return null;

  const insertDocument = async () => {
    const title = docTitle.trim();
    const text = docText.trim();
    if (!title || !text) {
      setInsertStatus({ error: '⚠ Need both a title and text.' });
      return;
    }
    
    setIsInsertingDoc(true);
    setInsertStatus({ pending: 'Calling Ollama nomic-embed-text…' });
    
    try {
      const d = await api.insertDoc(title, text);
      if (d.error) {
        setInsertStatus({ error: `✗ ${d.error}` });
      } else {
        setInsertStatus({ success: `✓ Inserted ${d.chunks} chunk(s) · ${d.dims}D embeddings` });
        setDocTitle('');
        setDocText('');
        
        const emb16 = textToEmbedding(title + ' ' + text);
        await api.insertItem(title, 'doc', emb16);
        await loadItems();
        await loadDocList();
        await checkOllamaStatus();
      }
    } catch (_) {
      setInsertStatus({ error: '✗ Server error' });
    }
    setIsInsertingDoc(false);
  };

  return (
    <div className="tab-content on">
      <div>
        <div className="sec">Ollama Status</div>
        <div className={`ollama-status ${ollamaStatus?.ollamaAvailable ? 'ok' : 'err'}`}>
          {ollamaStatus ? (
            ollamaStatus.ollamaAvailable ? (
              <>
                <span style={{ color: 'var(--green)' }}>● Online</span><br/>
                Embed: <span style={{ color: 'var(--accent)' }}>{ollamaStatus.embedModel}</span><br/>
                Generate: <span style={{ color: 'var(--accent)' }}>{ollamaStatus.genModel}</span><br/>
                Dims: <span style={{ color: 'var(--muted)' }}>{ollamaStatus.docDims || '(first insert sets this)'}</span><br/>
                Documents: <span style={{ color: 'var(--text)' }}>{ollamaStatus.docCount}</span>
              </>
            ) : (
              <>
                <span style={{ color: 'var(--red)' }}>● Offline</span><br/><br/>
                To enable RAG features:<br/>
                <span style={{ color: 'var(--muted)' }}>1. Install from ollama.com<br/>
                2. ollama pull nomic-embed-text<br/>
                3. ollama pull llama3.2</span>
              </>
            )
          ) : 'Checking…'}
        </div>
      </div>
      <div>
        <div className="sec">Insert Document</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input type="text" placeholder="Document title / topic…" value={docTitle} onChange={e => setDocTitle(e.target.value)} />
          <textarea placeholder="Paste your notes, textbook excerpt, lecture content…&#10;&#10;Long text is automatically split into overlapping chunks and each chunk gets its own real embedding via Ollama's nomic-embed-text model." value={docText} onChange={e => setDocText(e.target.value)}></textarea>
          <button className="btn-g" disabled={isInsertingDoc} onClick={insertDocument}>{isInsertingDoc ? 'Embedding…' : '⚡ EMBED & INSERT'}</button>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {insertStatus?.pending && <span style={{ color: 'var(--muted)' }}>{insertStatus.pending}</span>}
            {insertStatus?.error && <span style={{ color: 'var(--red)' }}>{insertStatus.error}</span>}
            {insertStatus?.success && <span style={{ color: 'var(--green)' }}>{insertStatus.success}</span>}
          </div>
        </div>
      </div>
      <div>
        <div className="sec">Stored Documents (<span>{docs.length}</span>)</div>
        <div className="doc-list">
          {docs.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '11px' }}>No documents yet. Insert some above.</div>
          ) : (
            docs.map(d => (
              <div className="dcard" key={d.id}>
                <div className="dcard-title">{d.title}</div>
                <div className="dcard-preview">{d.preview}</div>
                <div className="dcard-foot">
                  <span className="dcard-words">{d.words} words</span>
                  <button className="del" onClick={() => deleteDocument(d.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
