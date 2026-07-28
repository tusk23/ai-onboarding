import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import { useI18n } from '../i18n/index.jsx';
import './architecture.css';

export default function ArchitecturePage() {
  var { t } = useI18n();
  var stages = t('architecture.stages') || [];
  var architectures = t('architecture.architectures') || [];
  var timelineItems = t('architecture.timelineItems') || [];
  var stats = t('architecture.stats.items') || [];
  var { t } = useI18n();
  useEffect(() => {
    document.title = t('architecture.title');
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
      <a href="#content" className="skip-nav">{t('architecture.skipNav')}</a>
      <SiteNav brand="Cerebro ↔ IA" />

      <main id="content">
        <div className="hero">
          <h1>Arquitectura de la <span>IA Moderna</span></h1>
          <p>{t('architecture.subtitle')}</p>
        </div>

        <div className="content">
          <div className="stats" role="list" aria-label={t('architecture.stats.label')}>
            {stats.map((s, i) => (
              <div className="stat" role="listitem" key={i}>
                <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <section className="pipeline-section" aria-labelledby="pipeline-heading">
            <div className="section-header">
              <h2 id="pipeline-heading">{t('architecture.pipeline.heading')} <span>{t('architecture.pipeline.heading').split(' ').pop()}</span></h2>
              <p>{t('architecture.pipeline.subtitle')}</p>
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
              <h2 id="arch-heading">{t('architecture.archSection.heading')}</h2>
              <p>{t('architecture.archSection.subtitle')}</p>
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
              <h2 id="timeline-heading">{t('architecture.timeline.heading')}</h2>
              <p>{t('architecture.timeline.subtitle')}</p>
            </div>

            <div className="timeline" role="list" aria-label="Línea temporal de IA">
              {timelineItems.map((t) => (
                <div className={"tl-item" + (t.dim ? " tl-dim" : "")} role="listitem" style={{ '--tl-color': t.color, '--tl-rgb': t.rgb }} key={t.year + t.title}>
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
          <div className="footer-left">{t('architecture.footer')}</div>
          <div className="footer-links">
            <NavLink to="/">Arquitectura IA</NavLink>
            <NavLink to="/cerebro">Cerebro 3D</NavLink>
            <NavLink to="/conexiones">Mapa Neural</NavLink>
            <NavLink to="/agentes">Agentes Autónomos</NavLink>
            <NavLink to="/multiagente">Sist. Multiagente</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
