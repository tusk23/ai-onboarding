import React, { createContext, useContext, useState, useEffect } from 'react';

var CACHE = {};

var I18nContext = createContext();

function LoadingFallback() {
  return React.createElement('div', {
    style: {
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#0c0f16', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      font: '500 12px/1 monospace', color: 'rgba(255,255,255,0.2)',
      letterSpacing: '0.1em', textTransform: 'uppercase',
    }
  }, 'Cargando...');
}

export function I18nProvider({ children }) {
  var [lang, setLang] = useState(function() {
    try { return localStorage.getItem('lang') || 'es'; } catch(e) { return 'es'; }
  });
  var [dict, setDict] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    setLoading(true);
    if (CACHE[lang]) { setDict(CACHE[lang]); setLoading(false); return; }
    fetch('/i18n/' + lang + '.json').then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(data) {
      CACHE[lang] = data;
      setDict(data);
      setLoading(false);
    }).catch(function() {
      fetch('/i18n/es.json').then(function(r) { return r.json(); }).then(function(data) {
        CACHE[lang] = data;
        setDict(data);
        setLoading(false);
      });
    });
    try { localStorage.setItem('lang', lang); } catch(e) {}
  }, [lang]);

  function t(key) {
    if (!dict) return key;
    var parts = key.split('.');
    var val = dict;
    for (var i = 0; i < parts.length; i++) {
      val = val && val[parts[i]];
      if (val === undefined) return key;
    }
    return val;
  }

  if (loading) return React.createElement(LoadingFallback);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
