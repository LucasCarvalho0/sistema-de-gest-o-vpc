export const state = {
  funcionarios: [],

  escalaAtual: {
    data: '',
    midia: [],
    mov:   [],
    ades:  [],
    l1a: null, l1b: null,
    l2a: null, l2b: null,
    l3a: null, l3b: null, l3c: null, l3d: null,
  },

  historico: [],
  nextId: 1,
};

/* ─── Helpers de estado ──────────────────────────── */

export function getAllNamesInEscala(e) {
  var all = [];
  ['midia','mov','ades'].forEach(function(k){ e[k].forEach(function(o){ all.push(o.nome); }); });
  ['l1a','l1b','l2a','l2b','l3a','l3b','l3c','l3d'].forEach(function(k){ if (e[k]) all.push(e[k].nome); });
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
