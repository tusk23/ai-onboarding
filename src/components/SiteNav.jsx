import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';

var LANGS = { es: 'ES', en: 'EN', fr: 'FR' };

export default function SiteNav({ brand, className }) {
  var { t, lang, setLang } = useI18n();
  return (
    <nav className={className || 'nav'} aria-label="Navegación principal">
      <div className="nav-brand">{brand || t('nav.brand')}</div>
      <div className="nav-links">
        <NavLink to="/" end>{t('nav.links.arquitectura')}</NavLink>
        <NavLink to="/cerebro">{t('nav.links.cerebro')}</NavLink>
        <NavLink to="/conexiones">{t('nav.links.conexiones')}</NavLink>
        <NavLink to="/agentes">{t('nav.links.agentes')}</NavLink>
        <NavLink to="/multiagente">{t('nav.links.multiagente')}</NavLink>
      </div>
      <div className="nav-lang">
        {Object.keys(LANGS).map(function(l) {
          return (
            <button key={l} className={'lang-btn' + (lang === l ? ' active' : '')} onClick={function() { setLang(l); }}>
              {LANGS[l]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
