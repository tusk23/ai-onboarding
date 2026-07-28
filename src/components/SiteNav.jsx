import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SiteNav({ brand, className = 'nav' }) {
  return (
    <nav className={className} aria-label="Navegación principal">
      <div className="nav-brand">{brand}</div>
      <div className="nav-links">
        <NavLink to="/" end>Arquitectura IA</NavLink>
        <NavLink to="/cerebro">Cerebro 3D</NavLink>
        <NavLink to="/conexiones">Mapa Neural</NavLink>
        <NavLink to="/agentes">Agentes Autónomos</NavLink>
        <NavLink to="/multiagente">Sist. Multiagente</NavLink>
        <NavLink to="/futuro" className="nav-future">Futuro</NavLink>
      </div>
    </nav>
  );
}
