import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import './architecture.css';

const stages = [
  { id: 's0', num: 'Fase 01', title: 'Recolección de Datos', brain: 'Corteza Sensorial', color: '#4FC3F7', rgb: '79,195,247',
    brainDetail: 'Los órganos sensoriales capturan estímulos del mundo exterior — luz, sonido, presión, temperatura. La corteza sensorial primaria recibe estos datos crudos.',
    iaDetail: 'Se recopilan terabytes de texto, imágenes, video y audio de internet, libros y bases de datos. Es el sensor crudo del modelo.',
    techs: ['Web Scraping', 'APIs', 'Datasets', 'Data Lakes'] },
  { id: 's1', num: 'Fase 02', title: 'Pre-procesamiento', brain: 'Tálamo', color: '#66BB6A', rgb: '102,187,106',
    brainDetail: 'El tálamo filtra, organiza y redirige la información sensorial a las áreas corticales apropiadas. Solo el 1% de la información llega al consciente.',
    iaDetail: 'Limpieza, normalización, tokenización, deduplicación. El texto crudo se convierte en tokens; las imágenes se redimensionan y estandarizan.',
    techs: ['Tokenización', 'Cleaning', 'Normalization', 'Embeddings'] },
  { id: 's2', num: 'Fase 03', title: 'Pre-entrenamiento', brain: 'Redes Neuronales Generales', color: '#FFA726', rgb: '255,167,38',
    brainDetail: 'Durante los primeros años de vida, el cerebro forma conexiones neuronales masivas sin un propósito específico — es aprendizaje autodidacta general.',
    iaDetail: 'El modelo aprende patrones estadísticos del lenguaje (next-token prediction) o estructura visual (masked autoencoding) de manera no supervisada.',
    techs: ['Self-Supervised', 'Next-Token Prediction', 'Masked Autoencoding', 'Contrastive Learning'] },
  { id: 's3', num: 'Fase 04', title: 'Ajuste Fino (Fine-tuning)', brain: 'Cerebelo + Hipocampo', color: '#AB47BC', rgb: '171,71,188',
    brainDetail: 'El cerebelo refina habilidades con práctica; el hipocampo consolida memorias específicas. Juntos transforman conocimiento general en competencias concretas.',
    iaDetail: 'Se entrena el modelo pre-entrenado con datos específicos de la tarea. LoRA/QLoRA permiten ajustar sin re-entrenar todo el modelo.',
    techs: ['LoRA', 'QLoRA', 'PEFT', 'Adapter Layers', 'Instruction Tuning'] },
  { id: 's4', num: 'Fase 05', title: 'RLHF / Alineamiento', brain: 'Corteza Prefrontal + Amígdala', color: '#EC407A', rgb: '236,64,122',
    brainDetail: 'La corteza prefrontal evalúa consecuencias; la amígdala señala peligro. Juntos alinean el comportamiento con normas sociales y seguridad.',
    iaDetail: 'Humanos evalúan respuestas del modelo; se entrena un reward model que luego guía al modelo hacia comportamientos seguros y útiles.',
    techs: ['RLHF', 'DPO', 'Reward Model', 'Constitutional AI', 'Guardrails'] },
  { id: 's5', num: 'Fase 06', title: 'Deploy & Serving', brain: 'Tronco Encefálico', color: '#26C6DA', rgb: '38,198,218',
    brainDetail: 'El tronco encefálico mantiene las funciones vitales — respiración, circulación, sueño — sin que lo notes.',
    iaDetail: 'Kubernetes, load balancers, CUDA optimizados, cuantización. La infraestructura que mantiene el modelo vivo y respondiendo en milisegundos.',
    techs: ['Kubernetes', 'CUDA', 'TensorRT', 'Quantization', 'Edge Deploy'] },
];

const architectures = [
  { id: 'a0', name: 'Transformer', brain: 'Corteza Prefrontal', color: '#4FC3F7', rgb: '79,195,247',
    desc: 'Mecanismo de atención que procesa secuencias completas en paralelo. La base de GPT, BERT, y casi todos los LLMs modernos.',
    how: 'El mecanismo de self-attention permite que cada token observe todos los demás tokens y decida cuáles son relevantes. Multi-head attention ejecuta esto en paralelo con diferentes perspectivas.',
    models: ['GPT-4', 'Claude', 'BERT', 'Llama', 'Gemini'] },
  { id: 'a1', name: 'CNN (Red Convolucional)', brain: 'Corteza Occipital', color: '#66BB6A', rgb: '102,187,106',
    desc: 'Detecta patrones espaciales jerárquicos — de bordes a texturas a objetos completos. El ojo de la IA.',
    how: 'Filtros convolucionales se deslizan sobre la imagen detectando patrones a diferentes escalas. Las capas profundas combinan patrones simples en representaciones complejas.',
    models: ['ResNet', 'VGG', 'EfficientNet', 'YOLO'] },
  { id: 'a2', name: 'Diffusion Models', brain: 'Corteza Occipital + Temporal', color: '#FFA726', rgb: '255,167,38',
    desc: 'Generan imágenes, video y audio aprendiendo a revertir el proceso de ruido gradual. El cineasta de la IA.',
    how: 'Se agrega ruido a los datos progresivamente (forward diffusion), luego se entrena una red para revertir este proceso. El modelo aprende la distribución de los datos y puede muestrear nuevos ejemplares.',
    models: ['Stable Diffusion', 'DALL-E 3', 'Midjourney', 'Sora'] },
  { id: 'a3', name: 'Mixture of Experts (MoE)', brain: 'Cuerpo Calloso', color: '#AB47BC', rgb: '171,71,188',
    desc: 'Redes que activan solo subconjuntos especializados de neuronas por tarea. Eficiencia masiva sin sacrificar capacidad.',
    how: 'Un gating network decide qué expertos (sub-redes) activar para cada token. Solo el 10–25% de los parámetros se activan por forward pass.',
    models: ['Mixtral', 'GPT-4', 'Switch Transformer', 'GShard'] },
  { id: 'a4', name: 'GANs (Generative Adversarial)', brain: 'Amígdala (competencia)', color: '#EC407A', rgb: '236,64,122',
    desc: 'Dos redes compiten: una genera, la otra detecta falsificaciones. La evolución por competencia crea resultados realistas.',
    how: 'El generador crea muestras falsas; el discriminador intenta distinguir reales de falsas. Ambos mejoran en competencia — similar a cómo la amígdala entrena el sistema de pelea o huye.',
    models: ['StyleGAN', 'ProGAN', 'CycleGAN'] },
  { id: 'a5', name: 'RNN / LSTM / GRU', brain: 'Hipocampo (memoria secuencial)', color: '#FDD835', rgb: '253,216,53',
    desc: 'Procesan secuencias paso a paso con memoria interna. Precursores de los Transformers para tareas secuenciales.',
    how: 'Cada paso procesa el input actual + el estado oculto del paso anterior. LSTM agrega puertas para decidir qué recordar y qué olvidar — directamente inspirado en la memoria declarativa del hipocampo.',
    models: ['LSTM', 'GRU', 'Bidirectional', 'Seq2Seq'] },
];

const timelineItems = [
  { year: '1943', title: 'McCulloch & Pitts: Neurona Formal', desc: 'Primer modelo matemático de una neurona biológica. Inspirado directamente en la neurociencia.', brain: '→ Corteza cerebral: redes de neuronas', color: '#4FC3F7', rgb: '79,195,247' },
  { year: '1958', title: 'Perceptron (Rosenblatt)', desc: 'Primera red neuronal que puede aprender. Capaz de clasificar linealmente — como un reflejo condicionado simple.', brain: '→ Bulbo raquídeo: reflejos simples', color: '#66BB6A', rgb: '102,187,106' },
  { year: '1986', title: 'Backpropagation (Rumelhart, Hinton)', desc: 'Algoritmo que permite a las redes aprender capas profundas. Inspirado en cómo el cerebro ajusta sinapsis por refuerzo.', brain: '→ Cerebelo: ajuste fino por práctica', color: '#FFA726', rgb: '255,167,38' },
  { year: '1998', title: 'LeNet-5 (LeCun)', desc: 'Primera CNN exitosa para reconocimiento de dígitos. Estructura jerárquica inspirada en la corteza visual.', brain: '→ Corteza occipital: procesamiento visual', color: '#EF5350', rgb: '239,83,80' },
  { year: '2017', title: 'Attention Is All You Need (Vaswani)', desc: 'El Transformer cambia todo. Mecanismo de atención que procesa en paralelo — como el cerebro procesa múltiples estímulos simultáneamente.', brain: '→ Corteza prefrontal: atención selectiva', color: '#AB47BC', rgb: '171,71,188' },
  { year: '2020', title: 'GPT-3 (OpenAI)', desc: '175B parámetros. Few-shot learning sin fine-tuning. Demuestra que la escala puede emular razonamiento flexible.', brain: '→ Corteza prefrontal: flexibilidad cognitiva', color: '#EC407A', rgb: '236,64,122' },
  { year: '2022', title: 'ChatGPT + RLHF', desc: 'Alineamiento humano por primera vez masivo. El modelo aprende a ser útil, seguro y honesto — como un niño aprendiendo normas sociales.', brain: '→ Corteza prefrontal + amígdala: alineamiento social', color: '#FDD835', rgb: '253,216,53' },
  { year: '2024–2026', title: 'Agentes Autónomos + Multimodal', desc: 'IA que planifica, usa herramientas, y procesa texto+imagen+video+audio. Acercándose a la integración multimodal del cerebro humano.', brain: '→ Corteza parietal: integración multisensorial', color: '#26C6DA', rgb: '38,198,218' },
];

const stats = [
  { num: '10', label: 'Regiones cerebrales', color: '#4FC3F7' },
  { num: '50+', label: 'Tecnologías IA', color: '#66BB6A' },
  { num: '6', label: 'Fases de entrenamiento', color: '#FFA726' },
  { num: '80+', label: 'Años de neuronas a LLMs', color: '#EF5350' },
];

export default function ArchitecturePage() {
  useEffect(() => {
    document.title = 'Arquitectura IA — Cerebro ↔ IA';
  }, []);

  const [expanded, setExpanded] = useState(new Set());

  function toggle(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onKey(e, id) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(id);
    }
  }

  return (
    <div className="page-architecture">
      <a href="#content" className="skip-nav">Saltar al contenido</a>
      <SiteNav brand="CEREBRO ↔ IA" />

      <main id="content">
        <div className="hero">
          <h1>Arquitectura de la <span>IA Moderna</span></h1>
          <p>Cómo los métodos de entrenamiento, arquitecturas de red y sistemas de producción reflejan la forma en que el cerebro aprende y procesa información.</p>
        </div>

        <div className="content">
          <div className="stats" role="list" aria-label="Estadísticas clave">
            {stats.map((s, i) => (
              <div className="stat" role="listitem" key={i}>
                <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <section className="pipeline-section" aria-labelledby="pipeline-heading">
            <div className="section-header">
              <h2 id="pipeline-heading">Pipeline de <span>Entrenamiento</span></h2>
              <p>Cada fase del entrenamiento de un modelo de IA tiene un análogo directo en cómo el cerebro procesa y aprende información.</p>
            </div>

            <div className="pipeline" role="list" aria-label="Fases del pipeline">
              {stages.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 && <div className="stage-arrow" aria-hidden="true">→</div>}
                  <div
                    className="stage"
                    tabIndex={0}
                    role="button"
                    aria-expanded={expanded.has(s.id)}
                    aria-label={`Fase ${s.num.slice(-2)}: ${s.title}`}
                    style={{ '--stage-color': s.color, '--stage-rgb': s.rgb }}
                    onClick={() => toggle(s.id)}
                    onKeyDown={(e) => onKey(e, s.id)}
                  >
                    <div className="stage-num">{s.num}</div>
                    <div className="stage-title">{s.title}</div>
                    <div className="stage-brain">Análogo: {s.brain}</div>
                    <div className="stage-body">
                      <div className="stage-inner">
                        <strong>Cerebro</strong>{s.brainDetail}
                        <strong>IA</strong>{s.iaDetail}
                        <div className="tech-row">
                          {s.techs.map((t, j) => (
                            <span className="tech-pill" key={j}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="arch-section" aria-labelledby="arch-heading">
            <div className="section-header">
              <h2 id="arch-heading">Arquitecturas <span>Clave</span></h2>
              <p>Las arquitecturas de redes neuronales modernas que forman la base de la IA actual.</p>
            </div>

            <div className="arch-grid">
              {architectures.map((a) => (
                <div
                  className="arch-card"
                  tabIndex={0}
                  role="button"
                  aria-expanded={expanded.has(a.id)}
                  aria-label={a.name}
                  style={{ '--card-color': a.color, '--card-rgb': a.rgb }}
                  onClick={() => toggle(a.id)}
                  onKeyDown={(e) => onKey(e, a.id)}
                  key={a.id}
                >
                  <div className="arch-head">
                    <div className="arch-dot" style={{ background: a.color }}></div>
                    <div className="arch-name">{a.name}</div>
                  </div>
                  <div className="arch-brain">Análogo: {a.brain}</div>
                  <div className="arch-desc">{a.desc}</div>
                  <div className="arch-expand">
                    <div className="arch-expand-inner">
                      <h4>Cómo funciona</h4>
                      <p>{a.how}</p>
                      <h4>Modelos representativos</h4>
                      <div className="tech-row">
                        {a.models.map((m, j) => (
                          <span className="tech-pill" key={j}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="timeline-section" aria-labelledby="timeline-heading">
            <div className="section-header">
              <h2 id="timeline-heading">Línea Temporal: Del <span>Cerebro</span> a la IA</h2>
              <p>Los hitos que conectan la neurociencia con los avances en inteligencia artificial.</p>
            </div>

            <div className="timeline" role="list" aria-label="Línea temporal de IA">
              {timelineItems.map((t) => (
                <div className="tl-item" role="listitem" style={{ '--tl-color': t.color, '--tl-rgb': t.rgb }} key={t.year + t.title}>
                  <div className="tl-dot"></div>
                  <div className="tl-year">{t.year}</div>
                  <div className="tl-title">{t.title}</div>
                  <div className="tl-desc">{t.desc}</div>
                  <div className="tl-brain">{t.brain}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="page-footer">
        <div className="footer-inner">
          <div className="footer-left">Parte de Cerebro ↔ IA — presentación para desarrolladores senior</div>
          <div className="footer-links">
            <NavLink to="/">Cerebro 3D</NavLink>
            <NavLink to="/conexiones">Conexiones</NavLink>
            <NavLink to="/arquitectura">Arquitectura</NavLink>
            <NavLink to="/agentes">Agentes IA</NavLink>
            <NavLink to="/multiagente">Multiagente</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
