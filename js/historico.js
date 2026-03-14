import { state, getAllNamesInEscala } from './state.js';
import { supabase } from './supabase.js';
import { formatShiftLabel } from './dateUtils.js';

/* ─── RENDER ─────────────────────────────────────── */
export function renderHistorico() {
  var list = document.getElementById('historico-list');

  if (!state.historico.length) {
    list.innerHTML = '<p class="text-muted">Nenhuma escala salva ainda.</p>';
    return;
  }

  list.innerHTML = state.historico.map(function(h, i) {
    var total = getAllNamesInEscala(h).length;
    var d = formatShiftLabel(h.data);
    return '<div class="history-item">' +
      '<div>' +
        '<div class="history-date">' + d + '</div>' +
        '<div class="history-meta">' +
          total + ' operadores &middot; ' +
          'Montagem: ' + h.midia.length + ' &middot; ' +
          'Mov: '      + h.mov.length   + ' &middot; ' +
          'Adesivos: ' + h.ades.length  +
        '</div>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button class="btn btn-secondary btn-sm" onclick="carregarEscala(' + i + ')">Carregar</button>' +
        '<button class="btn btn-blue btn-sm"      onclick="window.gerarPDF(state.historico[' + i + '])">PDF</button>' +
        '<button class="btn btn-green btn-sm"     onclick="window.gerarExcel(state.historico[' + i + '])">Excel</button>' +
        '<button class="btn btn-danger btn-sm"    onclick="removeHistorico(' + i + ')">Excluir</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ─── CARREGAR ───────────────────────────────────── */
export function carregarEscala(i) {
  state.escalaAtual = JSON.parse(JSON.stringify(state.historico[i]));
  alert('Escala de ' + state.historico[i].data + ' carregada. Vá para Montar Escala para editar.');
}

/* ─── REMOVER ────────────────────────────────────── */
export async function removeHistorico(i) {
  const item = state.historico[i];
  state.historico.splice(i, 1);

  try {
    if (item.id) {
      await supabase.from('escalas').delete().eq('id', item.id);
    }
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
  }

  renderHistorico();
}
