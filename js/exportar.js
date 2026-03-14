import { state, getAllNamesInEscala, fmtData } from './state.js';

/* ─── Escala a exportar ──────────────────────────── */
export function getEscalaExport() {
  return state.historico[0] || state.escalaAtual;
}

/* ─── PREVIEW INLINE ─────────────────────────────── */
export function previewPDF() {
  var e    = getEscalaExport();
  var wrap = document.getElementById('pdf-preview-wrap');
  var div  = document.getElementById('pdf-preview');
  div.innerHTML = buildPDFContent(e);
  wrap.style.display = 'block';
  wrap.scrollIntoView({ behavior: 'smooth' });
}

/* ─── BUILD HTML DO PDF (PREVIEW) ────────────────── */
export function buildPDFContent(e) {
  function sectionHTML(title, ops, isLine) {
    var content = '';
    if (isLine) {
      if (ops.length === 0) content = '<p class="pdf-none">Nenhum operador</p>';
      else content = ops.map(o => `<div class="pdf-item"><span>${o.nome}</span> <span class="pdf-cars">${o.cars}</span></div>`).join('');
    } else {
      if (ops.length === 0) content = '<p class="pdf-none">Nenhum operador</p>';
      else content = ops.map(o => `<div class="pdf-item"><span>${o.nome}</span></div>`).join('');
    }
    return `<div class="pdf-sec-title">${title}</div>${content}`;
  }

  var allNames = getAllNamesInEscala(e);
  var ts = new Date().toLocaleString('pt-BR');

  return `
    <div style="padding:20px; font-family: sans-serif; color: #333;">
      <div style="background: #f5a623; color: #000; padding: 10px 20px; font-weight: bold; margin-bottom: 20px; border-radius: 4px;">
        VPC - SISTEMA DE GESTÃO DE PRODUÇÃO
      </div>
      <h1 style="font-size: 22px; margin: 0 0 5px 0; color: #111;">Relatório de Escala</h1>
      <p style="color: #666; font-size: 13px; margin-bottom: 20px;">
        Data: <strong>${fmtData(e.data)}</strong> &nbsp;|&nbsp; Operadores: <strong>${allNames.length}</strong> &nbsp;|&nbsp; Gerado: ${ts}
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div>
          ${sectionHTML('Montagem de Mídia', e.midia)}
          ${sectionHTML('Movimentação', e.mov)}
          ${sectionHTML('Adesivos', e.ades)}
        </div>
        <div>
          ${sectionHTML('Linha 1', [
            e.l1a ? {nome: e.l1a.nome, cars: 'Carros 1, 2, 3'} : null,
            e.l1b ? {nome: e.l1b.nome, cars: 'Carros 4, 5, 6'} : null
          ].filter(Boolean), true)}

          ${sectionHTML('Linha 2', [
            e.l2a ? {nome: e.l2a.nome, cars: 'Carros 1, 2, 3'} : null,
            e.l2b ? {nome: e.l2b.nome, cars: 'Carros 4, 5, 6'} : null
          ].filter(Boolean), true)}

          ${sectionHTML('Linha 3 (Aprendizagem)', [
            e.l3a ? {nome: e.l3a.nome, cars: 'Carro 1'} : null,
            e.l3b ? {nome: e.l3b.nome, cars: 'Carro 2'} : null,
            e.l3c ? {nome: e.l3c.nome, cars: 'Carro 3'} : null,
            e.l3d ? {nome: e.l3d.nome, cars: 'Carro 4'} : null
          ].filter(Boolean), true)}
        </div>
      </div>
    </div>
    <style>
      .pdf-sec-title { font-weight: bold; font-size: 14px; color: #f5a623; border-bottom: 1.5px solid #eee; padding-bottom: 5px; margin: 20px 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; }
      .pdf-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px; }
      .pdf-cars { color: #888; font-size: 12px; font-weight: normal; }
      .pdf-none { color: #aaa; font-size: 13px; font-style: italic; margin: 5px 0; }
    </style>
  `;
}

/* ─── GERAR PDF (jsPDF) ──────────────────────────── */
export function gerarPDF() {
  var btn    = document.getElementById('btn-pdf');
  var status = document.getElementById('pdf-status');
  btn.textContent = 'Gerando...';
  btn.disabled = true;

  function runPDF() {
    try {
      var e   = getEscalaExport();
      var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
      var pW  = 210, mg = 20, y = 35;
      var accent = [245, 166, 35]; // Orange VPC

      function chkPage(h) { if (y + h > 275) { doc.addPage(); drawHeader(true); } }

      function drawHeader(isNewPage) {
        // Header background
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.rect(0, 0, pW, 20, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('VPC - SISTEMA DE GESTÃO DE PRODUÇÃO', mg, 13);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        var now = new Date().toLocaleString('pt-BR');
        doc.text('Relatório emitido em: ' + now, pW - mg - 50, 13);

        if (!isNewPage) {
          y = 35;
          doc.setTextColor(33, 33, 33);
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          doc.text('Relatório de Escala', mg, y);
          y += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Data: ${fmtData(e.data)}   |   Total de Operadores: ${getAllNamesInEscala(e).length}`, mg, y);
          y += 15;
        } else {
          y = 30; // Margin top for new page content
        }
      }

      function section(title) {
        chkPage(25);
        doc.setFillColor(250, 250, 250);
        doc.rect(mg - 2, y - 5, pW - (mg * 2) + 4, 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(title.toUpperCase(), mg, y);
        
        doc.setDrawColor(accent[0], accent[1], accent[2]);
        doc.setLineWidth(0.5);
        doc.line(mg, y + 1.5, mg + 20, y + 1.5);
        y += 10;
      }

      function opRow(nome, info) {
        chkPage(8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(nome, mg + 2, y);
        
        if (info) {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(info, pW - mg - 5, y, { align: 'right' });
        }
        
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.2);
        doc.line(mg, y + 2, pW - mg, y + 2);
        y += 8;
      }

      function empty() {
        chkPage(8);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(180, 180, 180);
        doc.text('Nenhum operador atribuído nesta seção', mg + 2, y);
        y += 8;
      }

      // Start Drawing
      drawHeader(false);

      section('Montagem de Mídia');
      if (e.midia.length) e.midia.forEach(o => opRow(o.nome)); else empty();
      y += 5;

      section('Movimentação de Veículos');
      if (e.mov.length) e.mov.forEach(o => opRow(o.nome)); else empty();
      y += 5;

      section('Adesivos');
      if (e.ades.length) e.ades.forEach(o => opRow(o.nome)); else empty();
      y += 10;

      section('Linha de Produção - Linha 1');
      if (e.l1a || e.l1b) {
        if (e.l1a) opRow(e.l1a.nome, 'LADO A - Carros 1, 2, 3');
        if (e.l1b) opRow(e.l1b.nome, 'LADO B - Carros 4, 5, 6');
      } else empty();
      y += 5;

      section('Linha de Produção - Linha 2');
      if (e.l2a || e.l2b) {
        if (e.l2a) opRow(e.l2a.nome, 'LADO A - Carros 1, 2, 3');
        if (e.l2b) opRow(e.l2b.nome, 'LADO B - Carros 4, 5, 6');
      } else empty();
      y += 5;

      section('Linha 3 (Aprendizagem)');
      var hasL3 = false;
      if (e.l3a) { opRow(e.l3a.nome, 'Carro 1'); hasL3 = true; }
      if (e.l3b) { opRow(e.l3b.nome, 'Carro 2'); hasL3 = true; }
      if (e.l3c) { opRow(e.l3c.nome, 'Carro 3'); hasL3 = true; }
      if (e.l3d) { opRow(e.l3d.nome, 'Carro 4'); hasL3 = true; }
      if (!hasL3) empty();

      // Footer
      var totalPages = doc.getNumberOfPages();
      for (var i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(180, 180, 180);
        doc.text(`VPC Produção - Página ${i} de ${totalPages}`, pW / 2, 288, { align: 'center' });
      }

      doc.save(`escala-vpc-${e.data || 'relatorio'}.pdf`);
      
      btn.textContent = 'Baixar PDF';
      btn.disabled = false;
      status.textContent = 'PDF gerado com sucesso!';
      status.style.display = 'block';
      setTimeout(() => status.style.display = 'none', 4000);

    } catch (err) {
      console.error(err);
      btn.textContent = 'Baixar PDF';
      btn.disabled = false;
      alert('Erro ao gerar PDF: ' + err.message);
    }
  }

  if (window.jspdf) runPDF();
  else {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = runPDF;
    document.head.appendChild(s);
  }
}

/* ─── GERAR EXCEL (SheetJS) ──────────────────────── */
export function gerarExcel() {
  var btn    = document.getElementById('btn-excel');
  var status = document.getElementById('excel-status');
  btn.textContent = 'Gerando...';
  btn.disabled = true;

  function runExcel() {
    try {
      var e = getEscalaExport();
      var d = fmtData(e.data);
      var rows = [['Data','Area','Funcionario','Carros']];

      e.midia.forEach(function(o){ rows.push([d,'Montagem de Midia', o.nome, '-']); });
      e.mov.forEach(function(o){   rows.push([d,'Movimentacao',       o.nome, '-']); });
      e.ades.forEach(function(o){  rows.push([d,'Adesivos',           o.nome, '-']); });
      if (e.l1a) rows.push([d,'Linha 1', e.l1a.nome, '1,2,3']);
      if (e.l1b) rows.push([d,'Linha 1', e.l1b.nome, '4,5,6']);
      if (e.l2a) rows.push([d,'Linha 2', e.l2a.nome, '1,2,3']);
      if (e.l2b) rows.push([d,'Linha 2', e.l2b.nome, '4,5,6']);
      var l3keys = ['l3a','l3b','l3c','l3d'];
      l3keys.forEach(function(k,i){ if(e[k]) rows.push([d,'Linha 3 (Aprend.)', e[k].nome, 'carro '+(i+1)]); });

      var wb  = XLSX.utils.book_new();
      var ws  = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{wch:14},{wch:24},{wch:20},{wch:14}];
      XLSX.utils.book_append_sheet(wb, ws, 'Escala');

      var l3count = l3keys.filter(function(k){ return e[k]; }).length;
      var sum = [
        ['RESUMO DA ESCALA VPC'],
        ['Data:', d],
        ['Total operadores:', getAllNamesInEscala(e).length],
        [''],
        ['Setor','Qtd'],
        ['Montagem de Midia', e.midia.length],
        ['Movimentacao',      e.mov.length],
        ['Adesivos',          e.ades.length],
        ['Linha 1',           (e.l1a?1:0)+(e.l1b?1:0)],
        ['Linha 2',           (e.l2a?1:0)+(e.l2b?1:0)],
        ['Linha 3',           l3count],
      ];
      var ws2 = XLSX.utils.aoa_to_sheet(sum);
      ws2['!cols'] = [{wch:28},{wch:12}];
      XLSX.utils.book_append_sheet(wb, ws2, 'Resumo');

      XLSX.writeFile(wb, 'escala-vpc-' + (e.data||'hoje') + '.xlsx');
      btn.textContent = 'Baixar Excel';
      btn.disabled = false;
      status.textContent = 'Excel baixado com sucesso!';
      status.style.display = 'block';
      setTimeout(function(){ status.style.display='none'; }, 4000);

    } catch(err) {
      btn.textContent = 'Baixar Excel'; btn.disabled = false;
      alert('Erro ao gerar Excel: ' + err.message);
    }
  }

  if (window.XLSX) {
    runExcel();
  } else {
    var s = document.createElement('script');
    s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload  = runExcel;
    s.onerror = function() {
      btn.textContent = 'Baixar Excel'; btn.disabled = false;
      alert('Nao foi possivel carregar a biblioteca Excel. Verifique sua conexao.');
    };
    document.head.appendChild(s);
  }
}

