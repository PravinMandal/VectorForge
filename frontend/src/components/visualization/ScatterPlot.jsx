import React, { useRef, useEffect, useState } from 'react';
import { COL } from '../../utils';

export default function ScatterPlot({ pcaPoints, hitIds, queryPt, hoverItem, setHoverItem }) {
  const canvasRef = useRef(null);
  const pulseRef = useRef(0);
  const reqRef = useRef();
  
  const [bounds, setBounds] = useState({ minX: -1, maxX: 1, minY: -1, maxY: 1 });

  useEffect(() => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    if (pcaPoints.length >= 2) {
      for (const p of pcaPoints) {
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
        y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
      }
      const px = (x1 - x0) * 0.18 || 0.1;
      const py = (y1 - y0) * 0.18 || 0.1;
      setBounds({ minX: x0 - px, maxX: x1 + px, minY: y0 - py, maxY: y1 + py });
    }
  }, [pcaPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const w2c = (wx, wy) => {
      const P = 70, W = canvas.width, H = canvas.height;
      const rx = bounds.maxX - bounds.minX || 1;
      const ry = bounds.maxY - bounds.minY || 1;
      return [
        P + ((wx - bounds.minX) / rx) * (W - 2 * P),
        H - P - ((wy - bounds.minY) / ry) * (H - 2 * P)
      ];
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#07070f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#0e0e1e';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 8; i++) {
        const tx = 70 + (i / 8) * (canvas.width - 140);
        const ty = 70 + (i / 8) * (canvas.height - 140);
        ctx.beginPath(); ctx.moveTo(tx, 70); ctx.lineTo(tx, canvas.height - 70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(70, ty); ctx.lineTo(canvas.width - 70, ty); ctx.stroke();
      }
      
      ctx.fillStyle = '#1a1a38';
      ctx.font = '11px Fira Code,monospace';
      ctx.fillText('PC₁ →', canvas.width / 2 - 40, canvas.height - 18);
      ctx.save();
      ctx.translate(18, canvas.height / 2 + 50);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('PC₂ →', 0, 0);
      ctx.restore();
      ctx.fillStyle = '#151530';
      ctx.font = '12px Fira Code,monospace';
      ctx.fillText('2D PCA Projection  ·  Semantic Space', 80, 28);

      if (queryPt && hitIds.size > 0) {
        const [qx, qy] = w2c(queryPt.x, queryPt.y);
        for (const pt of pcaPoints) {
          if (!hitIds.has(pt.item.id)) continue;
          const [px, py] = w2c(pt.x, pt.y);
          ctx.strokeStyle = 'rgba(108,99,255,0.18)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      for (const pt of pcaPoints) {
        const [cx, cy] = w2c(pt.x, pt.y);
        const col = COL[pt.item.category] || COL.default;
        const isHit = hitIds.has(pt.item.id);
        const r = isHit ? 10 : 7;
        
        if (isHit) {
          const pr = r + 7 + Math.sin(pulseRef.current) * 3.5;
          ctx.beginPath(); ctx.arc(cx, cy, pr, 0, 2 * Math.PI);
          ctx.strokeStyle = col + '55'; ctx.lineWidth = 1.5; ctx.stroke();
        }
        
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
        grd.addColorStop(0, col + (isHit ? 'bb' : '88'));
        grd.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, r * 3, 0, 2 * Math.PI); ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fillStyle = col; ctx.fill();
        
        if (hoverItem && hoverItem.item && hoverItem.item.id === pt.item.id) {
          ctx.beginPath(); ctx.arc(cx, cy, r + 5, 0, 2 * Math.PI);
          ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      if (queryPt) {
        const [qx, qy] = w2c(queryPt.x, queryPt.y);
        ctx.save(); ctx.translate(qx, qy);
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 18;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI / 5) - Math.PI / 2;
          const rr = i % 2 === 0 ? 13 : 5;
          if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
        ctx.fillStyle = '#aaaacc'; ctx.font = '10px Fira Code,monospace'; ctx.fillText('query', qx + 16, qy + 4);
      }

      if (!pcaPoints.length) {
        ctx.fillStyle = '#1a1a38'; ctx.font = '13px Fira Code,monospace'; ctx.textAlign = 'center';
        ctx.fillText('Connecting to VectorDB…', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
      }

      pulseRef.current += 0.05;
      reqRef.current = requestAnimationFrame(drawFrame);
    };

    reqRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(reqRef.current);
  }, [pcaPoints, bounds, hitIds, queryPt, hoverItem]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    let best = 18;
    let newHover = null;
    
    const P = 70, W = canvas.width, H = canvas.height;
    const rx = bounds.maxX - bounds.minX || 1;
    const ry = bounds.maxY - bounds.minY || 1;
    
    for (const pt of pcaPoints) {
      const cx = P + ((pt.x - bounds.minX) / rx) * (W - 2 * P);
      const cy = H - P - ((pt.y - bounds.minY) / ry) * (H - 2 * P);
      const d = Math.hypot(mx - cx, my - cy);
      if (d < best) {
        best = d;
        newHover = pt.item;
      }
    }
    
    if (newHover) {
      setHoverItem({ item: newHover, x: e.clientX, y: e.clientY });
    } else {
      setHoverItem(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverItem(null);
  };

  return (
    <canvas 
      id="scatter" 
      ref={canvasRef} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    />
  );
}
