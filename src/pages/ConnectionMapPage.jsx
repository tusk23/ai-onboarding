import React, { useEffect, useRef, useState, useCallback } from 'react';
import SiteNav from '../components/SiteNav';
import { useI18n } from '../i18n/index.jsx';
import './connection.css';

export default function ConnectionMapPage() {
  var { t } = useI18n();
  var DATA = t('connection.data');
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const mountRef = useRef(true);
  const [selected, setSelected] = useState(null);
  var { t } = useI18n();

  useEffect(() => {
    document.title = t('connection.title');
    return () => { mountRef.current = false; };
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setSelected(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const drawConnections = useCallback(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!canvas || !svg) return;
    const rect = canvas.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';
    DATA.forEach(d => {
      const left = canvas.querySelector(`.brain-node[data-id="${d.id}"]`);
      const right = canvas.querySelector(`.ai-node[data-id="${d.id}"]`);
      if (!left || !right) return;
      const lR = left.getBoundingClientRect();
      const rR = right.getBoundingClientRect();
      const x1 = lR.right - rect.left;
      const y1 = lR.top + lR.height / 2 - rect.top;
      const x2 = rR.left - rect.left;
      const y2 = rR.top + rR.height / 2 - rect.top;
      const mx = (x1 + x2) / 2;
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      p.setAttribute('stroke', d.color);
      p.classList.add('conn-line');
      p.dataset.id = d.id;
      svg.appendChild(p);
      const d1 = document.createElementNS(ns, 'circle');
      d1.setAttribute('cx', x1); d1.setAttribute('cy', y1);
      d1.setAttribute('fill', d.color);
      d1.classList.add('conn-dot');
      d1.dataset.id = d.id;
      svg.appendChild(d1);
      const d2 = document.createElementNS(ns, 'circle');
      d2.setAttribute('cx', x2); d2.setAttribute('cy', y2);
      d2.setAttribute('fill', d.color);
      d2.classList.add('conn-dot');
      d2.dataset.id = d.id;
      svg.appendChild(d2);
    });
  }, []);

  useEffect(() => {
    requestAnimationFrame(drawConnections);
    window.addEventListener('resize', drawConnections);
    return () => window.removeEventListener('resize', drawConnections);
  }, [drawConnections]);

  const highlight = useCallback((id, on) => {
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    if (svg) svg.querySelectorAll(`[data-id="${id}"]`).forEach(el => el.classList.toggle('highlighted', on));
    if (canvas) canvas.querySelectorAll(`.node-card[data-id="${id}"]`).forEach(el => el.classList.toggle('active', on));
  }, []);

  return (
    <div className="page-connection">
      <SiteNav brand="Cerebro ↔ IA" />
      <div className="page-header">
        <h1>Mapa de Conexiones</h1>
        <p>Cada region del cerebro inspira un componente de la IA moderna. Haz clic en un nodo para ver la conexion completa.</p>
      </div>
      <div className="map-container">
        <div className="map-canvas" ref={canvasRef}>
          <div className="brain-side">
            <div className="side-label">Cerebro Humano</div>
            {DATA.map(d => (
              <div
                key={d.id}
                className="node-card brain-node"
                data-id={d.id}
                style={{ '--node-color': d.color, '--node-rgb': hexToRgb(d.color) }}
                onClick={() => setSelected(d)}
                onMouseEnter={() => highlight(d.id, true)}
                onMouseLeave={() => highlight(d.id, false)}
              >
                <div><span className="node-dot" style={{background:d.color}}></span><span className="node-name">{d.brain.name}</span></div>
                <div className="node-sub">{d.brain.sub}</div>
              </div>
            ))}
          </div>

          <svg className="connections-svg" ref={svgRef}></svg>

          <svg className="center-brain" viewBox="0 0 100 80" fill="none">
            <path d="M50 8C30 8 14 22 12 42C10 58 22 72 40 74C44 74.5 48 73 50 70C52 73 56 74.5 60 74C78 72 90 58 88 42C86 22 70 8 50 8Z" stroke="rgba(79,195,247,0.3)" strokeWidth="1" fill="rgba(79,195,247,0.03)"/>
            <line x1="50" y1="10" x2="50" y2="70" stroke="rgba(79,195,247,0.15)" strokeWidth="0.5" strokeDasharray="2,3"/>
          </svg>

          <div className="ai-side">
            <div className="side-label">Inteligencia Artificial</div>
            {DATA.map(d => (
              <div
                key={d.id}
                className="node-card ai-node"
                data-id={d.id}
                style={{ '--node-color': d.color, '--node-rgb': hexToRgb(d.color) }}
                onClick={() => setSelected(d)}
                onMouseEnter={() => highlight(d.id, true)}
                onMouseLeave={() => highlight(d.id, false)}
              >
                <div><span className="node-dot" style={{background:d.color}}></span><span className="node-name">{d.ai.name}</span></div>
                <div className="node-sub">{d.ai.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-legend">
          {DATA.map(d => (
            <div className="map-legend-item" key={d.id}>
              <div className="map-legend-dot" style={{background:d.color}}></div>
              {d.brain.name}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`detail-overlay${selected ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
      >
        <div className="detail-card">
          <button className="detail-close" onClick={() => setSelected(null)}>&times;</button>
          {selected && (
            <>
              <div className="detail-chip" style={{background:`rgba(${hexToRgb(selected.color)},0.12)`,color:selected.color,border:`1px solid rgba(${hexToRgb(selected.color)},0.25)`}}>
                <span className="dot" style={{background:selected.color}}></span>
                {selected.brain.name}
              </div>
              <h2>{selected.brain.name}</h2>
              <p className="detail-role">{selected.brain.sub}</p>
              <div className="detail-section-label">Conexion en IA</div>
              <div className="detail-analogy" style={{borderLeft:`3px solid ${selected.color}`}}>
                <strong style={{color:selected.color}}>{selected.ai.name}</strong><br />
                {selected.ai.sub}<br /><br />
                {selected.analogy}
              </div>
              <div className="detail-section-label">Tecnologias Relacionadas</div>
              <div className="detail-connections">
                {selected.techs.map(t => <span className="detail-conn-tag" key={t}>{t}</span>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
