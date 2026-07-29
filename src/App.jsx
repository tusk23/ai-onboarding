import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider, useI18n } from './i18n/index.jsx';
import BrainPage from './pages/BrainPage.jsx';
import ConnectionMapPage from './pages/ConnectionMapPage.jsx';
import ArchitecturePage from './pages/ArchitecturePage.jsx';
import AgentsPage from './pages/AgentsPage.jsx';
import MasPage from './pages/MasPage.jsx';
import './app.css';

function Watermark() {
  var { t } = useI18n();
  return <div className="app-watermark">{t('app.watermark')}</div>;
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ArchitecturePage />} />
        <Route path="/cerebro" element={<BrainPage />} />
        <Route path="/conexiones" element={<ConnectionMapPage />} />
        <Route path="/agentes" element={<AgentsPage />} />
        <Route path="/multiagente" element={<MasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Watermark />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
