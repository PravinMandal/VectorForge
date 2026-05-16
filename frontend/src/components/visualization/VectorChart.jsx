import React, { useRef, useEffect } from 'react';
import { DIMS, DIM_COL, COL } from '../../utils';

export default function VectorChart({ embedding }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const W = canvas.parentElement.clientWidth;
    canvas.width = W;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, W, 76);
    ctx.fillStyle = '#07070f';
    ctx.fillRect(0, 0, W, 76);
    
    if (!embedding) return;

    const bw = (W - 4) / DIMS;
    for (let i = 0; i < DIMS; i++) {
      const h = embedding[i] * 58;
      const x = 2 + i * bw;
      const col = DIM_COL[i];
      ctx.shadowColor = col;
      ctx.shadowBlur = 5;
      ctx.fillStyle = col + 'aa';
      ctx.fillRect(x + 1, 63 - h, bw - 2, h);
    }
    
    ctx.shadowBlur = 0;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    
    const labels = [['CS', 0], ['MATH', 4], ['FOOD', 8], ['SPORT', 12]];
    const colors = Object.values(COL);
    labels.forEach(([lbl, gi], i) => {
      ctx.fillStyle = colors[i] + '77';
      ctx.fillText(lbl, 2 + (gi + 1.5) * bw, 74);
    });
    
    ctx.textAlign = 'left';
  }, [embedding]);

  return <canvas id="vecCvs" height="76" ref={canvasRef}></canvas>;
}
