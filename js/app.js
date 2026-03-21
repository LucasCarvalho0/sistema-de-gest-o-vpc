import { state } from './state.js';
import { renderDashboard } from './dashboard.js';
import { renderFuncTable, addFuncionario, removeFuncionario } from './funcionarios.js';
import { renderHistorico, carregarEscala, removeHistorico } from './historico.js';
import { renderPool, onDragOver, onDrop, onDragLeave, gerarEscalaAutomatica, salvarEscala, limparEscala, filterPool, limparEscalaBoard } from './escala.js';
import { gerarPDF, previewPDF, gerarExcel, getEscalaExport } from './exportar.js';
import { supabase } from './supabase.js';
import { getProductionDate, formatShiftLabel } from './dateUtils.js';

// Expose to window for inline HTML handlers - MOVE TO TOP to ensure availability
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.addFuncionario = addFuncionario;
window.removeFuncionario = removeFuncionario;
window.gerarEscalaAutomatica = gerarEscalaAutomatica;
window.salvarEscala = salvarEscala;
window.carregarEscala = carregarEscala;
window.removeHistorico = removeHistorico;
window.gerarPDF = gerarPDF;
window.previewPDF = previewPDF;
window.gerarExcel = gerarExcel;
window.onDragOver = onDragOver;
window.onDrop = onDrop;
window.onDragLeave = onDragLeave;
window.getEscalaExport = getEscalaExport;
window.limparEscala = limparEscala;
window.filterPool = filterPool;
window.limparEscalaBoard = limparEscalaBoard;

/* ─── INIT ───────────────────────────────────────── */
window.onload = async function() {
  updateHeaderDate();
  
  const prodDate = getProductionDate();
  document.getElementById('escala-data').value = prodDate;
  state.escalaAtual.data = prodDate;

  // Load from Supabase
  try {
    const { data: funcs } = await supabase.from('funcionarios').select('*').order('nome');
    if (funcs && funcs.length > 0) {
      state.funcionarios = funcs;
    }

    const { data: hist } = await supabase.from('escalas').select('*').order('data', { ascending: false });
    if (hist && hist.length > 0) {
      state.historico = hist;

      // Persistence logic: load scale for current production date if it exists
      const existingScale = state.historico.find(h => h.data === prodDate);
      if (existingScale) {
        // Deep copy to state.escalaAtual
        state.escalaAtual = JSON.parse(JSON.stringify(existingScale));
        console.log('Loaded existing scale for production shift:', prodDate);
      } else {
        console.log('No scale found for production shift:', prodDate, '- Starting empty (automatic reset).');
      }
    }
    const { data: heHist } = await supabase.from('horas_extras').select('*').order('data', { ascending: false });
    if (heHist && heHist.length > 0) {
      state.historicoHoraExtra = heHist;
    }

  } catch (err) {
    console.warn('Could not load from Supabase, using defaults', err);
  }

  renderDashboard();
  renderPool();
  renderFuncTable();

  // Initialize Hora Extra
  import('./horaExtra.js').then(m => {
    m.renderHEPool();
  });

  startShiftMonitor();

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch((err) => console.log('Service Worker Failed', err));
  }

  /* listeners do modal */
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.addEventListener('click', function(e) {
      if (e.target === m) m.classList.remove('open');
    });
  });
};

/* ─── MONITOR DE TURNO (RESET 5:00) ───────────────── */
export function startShiftMonitor() {
  // Timer de contagem regressiva (1s)
  setInterval(() => {
    const el = document.getElementById('shift-timer');
    if (!el) return;

    const now = new Date();
    let target = new Date(now);
    target.setHours(5, 0, 0, 0);

    // Se já passou das 5h de hoje, o alvo é 5h de amanhã
    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }, 1000);

  // Monitor de Mudança de Turno (1m)
  setInterval(() => {
    const currentShiftDate = getProductionDate();
    if (state.escalaAtual.data && state.escalaAtual.data !== currentShiftDate) {
      console.log('🔄 Mudança de turno detectada! Resetando dashboard...');
      
      // Update data input
      document.getElementById('escala-data').value = currentShiftDate;
      
      // Clear scale (this also calls renderDashboard)
      limparEscala(currentShiftDate);
      
      if (window.showAlert) {
        window.showAlert('🌙 Turno encerrado às 5:00. Sistema resetado para o novo dia.', 'info');
      }
    }
  }, 60000); 
}

/* ─── DATA NO HEADER ─────────────────────────────── */
export function updateHeaderDate() {
  var d = new Date();
  document.getElementById('header-date').textContent =
    d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}

/* ─── NAVEGAÇÃO ──────────────────────────────────── */
export function showPage(id, event) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('nav button').forEach(function(b){ b.classList.remove('active'); });
  
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  if (id === 'dashboard')    renderDashboard();
  if (id === 'funcionarios') renderFuncTable();
  if (id === 'historico')    renderHistorico();
  if (id === 'escala')       renderPool();
  if (id === 'hora-extra') {
    import('./horaExtra.js').then(m => m.renderHEPool());
  }

  if (id === 'exportar') {
    const label = document.getElementById('export-shift-label');
    if (label) {
      const e = (state.escalaAtual && state.escalaAtual.midia && state.escalaAtual.midia.length > 0) ? state.escalaAtual : (state.historico[0] || null);
      if (e && e.data) {
        label.textContent = 'Relatório do Turno: ' + formatShiftLabel(e.data);
      } else {
        label.textContent = 'Nenhuma escala disponível para exportar.';
      }
    }
  }
}

/* ─── MODAL ──────────────────────────────────────── */
export function openModal(id)  { document.getElementById(id).classList.add('open'); }
export function closeModal(id) { document.getElementById(id).classList.remove('open'); }
