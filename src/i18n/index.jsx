import React, { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(function() {
    try { return localStorage.getItem('lang') || 'es'; } catch(e) { return 'es'; }
  });
  const [dict, setDict] = useState(null);

  useEffect(function() {
    import(/* @vite-ignore */ './' + lang + '.json').then(function(m) {
      setDict(m.default);
    }).catch(function() {
      import('./es.json').then(function(m) { setDict(m.default); });
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

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
