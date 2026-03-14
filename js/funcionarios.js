import { state, avClass, initials } from './state.js';
import { renderPool } from './escala.js';
import { closeModal } from './app.js';
import { supabase } from './supabase.js';

export const FUNC_LABELS = {
  midia:   'Montagem de Mídia',
  mov:     'Movimentação',
  adesivo: 'Adesivos',
  linha:   'Linha de Produção'
};

export const ROLE_CLASSES = {
  midia:   'role-midia',
  mov:     'role-mov',
  adesivo: 'role-adesivo',
  linha:   'role-linha'
};

/* ─── RENDER TABELA ──────────────────────────────── */
export function renderFuncTable() {
  var tbody = document.getElementById('func-table-body');
  tbody.innerHTML = state.funcionarios.map(function(f) {
    var nivelCls = f.nivel === 'novato' ? 'role-novato' : 'badge-green';
    return '<tr>' +
      '<td style="font-weight:600;display:flex;align-items:center;gap:10px">' +
        '<div class="op-avatar ' + avClass(f.id % 4) + '">' + initials(f.nome) + '</div>' +
        f.nome +
      '</td>' +
      '<td><span class="role-badge ' + ROLE_CLASSES[f.funcao] + '">' + FUNC_LABELS[f.funcao] + '</span></td>' +
      '<td><span class="role-badge ' + nivelCls + '">' + f.nivel + '</span></td>' +
      '<td style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--accent)">' + f.escalas + '</td>' +
      '<td><button class="btn btn-danger btn-sm" onclick="removeFuncionario(' + f.id + ')">Remover</button></td>' +
    '</tr>';
  }).join('');
}

/* ─── ADICIONAR ──────────────────────────────────── */
export async function addFuncionario() {
  var nome = document.getElementById('func-nome').value.trim();
  if (!nome) return;

  const newFunc = {
    nome:    nome,
    funcao:  document.getElementById('func-funcao').value,
    nivel:   document.getElementById('func-nivel').value,
    escalas: 0,
  };

  // Sync to local state
  state.funcionarios.push({ id: state.nextId++, ...newFunc });

  // Sync to Supabase
  try {
    const { data, error } = await supabase.from('funcionarios').insert([newFunc]).select();
    if (error) {
      console.error('Supabase error:', error);
    } else if (data && data[0]) {
      // Update local state with the actual ID from Supabase
      const index = state.funcionarios.findIndex(f => f.nome === nome && f.id >= 17);
      if (index !== -1) {
        state.funcionarios[index].id = data[0].id;
      }
    }
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
  }

  closeModal('modal-add-func');
  document.getElementById('func-nome').value = '';
  renderFuncTable();
  renderPool();
}

/* ─── REMOVER ────────────────────────────────────── */
export async function removeFuncionario(id) {
  state.funcionarios = state.funcionarios.filter(function(f){ return f.id !== id; });
  
  // Sync to Supabase
  try {
    const { error } = await supabase.from('funcionarios').delete().eq('id', id);
    if (error) console.error('Supabase error:', error);
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
  }

  renderFuncTable();
  renderPool();
}
