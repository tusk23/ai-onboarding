import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BrainPage from './pages/BrainPage.jsx';
import ConnectionMapPage from './pages/ConnectionMapPage.jsx';
import ArchitecturePage from './pages/ArchitecturePage.jsx';
import AgentsPage from './pages/AgentsPage.jsx';
import MasPage from './pages/MasPage.jsx';
import './app.css';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<BrainPage />} />
        <Route path="/conexiones" element={<ConnectionMapPage />} />
        <Route path="/arquitectura" element={<ArchitecturePage />} />
        <Route path="/agentes" element={<AgentsPage />} />
        <Route path="/multiagente" element={<MasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <div className="app-watermark">© 2026 tusk23 — AI Onboarding</div>
    </>
  );
}
