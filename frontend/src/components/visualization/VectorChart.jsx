import React, { useRef, useEffect } from 'react';
import { DIMS, DIM_COL, COL } from '../../utils';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function VectorChart({ embedding }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = canvas.parentElement.clientWidth || 300;
      const H = 72;
      canvas.width  = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d');
      const bg  = cssVar('--bg') || '#0a0a0f';

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (!embedding) {
        ctx.fillStyle   = cssVar('--text3') || '#444466';
        ctx.font        = '10px "JetBrains Mono", monospace';
        ctx.textAlign   = 'center';
        ctx.fillText('No query yet', W / 2, H / 2 + 4);
        ctx.textAlign   = 'left';
        return;
      }

      const bw  = (W - 4) / DIMS;
      const maxH = H - 16;
      ctx.shadowBlur = 0;

      for (let i = 0; i < DIMS; i++) {
        const val  = Math.max(0, Math.min(1, embedding[i]));
        const barH = val * maxH;
        const x    = 2 + i * bw;
        const y    = H - 12 - barH;
        ctx.fillStyle = DIM_COL[i] + 'cc';
        ctx.beginPath();
        ctx.roundRect(x + 1, y, bw - 2, barH, 1.5);
        ctx.fill();
      }

      /* Group labels */
      const groups = [
        { label: 'CS',   start: 0,  col: COL.cs },
        { label: 'MATH', start: 4,  col: COL.math },
        { label: 'FOOD', start: 8,  col: COL.food },
        { label: 'SPT',  start: 12, col: COL.sports },
      ];
      ctx.font      = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (const g of groups) {
        const cx = 2 + (g.start + 2) * bw;
        ctx.fillStyle = g.col + '77';
        ctx.fillText(g.label, cx, H - 2);
      }
      ctx.textAlign = 'left';
    };

    draw();

    // Listen for theme changes to redraw
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') draw();
      }
    });
    obs.observe(document.documentElement, { attributes: true });

    return () => obs.disconnect();
  }, [embedding]);

  return (
    <canvas
      id="vecCvs"
      ref={canvasRef}
      style={{ display: 'block', borderRadius: 6, border: '1px solid var(--border)' }}
    />
  );
}
