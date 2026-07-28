import React, { useEffect, useRef, useState, useCallback } from 'react';
import SiteNav from '../components/SiteNav';
import { useI18n } from '../i18n/index.jsx';
import './connection.css';

const DATA = [
  { id:'frontal', brain:{name:'Corteza Prefrontal',sub:'Planificacion, decisiones, razonamiento'}, ai:{name:'Razonamiento IA',sub:'Chain-of-Thought, RLHF, Prompt Engineering'}, color:'#4FC3F7', analogy:'El CEO del cerebro — siempre preguntando "que pasaria si...". En IA, el Chain-of-Thought ejecuta exactamente ese ciclo: razona paso a paso antes de actuar.', techs:['Chain-of-Thought','RLHF','Prompt Engineering','Reasoning','Tree of Thought'] },
  { id:'temporal', brain:{name:'Corteza Temporal',sub:'Lenguaje, memoria semantica, audicion'}, ai:{name:'Procesamiento de Lenguaje',sub:'NLP, Tokenizacion, Embeddings, Transformers'}, color:'#66BB6A', analogy:'El traductor universal — convierte senales en significados. Los Transformers hacen lo mismo: transforman secuencias de tokens en representaciones semanticas.', techs:['NLP','Tokenizacion','Embeddings','Transformers','BERT','GPT'] },
  { id:'parietal', brain:{name:'Corteza Parietal',sub:'Integracion sensorial, espacio, atencion'}, ai:{name:'Modelos Multimodales',sub:'Sensor Fusion, Spatial AI, Vision-Language'}, color:'#FFA726', analogy:'El mezclador maestro — une vista, tacto y espacio en una sola experiencia. GPT-4V y Gemini fusionan imagen+texto de la misma forma.', techs:['Multimodal Models','Sensor Fusion','Spatial AI','CLIP','GPT-4V'] },
  { id:'occipital', brain:{name:'Corteza Occipital',sub:'Vision, patrones, color'}, ai:{name:'Vision por Computadora',sub:'CNNs, Diffusion Models, YOLO, DETR'}, color:'#EF5350', analogy:'El cineasta interno — construye mundos visuales enteros desde photons. Stable Diffusion hace literalmente esto: genera imagenes completas desde ruido.', techs:['Computer Vision','CNNs','YOLO','DETR','Diffusion Models','DALL-E'] },
  { id:'hipocampo', brain:{name:'Hipocampo',sub:'Memoria declarativa, navegacion'}, ai:{name:'Sistemas de Memoria',sub:'RAG, Vector DBs, Context Windows'}, color:'#AB47BC', analogy:'El archivista — decide que guardar para siempre y que dejar ir. RAG hace lo mismo: busca en bases de conocimiento lo relevante para cada consulta.', techs:['RAG','Vector Databases','Context Windows','Memory Systems','Pinecone','ChromaDB'] },
  { id:'amigdala', brain:{name:'Amigdala',sub:'Emociones, miedo, seguridad'}, ai:{name:'Seguridad y Guardrails',sub:'Sentiment Analysis, Safety Filters, Guardrails'}, color:'#EC407A', analogy:'El guardian emocional — detecta el peligro antes que la razon. Los safety filters de OpenAI detectan contenido problematico antes de que llegue al usuario.', techs:['Sentiment Analysis','Emotion AI','Safety Filters','Guardrails','Constitutional AI'] },
  { id:'talamo', brain:{name:'Talamo',sub:'Relay sensorial, regulacion'}, ai:{name:'Infraestructura de Datos',sub:'API Gateway, Message Broker, Data Pipeline'}, color:'#FDD835', analogy:'El director de trafico — todo dato sensorial pasa por aqui. Un API Gateway en una arquitectura de microservicios cumple exactamente la misma funcion.', techs:['API Gateway','Message Broker','Data Pipeline','Router','Kafka','RabbitMQ'] },
  { id:'cuerpo_calloso', brain:{name:'Cuerpo Calloso',sub:'Comunicacion entre hemisferios'}, ai:{name:'Sistemas Ensemble',sub:'Multi-Agent, Mixture of Experts, Voting'}, color:'#78909C', analogy:'El puente — conecta dos mundos que no saben que existen el uno sin el otro. Mixture of Experts activa solo los modulos relevantes para cada tarea.', techs:['Ensemble Methods','Multi-Agent Systems','Mixture of Experts','MoE','Gating Networks'] },
  { id:'cerebelo', brain:{name:'Cerebelo',sub:'Coordinacion, aprendizaje motor'}, ai:{name:'Optimizacion de Modelos',sub:'Fine-tuning, LoRA, QLoRA, Gradient Descent'}, color:'#26C6DA', analogy:'El artesano — perfecciona cada movimiento con practica. LoRA ajusta finamente un modelo pre-entrenado sin re-entrenar todo, como el cerebelo refina movimientos.', techs:['Fine-tuning','LoRA','QLoRA','Gradient Descent','Adam','Learning Rate Scheduling'] },
  { id:'tronco', brain:{name:'Tronco Encefalico',sub:'Funciones vitales automaticas'}, ai:{name:'MLOps e Infraestructura',sub:'Kubernetes, Model Serving, CI/CD'}, color:'#8D6E63', analogy:'Los cimientos — funciona perfectamente sin que nunca lo notes. Kubernetes mantiene los modelos desplegados vivos y respondiendo, como el tronco mantiene la respiracion.', techs:['MLOps','Kubernetes','Model Serving','CI/CD','Docker','TensorFlow Serving'] },
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

export default function ConnectionMapPage() {
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
