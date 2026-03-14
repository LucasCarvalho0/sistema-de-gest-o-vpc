import { state, getAllNamesInEscala } from './state.js';
import { renderDashboard } from './dashboard.js';
import { renderHistorico } from './historico.js';
import { supabase } from './supabase.js';

let draggingChip = null;
let draggingFrom = null;

/* ─── CHIP ───────────────────────────────────────── */
export function createChip(nome, id, novato) {
  novato = novato || false;
  var chip = document.createElement('div');
  chip.className = 'drag-chip' + (novato ? ' novato' : '');
  chip.draggable = true;
  chip.dataset.id   = id;
  chip.dataset.nome = nome;
  chip.innerHTML = '<span class="chip-dot"></span>' + nome;

  chip.addEventListener('dragstart', function(e) {
    draggingChip = chip;
    draggingFrom = chip.parentElement;
    e.dataTransfer.effectAllowed = 'move';
  });
  chip.addEventListener('dragend', function() {
    draggingChip = null;
    draggingFrom = null;
  });
  /* duplo-clique devolve ao pool */
  chip.addEventListener('dblclick', function() {
    var pool = document.getElementById('pool-chips');
    chip.parentElement.removeChild(chip);
    pool.appendChild(chip);
    syncZoneToState(chip.parentElement);
    updateCounts();
  });
  return chip;
}

/* ─── DRAG EVENTS ────────────────────────────────── */
export function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

export function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

export function onDrop(e, zone) {
  e.preventDefault();
  zone.classList.remove('drag-over');
  if (!draggingChip) return;

  var max   = parseInt(zone.dataset.max || 99);
  var chips = zone.querySelectorAll('.drag-chip').length;
  var pool  = document.getElementById('pool-chips');

  /* se zona cheia, devolve o atual ao pool */
  if (chips >= max) {
    var existing = zone.querySelector('.drag-chip');
    if (existing) pool.appendChild(existing);
  }

  /* se veio de outra zona (não do pool), devolve ao pool primeiro */
  if (draggingFrom && draggingFrom !== zone && draggingFrom !== pool) {
    pool.appendChild(draggingChip);
    draggingFrom.appendChild(draggingChip);
    syncZoneToState(draggingFrom);
  }

  zone.appendChild(draggingChip);
  syncZoneToState(zone);
  updateCounts();
}

/* ─── SYNC DOM → STATE ───────────────────────────── */
export function syncZoneToState(zone) {
  if (!zone || !zone.dataset || !zone.dataset.zone) return;
  var key   = zone.dataset.zone;
  var chips = Array.from(zone.querySelectorAll('.drag-chip')).map(function(c) {
    return { id: parseInt(c.dataset.id), nome: c.dataset.nome };
  });
  if (['midia','mov','ades'].indexOf(key) !== -1) {
    state.escalaAtual[key] = chips;
  } else {
    state.escalaAtual[key] = chips.length ? chips[0] : null;
  }
}

/* ─── CONTADORES ─────────────────────────────────── */
export function updateCounts() {
  function cnt(id) {
    var el = document.getElementById('zone-' + id);
    return el ? el.querySelectorAll('.drag-chip').length : 0;
  }
  document.getElementById('cnt-midia').textContent = cnt('midia') + ' / 5';
  document.getElementById('cnt-mov').textContent   = cnt('mov')   + ' / 3';
  document.getElementById('cnt-ades').textContent  = cnt('ades')  + ' / 2';
  document.getElementById('cnt-l1').textContent    = (cnt('l1a') + cnt('l1b')) + ' / 2';
  document.getElementById('cnt-l2').textContent    = (cnt('l2a') + cnt('l2b')) + ' / 2';
  document.getElementById('cnt-l3').textContent    = (cnt('l3a')+cnt('l3b')+cnt('l3c')+cnt('l3d')) + ' / 4';

  var poolCount = document.getElementById('pool-chips').querySelectorAll('.drag-chip').length;
  document.getElementById('pool-count').textContent = poolCount + ' disponíveis';
}

/* ─── RENDER POOL ────────────────────────────────── */
export function renderPool() {
  var pool = document.getElementById('pool-chips');
  pool.innerHTML = '';
  state.funcionarios.forEach(function(f) {
    pool.appendChild(createChip(f.nome, f.id, f.nivel === 'novato'));
  });
  updateCounts();
}

/* ─── GERAR AUTOMÁTICO ───────────────────────────── */
export function gerarEscalaAutomatica() {
  var funcs   = state.funcionarios.slice();
  var novatos = funcs.filter(function(f){ return f.nivel === 'novato'; });

  /* limpa zonas */
  ['midia','mov','ades','l1a','l1b','l2a','l2b','l3a','l3b','l3c','l3d'].forEach(function(z) {
    var el = document.getElementById('zone-' + z);
    if (el) el.innerHTML = '';
  });
  var pool = document.getElementById('pool-chips');
  pool.innerHTML = '';
  funcs.forEach(function(f){ pool.appendChild(createChip(f.nome, f.id, f.nivel === 'novato')); });

  function assign(zoneId, chip) {
    var z = document.getElementById('zone-' + zoneId);
    if (!z) return;
    pool.removeChild(chip);
    z.appendChild(chip);
    syncZoneToState(z);
  }

  /* novatos → linha 3 */
  var l3keys = ['l3a','l3b','l3c','l3d'];
  novatos.slice(0,4).forEach(function(f, i) {
    var chip = pool.querySelector('[data-id="' + f.id + '"]');
    if (chip) assign(l3keys[i], chip);
  });

  function remaining() { return Array.from(pool.querySelectorAll('.drag-chip')); }
  function byFunc(func) {
    return remaining().filter(function(c) {
      var f = state.funcionarios.find(function(x){ return x.id === parseInt(c.dataset.id); });
      return f && f.funcao === func;
    });
  }

  /* movimentação (3) */
  byFunc('mov').slice(0,3).forEach(function(c) {
    var z = document.getElementById('zone-mov');
    pool.removeChild(c); z.appendChild(c); syncZoneToState(z);
  });

  /* adesivos (2) */
  byFunc('adesivo').slice(0,2).forEach(function(c) {
    var z = document.getElementById('zone-ades');
    pool.removeChild(c); z.appendChild(c); syncZoneToState(z);
  });

  /* linhas 1 e 2 */
  var linhaKeys = ['l1a','l1b','l2a','l2b'];
  byFunc('linha').slice(0,4).forEach(function(c, i) {
    assign(linhaKeys[i], c);
  });

  /* resto → mídia */
  remaining().forEach(function(c) {
    var z = document.getElementById('zone-midia');
    pool.removeChild(c); z.appendChild(c); syncZoneToState(z);
  });

  updateCounts();
  showAlert('✅ Escala gerada automaticamente! Ajuste se necessário.', 'success');
}

/* ─── SALVAR ESCALA ──────────────────────────────── */
export async function salvarEscala() {
  var data = document.getElementById('escala-data').value;
  if (!data) { showAlert('⚠️ Selecione a data da escala.', 'warn'); return; }

  ['midia','mov','ades'].forEach(function(z){ syncZoneToState(document.getElementById('zone-'+z)); });
  ['l1a','l1b','l2a','l2b','l3a','l3b','l3c','l3d'].forEach(function(z){ syncZoneToState(document.getElementById('zone-'+z)); });

  state.escalaAtual.data = data;
  var snapshot = JSON.parse(JSON.stringify(state.escalaAtual));

  state.historico = state.historico.filter(function(h){ return h.data !== data; });
  state.historico.unshift(snapshot);

  // Sync to Supabase
  try {
    const { error } = await supabase.from('escalas').upsert([snapshot], { onConflict: 'data' });
    if (error) console.error('Supabase error:', error);
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
  }

  var nomes = getAllNamesInEscala(snapshot);
  state.funcionarios.forEach(function(f) {
    if (nomes.indexOf(f.nome) !== -1) f.escalas++;
  });

  showAlert('✅ Escala salva com sucesso!', 'success');
  renderDashboard();
  renderHistorico();
}

/* ─── ALERTA ─────────────────────────────────────── */
export function showAlert(msg, type) {
  type = type || 'success';
  var el = document.getElementById('escala-alert');
  el.className = 'alert alert-' + type;
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(function(){ el.style.display = 'none'; }, 4000);
}
