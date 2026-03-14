import { state, getAllNamesInEscala } from './state.js';
import { supabase } from './supabase.js';
import { formatShiftLabel } from './dateUtils.js';

// Expose to window for inline HTML handlers
window.exportHistoryPDF = function(index) {
  if (state.historico[index]) {
    import('./exportar.js').then(m => m.gerarPDF(state.historico[index]));
  }
};
window.exportHistoryExcel = function(index) {
  if (state.historico[index]) {
    import('./exportar.js').then(m => m.gerarExcel(state.historico[index]));
  }
};

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
        '<div class="history-meta">' + total + ' operadores</div>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button class="btn btn-primary btn-sm" onclick="exportHistoryPDF(' + i + ')"><i class="fas fa-file-pdf"></i> PDF</button>' +
        '<button class="btn btn-green btn-sm" onclick="exportHistoryExcel(' + i + ')"><i class="fas fa-file-excel"></i> Excel</button>' +
        '<button class="btn btn-outline btn-sm" onclick=\'carregarEscala(' + i + ')\'>Ver</button>' +
        '<button class="btn btn-danger btn-sm" onclick="removeHistorico(' + i + ')">Excluir</button>' +
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
