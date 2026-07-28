import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';

export default function SiteNav({ brand, className }) {
  var { t } = useI18n();
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
    </nav>
  );
}
