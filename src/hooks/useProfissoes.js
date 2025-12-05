// src/hooks/useProfissoes.js
import { useState, useEffect } from 'react';

export const useProfissoes = () => {
  const [profissoes, setProfissoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallback = [
    { id: 1, value: 'Médico' },
    { id: 2, value: 'Enfermeiro' },
    { id: 3, value: 'Técnico de Enfermagem' },
    { id: 4, value: 'Farmacêutico' },
    { id: 5, value: 'Administrativo' },
  ];

  useEffect(() => {
    const basePath = process.env.PUBLIC_URL || '';
    fetch(`${basePath}/data/professions.json`)
      .then(res => {
        if (!res.ok) throw new Error('404');
        return res.json();
      })
      .then(data => {
        setProfissoes(Array.isArray(data) ? data : fallback);
      })
      .catch(() => {
        console.warn('Profissões: usando fallback');
        setProfissoes(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  return { profissoes, loading };
};