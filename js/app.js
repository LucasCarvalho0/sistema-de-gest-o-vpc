import { state } from './state.js';
import { renderPool, onDragOver, onDrop, onDragLeave, gerarEscalaAutomatica, salvarEscala } from './escala.js';
import { renderDashboard } from './dashboard.js';
import { renderFuncTable, addFuncionario, removeFuncionario } from './funcionarios.js';
import { renderHistorico, carregarEscala, removeHistorico } from './historico.js';
import { gerarPDF, previewPDF, gerarExcel } from './exportar.js';
import { supabase } from './supabase.js';

/* ─── INIT ───────────────────────────────────────── */
window.onload = async function() {
  updateHeaderDate();
  var hoje = new Date().toISOString().slice(0,10);
  document.getElementById('escala-data').value = hoje;
  state.escalaAtual.data = hoje;

  // Load from Supabase
  try {
    const { data: funcs } = await supabase.from('funcionarios').select('*').order('nome');
    if (funcs && funcs.length > 0) {
      state.funcionarios = funcs;
    } else {
      console.log('Supabase empty, using local defaults.');
    }

    const { data: hist } = await supabase.from('escalas').select('*').order('data', { ascending: false });
    if (hist && hist.length > 0) {
      state.historico = hist;
    }
  } catch (err) {
    console.warn('Could not load from Supabase, using defaults', err);
  }

  renderFuncTable();
  renderPool();
  renderDashboard();

  /* listeners do modal */
  document.querySelectorAll('.modal-overlay').forEach(function(m) {
    m.addEventListener('click', function(e) {
      if (e.target === m) m.classList.remove('open');
    });
  });
};

/* ─── DATA NO HEADER ─────────────────────────────── */
export function updateHeaderDate() {
  var d = new Date();
  document.getElementById('header-date').textContent =
    d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}

/* ─── NAVEGAÇÃO ──────────────────────────────────── */
export function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('nav button').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('page-' + id).classList.add('active');
  event.currentTarget.classList.add('active');

  if (id === 'dashboard')    renderDashboard();
  if (id === 'funcionarios') renderFuncTable();
  if (id === 'historico')    renderHistorico();
  if (id === 'escala')       renderPool();
}

/* ─── MODAL ──────────────────────────────────────── */
export function openModal(id)  { document.getElementById(id).classList.add('open'); }
export function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Expose to window for inline HTML handlers
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
