import React, { useEffect } from 'react';
import SiteNav from '../components/SiteNav.jsx';
import './future.css';

var PHASES = [
  {
    year: '2026 — 2028',
    title: 'La Era del Arnés',
    subtitle: 'Harness Engineering',
    desc: 'El modelo es una mercancía. El arnés es el foso defensivo. Los ingenieros dejan de escribir código y diseñan entornos donde la IA escribe código de forma fiable. Los tres pilares — contexto, restricciones, entropía — maduran como disciplina formal.',
    signals: [
      'Agentes generan 80%+ del código en proyectos nuevos',
      'Aparecen los primeros "Harness Architects" como rol de ingeniería',
      'Las empresas miden su madurez en IA por la calidad de su arnés, no por el modelo',
      'Nacen los primeros estándares industriales para AGENTS.md',
    ],
    color: '#4a4a5a',
  },
  {
    year: '2028 — 2032',
    title: 'Multiagentes en Producción',
    subtitle: 'MAS at Scale',
    desc: 'Los sistemas multiagente pasan de ser experimentos a infraestructura crítica. Cientos de agentes especializados colaboran en tiempo real, orquestados por harnesses que gestionan ciclos de vida, memoria compartida y handover contextual.',
    signals: [
      'Equipos de 10 ingenieros gestionan flotas de 1000+ agentes',
      'Los protocolos A2A (Agent-to-Agent) se estandarizan como el nuevo HTTP',
      'Aparecen los primeros "Agent Firewalls" para seguridad entre agentes',
      'Las topologías de red de agentes se vuelven dinámicas y auto-optimizadas',
    ],
    color: '#3e3e4e',
  },
  {
    year: '2032 — 2036',
    title: 'Arquitectura Auto-Evolutiva',
    subtitle: 'Self-Modifying Systems',
    desc: 'Los agentes comienzan a modificar su propio arnés. Los sistemas aprenden de sus propios patrones de fallo y reconfiguran sus restricciones, contexto y bucles de retroalimentación sin intervención humana.',
    signals: [
      'Aparecen los primeros "Meta-Harnesses" que diseñan sub-harnesses',
      'Los agentes de gestión de entropía evolucionan a arquitectos de sistemas',
      'La documentación se genera, valida y actualiza automáticamente',
      'Surgen debates sobre soberanía del arnés: ¿quién controla al controlador?',
    ],
    color: '#353548',
  },
  {
    year: '2036 — 2042',
    title: 'Cognición Distribuida',
    subtitle: 'Distributed Cognition',
    desc: 'La frontera entre agente individual y sistema colectivo se disuelve. Los harnesses orquestan redes de agentes que funcionan como una sola mente distribuida, con memoria, razonamiento y decisiones compartidas.',
    signals: [
      'Los sistemas multiagente superan pruebas de razonamiento colectivo que ningún individuo puede pasar',
      'Aparecen los primeros "sistemas con teoría de la mente" entre agentes',
      'La memoria compartida evoluciona a "conocimiento emergente" no explícito',
      'Los harnesses incorporan modelos predictivos de comportamiento de agentes',
    ],
    color: '#2d2d40',
  },
  {
    year: '2042 — 2048',
    title: 'Simbiosis Humano-Máquina',
    subtitle: 'The Merging',
    desc: 'La interfaz entre humanos y sistemas de IA se vuelve fluida e inconsciente. Los harnesses no solo gestionan agentes, sino que integran la intención humana como parte del sistema. El código, la arquitectura y el diseño emergen de la colaboración simbiótica.',
    signals: [
      'Interfaces neurales básicas permiten "pensar la arquitectura" directamente',
      'Los humanos definen restricciones en lenguaje natural; el arnés las impone',
      'La revisión de código es reemplazada por "revisión de intención"',
      'El concepto de "ingeniero de software" se transforma en "diseñador de ecosistemas cognitivos"',
    ],
    color: '#26263a',
  },
  {
    year: '2048 — 2050',
    title: '¿Singularidad o Coexistencia?',
    subtitle: 'The Horizon',
    desc: 'El sistema ha superado la capacidad humana en todos los dominios técnicos. La pregunta ya no es si las máquinas pueden pensar, sino cómo los humanos definimos propósito en un mundo donde la ejecución es automática. El arnés final quizás sea el que diseña la próxima frontera.',
    signals: [
      'Los harnesses evolucionan a "constituciones de sistemas" autogestionadas',
      'Aparecen los primeros sistemas que definen sus propias restricciones éticas',
      'El rol humano se centra en propósito, valores y dirección — no en ejecución',
      'La ingeniería de arnés se convierte en la última disciplina de ingeniería',
    ],
    color: '#1f1f33',
  },
];

export default function FuturePage() {
  useEffect(() => {
    document.title = 'Proyección 2026–2050 — Cerebro ↔ IA';
  }, []);

  return (
    <div className="page-future">
      <SiteNav brand="Cerebro ↔ IA" />
      <div className="future-hero">
        <h1>Proyección <span className="dim">2026 → 2050</span></h1>
        <p className="future-hero-sub">Una especulación fundamentada · Ingeniería de Arnés · Multiagentes · Cognición Distribuida</p>
        <p className="future-hero-note">Extendiendo nuestra línea de tiempo actual — del presente al horizonte</p>
      </div>

      <div className="future-timeline">
        <div className="timeline-line"></div>
        {PHASES.map(function(phase, i) {
          return (
            <div className="timeline-phase" key={i}>
              <div className="phase-marker" style={{borderColor: phase.color}}>
                <span className="phase-year">{phase.year}</span>
              </div>
              <div className="phase-card" style={{borderColor: phase.color}}>
                <div className="phase-header">
                  <h2>{phase.title}</h2>
                  <span className="phase-subtitle">{phase.subtitle}</span>
                </div>
                <p className="phase-desc">{phase.desc}</p>
                <div className="phase-signals">
                  <div className="signals-label">Señales tempranas</div>
                  {phase.signals.map(function(s, si) {
                    return <div className="signal-item" key={si}>{s}</div>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="future-footer">
        <p>Proyección especulativa basada en tendencias actuales en ingeniería de arnés, sistemas multiagente y evolución de IA.</p>
        <p className="dim">2026 — 2050 · Una visión posible entre muchas</p>
      </div>
    </div>
  );
}
