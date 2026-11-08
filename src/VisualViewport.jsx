import React, { useRef, useEffect, useState } from 'react';

export default function VisualViewport({ code }) {
  const canvasRef = useRef(null);
  const [wireframe, setWireframe] = useState(false);
  const [orbit, setOrbit] = useState({ pitch: 25, yaw: 35, isDragging: false, lastX: 0, lastY: 0 });
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'

  const is3D = code.includes('scene(') || code.includes('world(') || code.includes('mesh.') || code.includes('camera(');

  useEffect(() => {
    setViewMode(is3D ? '3D' : '2D');
  }, [is3D]);

  const resetCamera = () => {
    setOrbit(prev => ({ ...prev, pitch: 25, yaw: 35 }));
  };

  const exportSnapshot = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `verscript_${viewMode.toLowerCase()}_snapshot.png`;
    a.click();
  };

  // Mouse drag listeners for 3D Orbit
  const handleMouseDown = (e) => {
    if (!is3D) return;
    setOrbit(prev => ({ ...prev, isDragging: true, lastX: e.clientX, lastY: e.clientY }));
  };

  const handleMouseMove = (e) => {
    if (!is3D || !orbit.isDragging) return;
    const dx = e.clientX - orbit.lastX;
    const dy = e.clientY - orbit.lastY;
    setOrbit(prev => ({
      ...prev,
      yaw: prev.yaw + dx * 0.5,
      pitch: Math.max(-80, Math.min(80, prev.pitch - dy * 0.5)),
      lastX: e.clientX,
      lastY: e.clientY
    }));
  };

  const handleMouseUp = () => {
    if (orbit.isDragging) {
      setOrbit(prev => ({ ...prev, isDragging: false }));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (!is3D) {
      // ════════════════ 2D IMMEDIATE CANVAS RENDERER ════════════════
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Deep space grid
      ctx.fillStyle = '#05070C';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const scaleX = w / 800;
      const scaleY = h / 600;
      ctx.scale(scaleX, scaleY);

      const lines = code.split('\n');
      lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('!')) return;

        if (line.startsWith('draw rect')) {
          const m = line.match(/draw rect\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const rx = parseFloat(m[1]), ry = parseFloat(m[2]), rw = parseFloat(m[3]), rh = parseFloat(m[4]);
            const fill = (line.match(/\?fill=([#a-zA-Z0-9]+)/) || [])[1];
            const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1];
            if (fill) { ctx.fillStyle = fill; ctx.fillRect(rx, ry, rw, rh); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.strokeRect(rx, ry, rw, rh); }
          }
        } else if (line.startsWith('draw roundedRect')) {
          const m = line.match(/draw roundedRect\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const rx = parseFloat(m[1]), ry = parseFloat(m[2]), rw = parseFloat(m[3]), rh = parseFloat(m[4]), rr = parseFloat(m[5]) || 8;
            const fill = (line.match(/\?fill=([#a-zA-Z0-9]+)/) || [])[1];
            const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1];
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, rr); else ctx.rect(rx, ry, rw, rh);
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
          }
        } else if (line.startsWith('draw circle')) {
          const m = line.match(/draw circle\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const cx = parseFloat(m[1]), cy = parseFloat(m[2]), cr = parseFloat(m[3]);
            const fill = (line.match(/\?fill=([#a-zA-Z0-9]+)/) || [])[1];
            const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1];
            ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            if (fill) { ctx.fillStyle = fill; ctx.shadowColor = fill; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0; }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
          }
        } else if (line.startsWith('draw ellipse')) {
          const m = line.match(/draw ellipse\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const ex = parseFloat(m[1]), ey = parseFloat(m[2]), erx = parseFloat(m[3]), ery = parseFloat(m[4]);
            const fill = (line.match(/\?fill=([#a-zA-Z0-9]+)/) || [])[1];
            const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1];
            ctx.beginPath(); ctx.ellipse(ex, ey, erx, ery, 0, 0, Math.PI * 2);
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
          }
        } else if (line.startsWith('draw triangle')) {
          const m = line.match(/draw triangle\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const x1 = parseFloat(m[1]), y1 = parseFloat(m[2]), x2 = parseFloat(m[3]), y2 = parseFloat(m[4]), x3 = parseFloat(m[5]), y3 = parseFloat(m[6]);
            const fill = (line.match(/\?fill=([#a-zA-Z0-9]+)/) || [])[1];
            const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1];
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
          }
        } else if (line.startsWith('draw polygon')) {
          const m = line.match(/draw polygon\s*\(\s*\[([^\]]+)\]\s*\)/);
          if (m) {
            const nums = m[1].split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            if (nums.length >= 6) {
              const fill = (line.match(/\?fill=([#a-zA-Z0-9]+)/) || [])[1];
              const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1];
              ctx.beginPath(); ctx.moveTo(nums[0], nums[1]);
              for (let p = 2; p < nums.length; p += 2) ctx.lineTo(nums[p], nums[p + 1]);
              ctx.closePath();
              if (fill) { ctx.fillStyle = fill; ctx.fill(); }
              if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
            }
          }
        } else if (line.startsWith('draw line')) {
          const m = line.match(/draw line\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const x1 = parseFloat(m[1]), y1 = parseFloat(m[2]), x2 = parseFloat(m[3]), y2 = parseFloat(m[4]);
            const stroke = (line.match(/\?stroke=([#a-zA-Z0-9]+)/) || [])[1] || '#00FFCC';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
          }
        } else if (line.startsWith('draw text')) {
          const m = line.match(/draw text\s*\(\s*["']([^"']+)["']\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) {
            const str = m[1], tx = parseFloat(m[2]), ty = parseFloat(m[3]), tsize = parseFloat(m[4]) || 14;
            const col = (line.match(/\?color=([#a-zA-Z0-9]+)/) || [])[1] || '#00FFCC';
            ctx.font = `bold ${tsize * 1.2}px 'Fira Code', monospace`;
            ctx.fillStyle = col; ctx.fillText(str, tx, ty);
          }
        } else if (line.startsWith('canvas.push')) {
          ctx.save();
        } else if (line.startsWith('canvas.pop')) {
          ctx.restore();
        } else if (line.startsWith('canvas.translate')) {
          const m = line.match(/canvas\.translate\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) ctx.translate(parseFloat(m[1]), parseFloat(m[2]));
        } else if (line.startsWith('canvas.rotate')) {
          const m = line.match(/canvas\.rotate\s*\(\s*([^)]+)\s*\)/);
          if (m) ctx.rotate((parseFloat(m[1]) * Math.PI) / 180);
        } else if (line.startsWith('canvas.scale')) {
          const m = line.match(/canvas\.scale\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
          if (m) ctx.scale(parseFloat(m[1]), parseFloat(m[2]));
        }
      });

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = "10px 'Fira Code', monospace";
      ctx.fillStyle = "rgba(0, 255, 204, 0.4)";
      ctx.fillText("VERSCRIPT 2D IMMEDIATE CANVAS", 12, h - 10);
    } else {
      // ════════════════ 3D SPATIAL SCENE GRAPH RENDERER ════════════════
      ctx.clearRect(0, 0, w, h);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
      bgGrad.addColorStop(0, '#0D111A');
      bgGrad.addColorStop(1, '#05070A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 + 20;
      const fov = 340;
      const radYaw = (orbit.yaw * Math.PI) / 180;
      const radPitch = (orbit.pitch * Math.PI) / 180;

      function project3D(x, y, z) {
        let x1 = x * Math.cos(radYaw) + z * Math.sin(radYaw);
        let z1 = -x * Math.sin(radYaw) + z * Math.cos(radYaw);
        let y1 = y;

        let y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
        let z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);
        let x2 = x1;

        const camDist = 9.0;
        const finalZ = z2 + camDist;
        if (finalZ <= 0.1) return null;

        const scale = fov / finalZ;
        return { px: cx + x2 * scale, py: cy - y2 * scale, depth: finalZ };
      }

      // Ground Plane Grid
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i += 1.0) {
        const p1 = project3D(-5, -2, i); const p2 = project3D(5, -2, i);
        if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke(); }
        const p3 = project3D(i, -2, -5); const p4 = project3D(i, -2, 5);
        if (p3 && p4) { ctx.beginPath(); ctx.moveTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py); ctx.stroke(); }
      }

      // Render 3D Cube
      const cubeCenter = [-1.8, 0.2, 0];
      const s = 1.1;
      const vertices = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s,  s], [s, -s,  s], [s, s,  s], [-s, s,  s]
      ].map(v => [v[0] + cubeCenter[0], v[1] + cubeCenter[1], v[2] + cubeCenter[2]]);

      const faces = [
        { indices: [0, 1, 2, 3], col: wireframe ? 'transparent' : 'rgba(0, 255, 204, 0.25)', edge: '#00FFCC' },
        { indices: [5, 4, 7, 6], col: wireframe ? 'transparent' : 'rgba(0, 180, 216, 0.25)', edge: '#00B4D8' },
        { indices: [4, 0, 3, 7], col: wireframe ? 'transparent' : 'rgba(0, 119, 254, 0.25)', edge: '#0077FE' },
        { indices: [1, 5, 6, 2], col: wireframe ? 'transparent' : 'rgba(56, 189, 248, 0.25)', edge: '#38BDF8' },
        { indices: [3, 2, 6, 7], col: wireframe ? 'transparent' : 'rgba(0, 255, 204, 0.40)', edge: '#00FFCC' },
        { indices: [4, 5, 1, 0], col: wireframe ? 'transparent' : 'rgba(11, 14, 20, 0.40)', edge: '#1F2937' }
      ];

      faces.forEach(f => {
        const pts = f.indices.map(idx => project3D(vertices[idx][0], vertices[idx][1], vertices[idx][2]));
        if (pts.every(p => p !== null)) {
          ctx.beginPath();
          ctx.moveTo(pts[0].px, pts[0].py);
          for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].px, pts[k].py);
          ctx.closePath();
          if (!wireframe) { ctx.fillStyle = f.col; ctx.fill(); }
          ctx.strokeStyle = f.edge;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Render 3D Sphere
      const sphereCenter = [2.0, 0.3, 0];
      const sRad = 1.3;
      const rings = 8;
      ctx.strokeStyle = '#BD00FF';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < rings; r++) {
        const theta = (r / rings) * Math.PI;
        const yOffset = Math.cos(theta) * sRad;
        const ringRad = Math.sin(theta) * sRad;
        ctx.beginPath();
        let first = true;
        for (let a = 0; a <= 20; a++) {
          const phi = (a / 20) * Math.PI * 2;
          const sx = sphereCenter[0] + Math.cos(phi) * ringRad;
          const sy = sphereCenter[1] + yOffset;
          const sz = sphereCenter[2] + Math.sin(phi) * ringRad;
          const pt = project3D(sx, sy, sz);
          if (pt) {
            if (first) { ctx.moveTo(pt.px, pt.py); first = false; }
            else { ctx.lineTo(pt.px, pt.py); }
          }
        }
        ctx.stroke();
      }

      // Render 3D Cylinder
      if (code.includes('cylinder')) {
        const cylCenter = [0.0, 0.0, 0.0];
        const rad = 1.0;
        const height = 2.2;
        const segs = 16;
        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a <= segs; a++) {
          const phi = (a / segs) * Math.PI * 2;
          const pt = project3D(cylCenter[0] + Math.cos(phi) * rad, cylCenter[1] + height / 2, cylCenter[2] + Math.sin(phi) * rad);
          if (pt) { if (a === 0) ctx.moveTo(pt.px, pt.py); else ctx.lineTo(pt.px, pt.py); }
        }
        ctx.stroke();
        ctx.beginPath();
        for (let a = 0; a <= segs; a++) {
          const phi = (a / segs) * Math.PI * 2;
          const pt = project3D(cylCenter[0] + Math.cos(phi) * rad, cylCenter[1] - height / 2, cylCenter[2] + Math.sin(phi) * rad);
          if (pt) { if (a === 0) ctx.moveTo(pt.px, pt.py); else ctx.lineTo(pt.px, pt.py); }
        }
        ctx.stroke();
        for (let a = 0; a < segs; a += 4) {
          const phi = (a / segs) * Math.PI * 2;
          const pTop = project3D(cylCenter[0] + Math.cos(phi) * rad, cylCenter[1] + height / 2, cylCenter[2] + Math.sin(phi) * rad);
          const pBot = project3D(cylCenter[0] + Math.cos(phi) * rad, cylCenter[1] - height / 2, cylCenter[2] + Math.sin(phi) * rad);
          if (pTop && pBot) { ctx.beginPath(); ctx.moveTo(pTop.px, pTop.py); ctx.lineTo(pBot.px, pBot.py); ctx.stroke(); }
        }
      }

      // Render 3D Cone
      if (code.includes('cone')) {
        const coneCenter = [2.2, 0.0, -1.0];
        const rad = 1.1;
        const height = 2.4;
        const segs = 16;
        const apex = project3D(coneCenter[0], coneCenter[1] + height / 2, coneCenter[2]);
        ctx.strokeStyle = '#FFB800';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a <= segs; a++) {
          const phi = (a / segs) * Math.PI * 2;
          const pt = project3D(coneCenter[0] + Math.cos(phi) * rad, coneCenter[1] - height / 2, coneCenter[2] + Math.sin(phi) * rad);
          if (pt) { if (a === 0) ctx.moveTo(pt.px, pt.py); else ctx.lineTo(pt.px, pt.py); }
        }
        ctx.stroke();
        if (apex) {
          for (let a = 0; a < segs; a += 4) {
            const phi = (a / segs) * Math.PI * 2;
            const pBase = project3D(coneCenter[0] + Math.cos(phi) * rad, coneCenter[1] - height / 2, coneCenter[2] + Math.sin(phi) * rad);
            if (pBase) { ctx.beginPath(); ctx.moveTo(apex.px, apex.py); ctx.lineTo(pBase.px, pBase.py); ctx.stroke(); }
          }
        }
      }

      // Render 3D Torus
      if (code.includes('torus')) {
        const torusCenter = [-2.2, 0.5, 0.8];
        const R = 1.2;
        const r = 0.4;
        const numR = 10;
        const numT = 12;
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < numR; i++) {
          const u = (i / numR) * Math.PI * 2;
          ctx.beginPath();
          let first = true;
          for (let j = 0; j <= numT; j++) {
            const v = (j / numT) * Math.PI * 2;
            const x = torusCenter[0] + (R + r * Math.cos(v)) * Math.cos(u);
            const y = torusCenter[1] + r * Math.sin(v);
            const z = torusCenter[2] + (R + r * Math.cos(v)) * Math.sin(u);
            const pt = project3D(x, y, z);
            if (pt) {
              if (first) { ctx.moveTo(pt.px, pt.py); first = false; }
              else { ctx.lineTo(pt.px, pt.py); }
            }
          }
          ctx.stroke();
        }
      }

      ctx.font = "11px 'Fira Code', monospace";
      ctx.fillStyle = "#00FFCC";
      ctx.fillText(`Orbit Pitch: ${Math.round(orbit.pitch)}° | Yaw: ${Math.round(orbit.yaw)}°`, 12, 20);
      ctx.fillStyle = "#6B7280";
      ctx.fillText("CLICK & DRAG TO ORBIT 3D VIEWPORT", 12, h - 10);
    }
  }, [code, is3D, orbit.pitch, orbit.yaw, wireframe]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '260px', background: '#05070C' }}>
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '12px',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
        background: 'rgba(13, 17, 26, 0.85)',
        padding: '4px 8px',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)'
      }}>
        <span style={{ color: is3D ? '#BD00FF' : '#00FFCC', fontSize: '0.75rem', fontWeight: 'bold', alignSelf: 'center', marginRight: '6px' }}>
          {is3D ? '🌌 3D Spatial Engine' : '🎨 2D Immediate Canvas'}
        </span>
        {is3D && (
          <>
            <button
              onClick={() => setWireframe(!wireframe)}
              style={{ background: wireframe ? '#BD00FF' : '#1F2937', color: '#FFF', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
              title="Toggle Wireframe"
            >
              Wireframe
            </button>
            <button
              onClick={resetCamera}
              style={{ background: '#1F2937', color: '#FFF', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
              title="Reset View"
            >
              Reset View
            </button>
          </>
        )}
        <button
          onClick={exportSnapshot}
          style={{ background: '#00FFCC', color: '#05070C', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
          title="Export Canvas PNG"
        >
          📷 Snapshot
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={320}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: is3D ? 'grab' : 'crosshair'
        }}
      />
    </div>
  );
}
