import { state, getAllNamesInEscala, avClass, initials } from './state.js';
import { formatShiftLabel } from './dateUtils.js';

export function renderDashboard() {
  var escala  = (state.escalaAtual && state.escalaAtual.midia) ? state.escalaAtual : null;
  var noEscala = document.getElementById('dash-noescala');
  var setores  = document.getElementById('dash-setores');
  var linhas   = document.getElementById('dash-linhas');
  
  // Update Header Date with Shift Info if available
  const dateLabel = document.getElementById('header-date');
  if (escala && escala.data) {
    dateLabel.textContent = 'PRODUÇÃO: ' + formatShiftLabel(escala.data);
  }

  if (!escala) {
    noEscala.style.display = 'flex';
    setores.innerHTML = '';
    linhas.innerHTML  = '';
    document.getElementById('dash-total').textContent = '0';
    return;
  }
  noEscala.style.display = 'none';

  var total = getAllNamesInEscala(escala).length;
  document.getElementById('dash-total').textContent = total;

  // 0. Liderança em destaque
  let lidHTML = '';
  if (escala.lider) {
    lidHTML = '<div class="card mb16" style="background:var(--surface2);border-top:3px solid var(--accent)">' +
      '<div class="flex gap24 p12 wrap">' +
      `<div class="flex items-center gap8"><div class="op-avatar av-orange">${initials(escala.lider.nome)}</div><div><div style="font-size:10px;text-transform:uppercase;opacity:0.6">Líder do Setor</div><div style="font-weight:700">${escala.lider.nome}</div></div></div>` +
      '</div></div>';
  }

  /* ─── Setores ─────────────────────────────────── */
  var confs = [];
  if (escala.conferente1) confs.push(escala.conferente1);
  if (escala.conferente2) confs.push(escala.conferente2);

  var setorData = [
    { label:'Montagem de Mídia', icon:'🎬', bclass:'badge-orange', ops: escala.midia || [] },
    { label:'Movimentação',       icon:'🚛', bclass:'badge-blue',   ops: escala.mov || []   },
    { label:'Adesivos',           icon:'🏷️', bclass:'badge-green',  ops: escala.ades || []  },
    { label:'Conferência',        icon:'🔍', bclass:'badge-accent', ops: confs        },
  ];

  setores.innerHTML = lidHTML + setorData.map(function(s, si) {
    var liItems = s.ops.map(function(o) {
      return '<li><div class="op-avatar ' + avClass(si) + '">' + initials(o.nome) + '</div>' + o.nome + '</li>';
    }).join('');
    return '<div class="card">' +
      '<div class="card-header">' +
        '<div class="card-title">' + s.icon + ' ' + s.label + '</div>' +
        '<span class="card-badge ' + s.bclass + '">' + s.ops.length + '</span>' +
      '</div>' +
      '<ul class="op-list">' + liItems + '</ul>' +
    '</div>';
  }).join('');

  /* ─── Helpers de linha ────────────────────────── */
  function firstName(nome) { return nome ? nome.split(' ')[0] : '—'; }

  function carSlot(n, cls, nome) {
    return '<div class="car-slot ' + cls + '">' +
      '<span class="car-num">' + n + '</span>' +
      '<span class="car-op">'  + firstName(nome) + '</span>' +
    '</div>';
  }

  function carGrid(opA, opB, cls1, cls2) {
    cls1 = cls1 || 'assigned';
    cls2 = cls2 || 'assigned-b';
    var nomeA = opA ? opA.nome : null;
    var nomeB = opB ? opB.nome : null;
    return '<div class="car-grid">' +
      carSlot(1,cls1,nomeA) + carSlot(2,cls1,nomeA) + carSlot(3,cls1,nomeA) +
      carSlot(4,cls2,nomeB) + carSlot(5,cls2,nomeB) + carSlot(6,cls2,nomeB) +
    '</div>';
  }

  function opRow(op, cars, avCls) {
    if (!op) {
      return '<div class="op-row">' +
        '<div class="op-avatar ' + avCls + '">—</div>' +
        '<div class="op-row-name" style="color:var(--muted)">Não atribuído</div>' +
      '</div>';
    }
    return '<div class="op-row">' +
      '<div class="op-avatar ' + avCls + '">' + initials(op.nome) + '</div>' +
      '<div class="op-row-name">' + op.nome + '</div>' +
      '<div class="op-row-cars">Carros ' + cars + '</div>' +
    '</div>';
  }

  /* ─── Linhas ──────────────────────────────────── */
  var nomeL1a = escala.l1a ? escala.l1a.nome : '—';
  var nomeL1b = escala.l1b ? escala.l1b.nome : '—';
  var nomeL2a = escala.l2a ? escala.l2a.nome : '—';
  var nomeL2b = escala.l2b ? escala.l2b.nome : '—';
  var l3keys  = ['l3a','l3b','l3c','l3d'];
  var l3slots = l3keys.map(function(k,i){ return carSlot(i+1, escala[k] ? 'assigned-b' : '', escala[k] ? escala[k].nome : null); }).join('');
  var l3rows  = l3keys.map(function(k,i){ return opRow(escala[k], 'carro '+(i+1), 'av-blue'); }).join('');

  linhas.innerHTML =
    '<div class="section-title"><span class="line-num">1</span> Linha 1</div>' +
    '<div class="grid-2 mb24">' +
      '<div class="card">' +
        carGrid(escala.l1a, escala.l1b) +
        opRow(escala.l1a,'1,2,3','av-orange') +
        opRow(escala.l1b,'4,5,6','av-blue') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-header"><div class="card-title">Resumo</div></div>' +
        '<p style="color:var(--muted);font-size:13px;line-height:1.8">' +
          'Lado A: ' + nomeL1a + ' &rarr; carros 1,2,3<br>' +
          'Lado B: ' + nomeL1b + ' &rarr; carros 4,5,6<br><br>' +
          'Total: <strong>3 carros</strong> por lado = <strong>6 carros</strong>' +
        '</p>' +
      '</div>' +
    '</div>' +

    '<div class="section-title"><span class="line-num">2</span> Linha 2</div>' +
    '<div class="grid-2 mb24">' +
      '<div class="card">' +
        carGrid(escala.l2a, escala.l2b,'assigned-g','assigned') +
        opRow(escala.l2a,'1,2,3','av-green') +
        opRow(escala.l2b,'4,5,6','av-orange') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-header"><div class="card-title">Resumo</div></div>' +
        '<p style="color:var(--muted);font-size:13px;line-height:1.8">' +
          'Lado A: ' + nomeL2a + ' &rarr; carros 1,2,3<br>' +
          'Lado B: ' + nomeL2b + ' &rarr; carros 4,5,6<br><br>' +
          'Total: <strong>3 carros</strong> por lado = <strong>6 carros</strong>' +
        '</p>' +
      '</div>' +
    '</div>' +

    '<div class="section-title"><span class="line-num" style="background:var(--blue);color:#fff">3</span> Linha 3 &ndash; Aprendizagem</div>' +
    '<div class="grid-2 mb24">' +
      '<div class="card">' +
        '<div class="car-grid" style="grid-template-columns:repeat(4,1fr)">' + l3slots + '</div>' +
        l3rows +
      '</div>' +
      '<div class="card">' +
        '<div class="card-header"><div class="card-title">Linha de Aprendizagem</div><span class="card-badge badge-blue">4 carros</span></div>' +
        '<p style="color:var(--muted);font-size:13px;line-height:1.8">' +
          'Destinada a operadores novos e em adaptação.<br>' +
          'Cada operador cobre 1 a 2 carros.<br>' +
          'Aceita 2 a 4 operadores.' +
        '</p>' +
      '</div>' +
    '</div>';
}
