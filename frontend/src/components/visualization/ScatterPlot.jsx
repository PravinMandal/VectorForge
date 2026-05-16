import React, { useRef, useEffect, useState } from 'react';
import { COL } from '../../utils';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function ScatterPlot({ pcaPoints, hitIds, queryPt, hoverItem, setHoverItem }) {
  const canvasRef = useRef(null);
  const pulseRef  = useRef(0);
  const rafRef    = useRef();

  const [bounds, setBounds] = useState({ minX: -1, maxX: 1, minY: -1, maxY: 1 });

  /* Recalculate view bounds when data changes */
  useEffect(() => {
    if (pcaPoints.length < 2) return;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pcaPoints) {
      if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x;
      if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
    }
    const px = (x1 - x0) * 0.18 || 0.2;
    const py = (y1 - y0) * 0.18 || 0.2;
    setBounds({ minX: x0 - px, maxX: x1 + px, minY: y0 - py, maxY: y1 + py });
  }, [pcaPoints]);

  /* Resize observer */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(() => {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width  = r.width;
      canvas.height = r.height;
    });
    obs.observe(canvas.parentElement);
    const r = canvas.parentElement.getBoundingClientRect();
    canvas.width  = r.width;
    canvas.height = r.height;
    return () => obs.disconnect();
  }, []);

  /* Draw loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const PAD = 56;

    const w2c = (wx, wy) => {
      const W = canvas.width, H = canvas.height;
      const rx = bounds.maxX - bounds.minX || 1;
      const ry = bounds.maxY - bounds.minY || 1;
      return [
        PAD + ((wx - bounds.minX) / rx) * (W - 2 * PAD),
        H - PAD - ((wy - bounds.minY) / ry) * (H - 2 * PAD),
      ];
    };

    const frame = () => {
      const W = canvas.width, H = canvas.height;

      /* Read CSS vars each frame — theme aware */
      const bg      = cssVar('--bg')      || '#0a0a0f';
      const grid    = cssVar('--border')  || '#1e1e2e';
      const txtMute = cssVar('--text3')   || '#444466';
      const accent  = cssVar('--accent')  || '#5b5fc7';

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* Grid lines */
      ctx.strokeStyle = grid;
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 6; i++) {
        const tx = PAD + (i / 6) * (W - 2 * PAD);
        const ty = PAD + (i / 6) * (H - 2 * PAD);
        ctx.beginPath(); ctx.moveTo(tx, PAD); ctx.lineTo(tx, H - PAD); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(PAD, ty); ctx.lineTo(W - PAD, ty); ctx.stroke();
      }

      /* Axis labels */
      ctx.fillStyle = txtMute;
      ctx.font      = '10px "JetBrains Mono", "Fira Code", monospace';
      ctx.fillText('PC₁', W / 2 - 10, H - 12);
      ctx.save(); ctx.translate(14, H / 2 + 12); ctx.rotate(-Math.PI / 2);
      ctx.fillText('PC₂', 0, 0); ctx.restore();

      /* Title */
      ctx.fillStyle = txtMute;
      ctx.font      = '10px "JetBrains Mono", "Fira Code", monospace';
      ctx.fillText('PCA · Semantic Space', PAD, PAD - 10);

      /* Connector lines query → hits */
      if (queryPt && hitIds.size > 0) {
        const [qx, qy] = w2c(queryPt.x, queryPt.y);
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        for (const pt of pcaPoints) {
          if (!hitIds.has(pt.item.id)) continue;
          const [px2, py2] = w2c(pt.x, pt.y);
          ctx.strokeStyle = accent + '30';
          ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px2, py2); ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      /* Data points */
      for (const pt of pcaPoints) {
        const [cx, cy] = w2c(pt.x, pt.y);
        const col      = COL[pt.item.category] || COL.default;
        const isHit    = hitIds.has(pt.item.id);
        const isHov    = hoverItem?.item?.id === pt.item.id;
        const r        = isHit ? 8 : 5.5;

        /* Ambient glow */
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.5);
        grd.addColorStop(0, col + (isHit ? '66' : '33'));
        grd.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        /* Pulse ring */
        if (isHit) {
          const pr = r + 6 + Math.sin(pulseRef.current) * 3;
          ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2);
          ctx.strokeStyle = col + '44';
          ctx.lineWidth   = 1;
          ctx.stroke();
        }

        /* Hover ring */
        if (isHov) {
          ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = col + 'aa';
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }

        /* Core dot */
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
      }

      /* Query marker */
      if (queryPt) {
        const [qx, qy] = w2c(queryPt.x, queryPt.y);
        ctx.save(); ctx.translate(qx, qy);
        /* Diamond */
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(7, 0); ctx.lineTo(0, 10); ctx.lineTo(-7, 0);
        ctx.closePath();
        ctx.fillStyle   = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur  = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.fillStyle = txtMute;
        ctx.font      = '9px "JetBrains Mono", "Fira Code", monospace';
        ctx.fillText('query', qx + 12, qy + 4);
      }

      /* Empty state */
      if (!pcaPoints.length) {
        ctx.fillStyle   = txtMute;
        ctx.font        = '12px "JetBrains Mono", "Fira Code", monospace';
        ctx.textAlign   = 'center';
        ctx.fillText('Connecting to VectorDB…', W / 2, H / 2);
        ctx.textAlign   = 'left';
      }

      pulseRef.current += 0.05;
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pcaPoints, bounds, hitIds, queryPt, hoverItem]);

  /* Mouse hover detection */
  const onMouseMove = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const PAD = 56;
    const W = canvas.width, H = canvas.height;
    const rx = bounds.maxX - bounds.minX || 1;
    const ry = bounds.maxY - bounds.minY || 1;

    let best = 18, found = null;
    for (const pt of pcaPoints) {
      const cx = PAD + ((pt.x - bounds.minX) / rx) * (W - 2 * PAD);
      const cy = H - PAD - ((pt.y - bounds.minY) / ry) * (H - 2 * PAD);
      const d  = Math.hypot(mx - cx, my - cy);
      if (d < best) { best = d; found = pt.item; }
    }
    setHoverItem(found ? { item: found, x: e.clientX, y: e.clientY } : null);
  };

  return (
    <canvas
      id="scatter"
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHoverItem(null)}
    />
  );
}
