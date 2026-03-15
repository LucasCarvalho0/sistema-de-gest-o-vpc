import { state, getAllNamesInEscala, fmtData } from './state.js';
import { formatShiftLabel } from './dateUtils.js';

/* ─── Escala a exportar ──────────────────────────── */
export function getEscalaExport() {
  // Prefer active scale if it has data, otherwise use the most recent history item
  if (state.escalaAtual && state.escalaAtual.midia && state.escalaAtual.midia.length > 0) {
    return state.escalaAtual;
  }
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
      else content = ops.map(o => {
        const name = typeof o === 'string' ? o : (o.nome || 'Operador');
        const cars = typeof o === 'string' ? '' : (o.cars || '');
        return `<div class="pdf-item"><span>${name}</span> <span class="pdf-cars">${cars}</span></div>`;
      }).join('');
    } else {
      if (!ops || ops.length === 0) content = '<p class="pdf-none">Nenhum operador</p>';
      else content = ops.map(o => `<div class="pdf-item"><span>${typeof o === 'string' ? o : o.nome}</span></div>`).join('');
    }
    return `
      <div class="pdf-card">
        <div class="pdf-sec-title">${title}</div>
        ${content}
      </div>
    `;
  }

  var allNames = getAllNamesInEscala(e);
  var ts = new Date().toLocaleString('pt-BR');

  return `
    <div style="padding:30px; font-family: 'Barlow', sans-serif; background: #eaedf0; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
      <div style="background: #f5a623; color: #fff; padding: 20px 30px; margin-bottom: 30px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(245,166,35,0.2);">
        <div style="font-weight: 900; font-size: 24px; letter-spacing: 1px;">VPC <span style="font-weight: 300; opacity: 0.8;">PRODUÇÃO</span></div>
        <div style="font-size: 14px; opacity: 0.9;">Relatório de Escala</div>
      </div>
      
      <div style="margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-left: 10px; margin-right: 10px;">
        <h1 style="font-size: 20px; color: #111; margin: 0 0 5px 0;">Escala do Turno</h1>
        <p style="color: #666; font-size: 14px; margin: 0;">
          <strong>${formatShiftLabel(e.data)}</strong> &nbsp;·&nbsp; ${allNames.length} operadores ativos &nbsp;·&nbsp; Gerado em ${ts}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 0 10px;">
        <div>
          ${sectionHTML('Mídia', e.midia)}
          ${sectionHTML('Movimentação', e.mov)}
          ${sectionHTML('Adesivos', e.ades)}
        </div>
        <div>
          ${sectionHTML('Linha 1', [
            e.l1a ? {nome: typeof e.l1a === 'string' ? e.l1a : e.l1a.nome, cars: 'LADO A - Carros 1, 2, 3'} : null,
            e.l1b ? {nome: typeof e.l1b === 'string' ? e.l1b : e.l1b.nome, cars: 'LADO B - Carros 4, 5, 6'} : null
          ].filter(Boolean), true)}

          ${sectionHTML('Linha 2', [
            e.l2a ? {nome: typeof e.l2a === 'string' ? e.l2a : e.l2a.nome, cars: 'LADO A - Carros 1, 2, 3'} : null,
            e.l2b ? {nome: typeof e.l2b === 'string' ? e.l2b : e.l2b.nome, cars: 'LADO B - Carros 4, 5, 6'} : null
          ].filter(Boolean), true)}

          ${sectionHTML('Linha 3 (Aprend.)', [
            e.l3a ? {nome: typeof e.l3a === 'string' ? e.l3a : e.l3a.nome, cars: 'Carro 1'} : null,
            e.l3b ? {nome: typeof e.l3b === 'string' ? e.l3b : e.l3b.nome, cars: 'Carro 2'} : null,
            e.l3c ? {nome: typeof e.l3c === 'string' ? e.l3c : e.l3c.nome, cars: 'Carro 3'} : null,
            e.l3d ? {nome: typeof e.l3d === 'string' ? e.l3d : e.l3d.nome, cars: 'Carro 4'} : null
          ].filter(Boolean), true)}
        </div>
      </div>
    </div>
    <style>
      .pdf-card { background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
      .pdf-sec-title { font-weight: 800; font-size: 12px; color: #f5a623; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #f5a623; padding-left: 10px; }
      .pdf-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f4f4f4; font-size: 14px; color: #333; }
      .pdf-item:last-child { border-bottom: none; }
      .pdf-cars { color: #888; font-size: 11px; font-weight: 500; font-style: italic; }
      .pdf-none { color: #bbb; font-size: 13px; font-style: italic; margin: 5px 0; text-align: center; }
    </style>
  `;
}

/* ─── GERAR PDF (jsPDF) ──────────────────────────── */
export function gerarPDF(escalaInput) {
  var btn    = document.getElementById('btn-pdf');
  var status = document.getElementById('pdf-status');
  if (btn) btn.textContent = 'Gerando...';
  if (btn) btn.disabled = true;

  function runPDF() {
    try {
      var e   = escalaInput || getEscalaExport();
      var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
      var pW  = 210, pH = 297, mg = 20, y = 35;
      var accent = [245, 166, 35]; // Orange VPC

      function chkPage(h) { 
        if (y + h > 275) { 
          doc.addPage(); 
          drawPageBg(); 
          drawHeader(true); 
        } 
      }

      function drawPageBg() {
        doc.setFillColor(234, 237, 240); // Darker off-white for more contrast
        doc.rect(0, 0, pW, pH, 'F');
      }

      function drawHeader(isNewPage) {
        // Full width header banner
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.rect(0, 0, pW, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('VPC', mg, 14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.text('PRODUÇÃO', mg + 13, 14);
        
        doc.setFontSize(9);
        doc.text('RELATÓRIO DE ESCALA', pW - mg - 40, 14);

        if (!isNewPage) {
          y = 40;
          doc.setTextColor(40, 40, 40);
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          doc.text('Escala do Turno', mg, y);
          y += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`${formatShiftLabel(e.data)}`, mg, y);
          doc.text(`Total de Operadores: ${getAllNamesInEscala(e).length}`, pW - mg, y, { align: 'right' });
          
          y += 5;
          doc.setDrawColor(240, 240, 240);
          doc.setLineWidth(1);
          doc.line(mg, y, pW - mg, y);
          y += 15;
        } else {
          y = 35;
        }
      }

      function section(title, count) {
        const rowH = 9;
        const headH = 10;
        const totalH = headH + (Math.max(1, count) * rowH) + 2;
        
        chkPage(totalH < 40 ? totalH : 30); // Check if we can fit at least the header and some rows
        
        // Draw the full white card background for this section
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(mg, y - 8, pW - (mg * 2), totalH, 2, 2, 'F');
        
        // Section Header Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(title.toUpperCase(), mg + 5, y);
        
        // Left accent bar
        doc.setDrawColor(accent[0], accent[1], accent[2]);
        doc.setLineWidth(1.5);
        doc.line(mg, y - 8, mg, y + 2);
        
        y += 10;
      }

      function opRow(nome, info) {
        chkPage(10);
        // Draw card background for the row
        doc.setFillColor(255, 255, 255);
        doc.rect(mg, y - 4, pW - (mg * 2), 10, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11); // Slightly smaller
        doc.setTextColor(50, 50, 50);
        doc.text(nome, mg + 5, y);
        
        if (info) {
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(140, 140, 140);
          doc.text(info, pW - mg - 5, y, { align: 'right' });
        }
        
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.2);
        doc.line(mg + 5, y + 3, pW - mg - 5, y + 3);
        y += 9;
      }

      function empty() {
        chkPage(10);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(190, 190, 190);
        doc.text('Nenhum operador atribuído nesta seção', mg + 5, y);
        y += 9;
      }

      // Start Drawing
      drawPageBg();
      drawHeader(false);

      const midia = Array.isArray(e.midia) ? e.midia : [];
      section('Montagem de Mídia', midia.length);
      if (midia.length) midia.forEach(o => opRow(typeof o === 'string' ? o : (o.nome || 'Operador'))); else empty();
      y += 8;

      const mov = Array.isArray(e.mov) ? e.mov : [];
      section('Movimentação de Veículos', mov.length);
      if (mov.length) mov.forEach(o => opRow(typeof o === 'string' ? o : (o.nome || 'Operador'))); else empty();
      y += 8;

      const ades = Array.isArray(e.ades) ? e.ades : [];
      section('Adesivos', ades.length);
      if (ades.length) ades.forEach(o => opRow(typeof o === 'string' ? o : (o.nome || 'Operador'))); else empty();
      y += 12;

      const l1Count = (e.l1a ? 1 : 0) + (e.l1b ? 1 : 0);
      section('Linha de Produção - Linha 1', l1Count);
      if (e.l1a || e.l1b) {
        if (e.l1a) opRow(typeof e.l1a === 'string' ? e.l1a : (e.l1a.nome || 'Operador'), 'LADO A - Carros 1, 2, 3');
        if (e.l1b) opRow(typeof e.l1b === 'string' ? e.l1b : (e.l1b.nome || 'Operador'), 'LADO B - Carros 4, 5, 6');
      } else empty();
      y += 8;

      const l2Count = (e.l2a ? 1 : 0) + (e.l2b ? 1 : 0);
      section('Linha de Produção - Linha 2', l2Count);
      if (e.l2a || e.l2b) {
        if (e.l2a) opRow(typeof e.l2a === 'string' ? e.l2a : (e.l2a.nome || 'Operador'), 'LADO A - Carros 1, 2, 3');
        if (e.l2b) opRow(typeof e.l2b === 'string' ? e.l2b : (e.l2b.nome || 'Operador'), 'LADO B - Carros 4, 5, 6');
      } else empty();
      y += 8;

      const l3ops = ['l3a', 'l3b', 'l3c', 'l3d'].filter(k => e[k]);
      section('Linha 3 (Aprendizagem)', l3ops.length);
      if (l3ops.length) {
        ['l3a', 'l3b', 'l3c', 'l3d'].forEach((k, idx) => {
          if (e[k]) opRow(typeof e[k] === 'string' ? e[k] : (e[k].nome || 'Operador'), `Carro ${idx + 1}`);
        });
      } else empty();

      // Footer
      var totalPages = doc.getNumberOfPages();
      for (var i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        var now = new Date().toLocaleString('pt-BR');
        doc.text(`Gerado em: ${now}  |  Página ${i} de ${totalPages}`, pW / 2, 288, { align: 'center' });
      }
      
      const cleanLabel = formatShiftLabel(e.data).replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `escala-vpc-${cleanLabel}.pdf`;
      doc.save(fileName);
      
      if (btn) {
        btn.textContent = 'Baixar PDF';
        btn.disabled = false;
      }
      if (status) {
        status.textContent = 'PDF gerado com sucesso!';
        status.style.display = 'block';
        setTimeout(() => status.style.display = 'none', 4000);
      }

    } catch (err) {
      console.error(err);
      if (btn) {
        btn.textContent = 'Baixar PDF';
        btn.disabled = false;
      }
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
export function gerarExcel(escalaInput) {
  var btn    = document.getElementById('btn-excel');
  var status = document.getElementById('excel-status');
  if (btn) btn.textContent = 'Gerando...';
  if (btn) btn.disabled = true;

  function runExcel() {
    try {
      var e = escalaInput || getEscalaExport();
      var labelTurno = formatShiftLabel(e.data);
      var rows = [['Turno','Area','Funcionario','Carros']];

      e.midia.forEach(function(o){ rows.push([labelTurno,'Montagem de Midia', o.nome, '-']); });
      e.mov.forEach(function(o){   rows.push([labelTurno,'Movimentacao',       typeof o === 'string' ? o : o.nome, '-']); });
      e.ades.forEach(function(o){  rows.push([labelTurno,'Adesivos',           typeof o === 'string' ? o : o.nome, '-']); });
      if (e.l1a) rows.push([labelTurno,'Linha 1', typeof e.l1a === 'string' ? e.l1a : e.l1a.nome, '1,2,3']);
      if (e.l1b) rows.push([labelTurno,'Linha 1', typeof e.l1b === 'string' ? e.l1b : e.l1b.nome, '4,5,6']);
      if (e.l2a) rows.push([labelTurno,'Linha 2', typeof e.l2a === 'string' ? e.l2a : e.l2a.nome, '1,2,3']);
      if (e.l2b) rows.push([labelTurno,'Linha 2', typeof e.l2b === 'string' ? e.l2b : e.l2b.nome, '4,5,6']);
      var l3keys = ['l3a','l3b','l3c','l3d'];
      l3keys.forEach(function(k,i){ if(e[k]) rows.push([labelTurno,'Linha 3 (Aprend.)', typeof e[k] === 'string' ? e[k] : e[k].nome, 'carro '+(i+1)]); });

      var wb  = XLSX.utils.book_new();
      var ws  = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{wch:14},{wch:24},{wch:20},{wch:14}];
      XLSX.utils.book_append_sheet(wb, ws, 'Escala');

      var l3count = l3keys.filter(function(k){ return e[k]; }).length;
      var sum = [
        ['RESUMO DA ESCALA VPC'],
        ['Turno:', labelTurno],
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

      const cleanLabel = labelTurno.replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `escala-vpc-${cleanLabel}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      if (btn) {
        btn.textContent = 'Baixar Excel';
        btn.disabled = false;
      }
      if (status) {
        status.textContent = 'Excel baixado com sucesso!';
        status.style.display = 'block';
        setTimeout(function(){ status.style.display='none'; }, 4000);
      }

    } catch(err) {
      if (btn) {
        btn.textContent = 'Baixar Excel'; 
        btn.disabled = false;
      }
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

