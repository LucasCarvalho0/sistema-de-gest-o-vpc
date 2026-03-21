import { state } from './state.js';
import { renderHistorico } from './historico.js';
import { supabase } from './supabase.js';
import { createChip } from './escala.js';
import { closeModal, openModal } from './app.js';

let draggingChipHE = null;
let draggingFromHE = null;
let pendingHEFunc = null;

/* ─── EXPOSE ─────────────────────────────────────── */
window.filterHEPool = filterHEPool;
window.onDropHE = onDropHE;
window.salvarHoraExtra = salvarHoraExtra;
window.limparHoraExtraBoard = limparHoraExtraBoard;

/* ─── RENDER POOL ────────────────────────────────── */
export function renderHEPool() {
  const pool = document.getElementById('he-pool-chips');
  const query = (document.getElementById('he-pool-search')?.value || '').toLowerCase();
  
  if (!pool) return;
  pool.innerHTML = '';
  
  // Get all IDs currently assigned
  const assignedIds = (state.horaExtraAtual.compound || []).map(o => parseInt(o.id));

  state.funcionarios.forEach(f => {
    if (assignedIds.indexOf(parseInt(f.id)) === -1) {
      const chip = createChip(f.nome, f.id, f.nivel === 'novato');
      
      // Add empresa badge to chip if exists
      if (f.empresa) {
         const badge = document.createElement('span');
         badge.className = 'chip-badge';
         badge.style.fontSize = '9px';
         badge.style.marginLeft = '5px';
         badge.style.background = 'rgba(0,0,0,0.1)';
         badge.style.padding = '2px 4px';
         badge.style.borderRadius = '3px';
         badge.textContent = f.empresa;
         chip.appendChild(badge);
      }

      chip.addEventListener('dragstart', (e) => {
        draggingChipHE = chip;
        draggingFromHE = chip.parentElement;
      });

      if (query && f.nome.toLowerCase().indexOf(query) === -1) {
        chip.style.display = 'none';
      }
      pool.appendChild(chip);
    }
  });
  updateHECounts();
}

/* ─── DRAG & DROP ────────────────────────────────── */
export function onDropHE(e, zone) {
  e.preventDefault();
  zone.classList.remove('drag-over');
  if (!draggingChipHE) return;

  const id = parseInt(draggingChipHE.dataset.id);
  const func = state.funcionarios.find(f => f.id === id);
  if (!func) return;

  // Open confirmation modal
  pendingHEFunc = func;
  
  document.getElementById('he-confirm-title').textContent = 'Alocar ' + func.nome;
  document.getElementById('he-confirm-empresa').value = func.empresa || 'SESÉ';
  document.getElementById('he-confirm-horario').value = '15:38 - 01:00'; 
  
  openModal('modal-he-confirm');

  // Set up save button listener (one-time)
  const saveBtn = document.getElementById('btn-he-confirm-save');
  saveBtn.onclick = () => confirmHEAllocation(func, draggingChipHE, zone);
}

function confirmHEAllocation(func, chip, zone) {
  const empresa = document.getElementById('he-confirm-empresa').value;
  const horario = document.getElementById('he-confirm-horario').value;

  // Add to state
  const entry = {
    id: func.id,
    nome: func.nome,
    empresa: empresa,
    horario: horario
  };

  state.horaExtraAtual.compound.push(entry);
  
  // Visual update of the chip
  chip.innerHTML = `
    <span style="font-weight:600">${func.nome}</span>
    <span style="font-size:10px; opacity:0.8; margin-top:2px;">
      ${empresa} | ${horario}
    </span>
  `;
  chip.style.flexDirection = 'column';
  chip.style.height = 'auto';
  chip.style.padding = '8px 12px';

  zone.appendChild(chip);
  closeModal('modal-he-confirm');
  updateHECounts();
}

/* ─── CONTADORES HE ──────────────────────────────── */
export function updateHECounts() {
  const compoundEl = document.getElementById('he-zone-compound');
  const count = state.horaExtraAtual.compound ? state.horaExtraAtual.compound.length : 0;
  
  const cntHE = document.getElementById('he-cnt-compound');
  if (cntHE) cntHE.textContent = count;

  const poolChips = document.getElementById('he-pool-chips');
  const poolCount = poolChips ? poolChips.querySelectorAll('.drag-chip').length : 0;
  const poolLabel = document.getElementById('he-pool-count');
  if (poolLabel) poolLabel.textContent = poolCount + ' disponíveis';
}

/* ─── FILTRAR ────────────────────────────────────── */
export function filterHEPool() {
  const query = document.getElementById('he-pool-search').value.toLowerCase();
  const chips = document.querySelectorAll('#he-pool-chips .drag-chip');
  chips.forEach(chip => {
    const nome = chip.dataset.nome.toLowerCase();
    chip.style.display = (nome.indexOf(query) !== -1 ? 'flex' : 'none');
  });
}

/* ─── SALVAR ─────────────────────────────────────── */
export async function salvarHoraExtra() {
  const data = document.getElementById('he-data').value;
  if (!data) { showHEAlert('⚠️ Selecione a data.', 'warn'); return; }

  state.horaExtraAtual.data = data;
  state.horaExtraAtual.area = 'Compound'; 
  
  const snapshot = JSON.parse(JSON.stringify(state.horaExtraAtual));
  snapshot.tipo = 'hora-extra';

  state.historicoHoraExtra = state.historicoHoraExtra.filter(h => h.data !== data);
  state.historicoHoraExtra.unshift(snapshot);

  try {
     const { error } = await supabase.from('horas_extras').upsert([snapshot], { onConflict: 'data' });
     if (error) console.error('Supabase error:', error);
  } catch (err) {
     console.error('Failed to sync HE to Supabase:', err);
  }

  showHEAlert('✅ Escala salva com sucesso!', 'success');
  renderHistorico();
  setTimeout(() => window.showPage('historico'), 1000);
}

/* ─── LIMPAR ─────────────────────────────────────── */
export function limparHoraExtraBoard() {
  if (confirm('Deseja limpar o quadro de hora extra?')) {
    state.horaExtraAtual = {
      data: state.horaExtraAtual.data,
      area: 'Compound',
      compound: []
    };
    
    const zone = document.getElementById('he-zone-compound');
    if (zone) zone.innerHTML = '';
    renderHEPool();
    showHEAlert('🧹 Quadro limpo!', 'success');
  }
}

function showHEAlert(msg, type) {
  const el = document.getElementById('he-alert');
  if (!el) return;
  el.className = 'alert alert-' + type;
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(() => el.style.display = 'none', 4000);
}
