import { state, getAllNamesInEscala } from './state.js';
import { supabase } from './supabase.js';
import { formatShiftLabel, isWeekend } from './dateUtils.js';

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
  const normalList = document.getElementById('historico-list');
  const heList = document.getElementById('historico-he-list');

  // Render Normal History
  if (!state.historico.length) {
    normalList.innerHTML = '<p class="text-muted">Nenhuma escala salva ainda.</p>';
  } else {
    normalList.innerHTML = renderItems(state.historico, false);
  }

  // Render HE History
  if (!state.historicoHoraExtra || !state.historicoHoraExtra.length) {
    heList.innerHTML = '<p class="text-muted">Nenhuma hora extra salva ainda.</p>';
  } else {
    heList.innerHTML = renderItems(state.historicoHoraExtra, true);
  }
}

function renderItems(data, isHE) {
  return data.map(function(h, i) {
    let total = 0;
    if (h.area === 'Compound') {
      total = h.compound ? h.compound.length : 0;
    } else {
      total = getAllNamesInEscala(h).length;
    }
    
    var d = formatShiftLabel(h.data);
    let badge = '';
    
    if (h.area === 'Compound') {
      badge = ' <span class="card-badge badge-blue">Equipe Compound</span>';
    } else if (isWeekend(h.data)) {
      badge = ' <span class="card-badge badge-orange">Hora Extra VPC</span>';
    } else {
      badge = ' <span class="card-badge badge-green">Escala VPC</span>';
    }
    
    const exportFn = isHE ? 'exportHE' : 'exportHistory';

    return '<div class="history-item">' +
      '<div>' +
        '<div class="history-date">' + d + badge + '</div>' +
        '<div class="history-meta">' + total + ' operadores</div>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button class="btn btn-primary btn-sm" onclick="' + exportFn + 'PDF(' + i + ')">PDF</button>' +
        '<button class="btn btn-green btn-sm" onclick="' + exportFn + 'Excel(' + i + ')">Excel</button>' +
        (!isHE ? '<button class="btn btn-outline btn-sm" onclick=\'carregarEscala(' + i + ')\'>Ver</button>' : '') +
        '<button class="btn btn-danger btn-sm" onclick="removeHistorico(' + i + ', ' + isHE + ')">Excluir</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

// Global exposure for new handlers
window.exportHEPDF = function(idx) {
  import('./exportar.js').then(m => m.gerarPDF(state.historicoHoraExtra[idx]));
};
window.exportHEExcel = function(idx) {
  import('./exportar.js').then(m => m.gerarExcel(state.historicoHoraExtra[idx]));
};

/* ─── CARREGAR ───────────────────────────────────── */
export function carregarEscala(i) {
  state.escalaAtual = JSON.parse(JSON.stringify(state.historico[i]));
  // Em vez de alert, apenas redireciona e foca na aba de montar escala
  window.location.hash = '#page-escala';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[onclick="showPage(\'page-escala\')"]').classList.add('active');
  const alertEl = document.getElementById('escala-alert');
  if (alertEl) {
    alertEl.innerHTML = `⚠️ Escala de <strong>${state.historico[i].data}</strong> carregada! Você já pode editar.`;
    alertEl.className = 'alert alert-info';
    alertEl.style.display = 'block';
    setTimeout(() => { alertEl.style.display = 'none'; }, 5000);
  }
}

/* ─── REMOVER ────────────────────────────────────── */
export async function removeHistorico(i, isHE) {
  const target = isHE ? state.historicoHoraExtra : state.historico;
  const table = isHE ? 'horas_extras' : 'escalas';
  const item = target[i];
  
  if (confirm('Deseja excluir este registro?')) {
    target.splice(i, 1);
    try {
      if (item.data) {
        await supabase.from(table).delete().eq('data', item.data);
      }
    } catch (err) {
      console.error('Failed to sync to Supabase:', err);
    }
    renderHistorico();
  }
}
