import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SiteNav({ brand, className = 'nav' }) {
  return (
    <nav className={className} aria-label="Navegación principal">
      <div className="nav-brand">{brand}</div>
      <div className="nav-links">
        <NavLink to="/" end>Cerebro 3D</NavLink>
        <NavLink to="/conexiones">Mapa Neural</NavLink>
        <NavLink to="/arquitectura">Arquitectura IA</NavLink>
        <NavLink to="/agentes">Agentes Autónomos</NavLink>
        <NavLink to="/multiagente">Sist. Multiagente</NavLink>
      </div>
    </nav>
  );
}
