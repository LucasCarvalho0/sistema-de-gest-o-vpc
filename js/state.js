export const LIDER_FIXO = { id: 9999, nome: 'Janaina Mendes', empresa: 'SESÉ' };

export const state = {
  funcionarios: [], // Cada func: { id, nome, funcao, nivel, empresa }

  escalaAtual: getInitialEscala(''),

  historico: [],
  
  // Extra Hour State (Compound Only)
  horaExtraAtual: { data: '', area: 'Compound', compound: [] },
  historicoHoraExtra: [],

  nextId: 1,
};

export function getInitialEscala(data) {
  return {
    data: data || '',
    lider: { ...LIDER_FIXO },
    midia: [],
    mov:   [],
    ades:  [],
    conferente1: null,
    conferente2: null,
    l1a: null, l1b: null,
    l2a: null, l2b: null,
    l3a: null, l3b: null, l3c: null, l3d: null,
  };
}

/* ─── Helpers de estado ──────────────────────────── */

export function getAllNamesInEscala(e) {
  var all = [];
  if (e.area === 'Compound' && e.compound) {
    e.compound.forEach(function(o){ all.push(o.nome); });
    return all;
  }
  ['midia','mov','ades'].forEach(function(k){ if(e[k]) e[k].forEach(function(o){ all.push(o.nome); }); });
  ['lider','conferente1','conferente2','l1a','l1b','l2a','l2b','l3a','l3b','l3c','l3d'].forEach(function(k){ if (e[k]) all.push(e[k].nome); });
  return all;
}

export function avClass(i) {
  var c = ['av-orange','av-blue','av-green','av-red'];
  return c[i % c.length];
}

export function initials(nome) {
  return nome.slice(0,2).toUpperCase();
}

export function fmtData(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}
