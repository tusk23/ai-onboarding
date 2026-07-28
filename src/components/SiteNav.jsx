import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Navegación compartida del sitio (equivalente a los <a href="*.html">
 * originales). Cada página conserva su propio brand y puede variar la
 * clase del <nav> (la página Conexiones usa ".nav-bar" en el original).
 */
export default function SiteNav({ brand, className = 'nav' }) {
  return (
    <nav className={className} aria-label="Navegación principal">
      <div className="nav-brand">{brand}</div>
      <div className="nav-links">
        <NavLink to="/" end>Cerebro 3D</NavLink>
        <NavLink to="/conexiones">Conexiones</NavLink>
        <NavLink to="/arquitectura">Arquitectura</NavLink>
        <NavLink to="/agentes">Agentes IA</NavLink>
        <NavLink to="/multiagente">Multiagente</NavLink>
      </div>
    </nav>
  );
}
