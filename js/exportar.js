import { state, getAllNamesInEscala, fmtData } from './state.js';
import { formatShiftLabel, isWeekend } from './dateUtils.js';

/* ─── Escala a exportar ──────────────────────────── */
export function getEscalaExport() {
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

/* ─── HELPERS ────────────────────────────────────── */
function sectionHTML(title, ops, isLine) {
  var content = '';
  if (isLine) {
    if (!ops || ops.length === 0) content = '<p class="pdf-none">Nenhum operador</p>';
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

/* ─── BUILD HTML DO PDF (PREVIEW) ────────────────── */
export function buildPDFContent(e) {
  var allNames = getAllNamesInEscala(e);
  var ts = new Date().toLocaleString('pt-BR');

  if (e.area === 'Compound') {
    return `
      <div style="padding:30px; font-family: 'Barlow', sans-serif; background: #eaedf0; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background: #3b82f6; color: #fff; padding: 20px 30px; margin-bottom: 30px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(59,130,246,0.2);">
          <div style="font-weight: 900; font-size: 24px; letter-spacing: 1px;">VPC <span style="font-weight: 300; opacity: 0.8;">> COMPOUND</span></div>
          <div style="font-size: 14px; opacity: 0.9;">Escala de Hora Extra</div>
        </div>
        <div style="margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-left: 10px; margin-right: 10px;">
          <h1 style="font-size: 20px; color: #111; margin: 0 0 5px 0;">Equipe Emprestada</h1>
          <p style="color: #666; font-size: 14px; margin: 0;">
            <strong>${formatShiftLabel(e.data)}</strong> &nbsp;·&nbsp; ${(e.compound || []).length} operadores &nbsp;·&nbsp; Gerado em ${ts}
          </p>
        </div>
        <div style="padding: 0 10px;">
          ${sectionHTML('Participantes Compound', e.compound)}
        </div>
      </div>
      <style>
        .pdf-card { background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .pdf-sec-title { font-weight: 800; font-size: 12px; color: #3b82f6; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #3b82f6; padding-left: 10px; }
        .pdf-item { padding: 8px 0; border-bottom: 1px solid #f4f4f4; font-size: 14px; color: #333; }
        .pdf-none { color: #bbb; font-size: 13px; font-style: italic; margin: 5px 0; text-align: center; }
      </style>
    `;
  }

  return `
    <div style="padding:30px; font-family: 'Barlow', sans-serif; background: #eaedf0; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
      <div style="background: #f5a623; color: #fff; padding: 20px 30px; margin-bottom: 30px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(245,166,35,0.2);">
        <div style="font-weight: 900; font-size: 24px; letter-spacing: 1px;">VPC <span style="font-weight: 300; opacity: 0.8;">PRODUÇÃO</span></div>
        <div style="font-size: 14px; opacity: 0.9;">Relatório de Escala ${e.tipo === 'hora-extra' ? ' (HE)' : ''}</div>
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
  if (btn) { btn.textContent = 'Gerando...'; btn.disabled = true; }

  function runPDF() {
    try {
      var e   = escalaInput || getEscalaExport();
      var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
      var pW  = 210, pH = 297, mg = 20, y = 35;
      var accent = e.area === 'Compound' ? [59, 130, 246] : [245, 166, 35]; 

      // Helper to get name with company
      const getName = (o) => {
        if (!o) return '';
        const nome = typeof o === 'string' ? o : (o.nome || 'Operador');
        const emp = typeof o === 'object' && o.empresa ? ` (${o.empresa})` : '';
        return nome + emp;
      };

      function chkPage(h) { 
        if (y + h > 275) { 
          doc.addPage(); 
          drawPageBg(); 
          drawHeader(true); 
        } 
      }

      function drawPageBg() {
        doc.setFillColor(234, 237, 240); 
        doc.rect(0, 0, pW, pH, 'F');
      }

      function drawHeader(isNewPage) {
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.rect(0, 0, pW, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('VPC', mg, 14);
        doc.setFont('helvetica', 'normal');
        doc.text(e.area === 'Compound' ? '> COMPOUND' : '> VPC', mg + 13, 14);
        
        let reportTitle = 'RELATÓRIO DE ESCALA';
        if (e.area === 'Compound') {
          reportTitle = 'RELATÓRIO DE HORA EXTRA (COMPOUND)';
        } else if (isWeekend(e.data)) {
          reportTitle = 'RELATÓRIO DE HORA EXTRA (VPC)';
        }
        
        doc.setFontSize(9);
        doc.text(reportTitle, pW - mg, 14, { align: 'right' });

        if (!isNewPage) {
          y = 40;
          doc.setTextColor(40, 40, 40);
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          
          let pageTitle = 'Escala do Turno VPC';
          if (e.area === 'Compound') pageTitle = 'Equipe Emprestada (Compound)';
          else if (isWeekend(e.data)) pageTitle = 'Hora Extra VPC';

          doc.text(pageTitle, mg, y);
          y += 10;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`${formatShiftLabel(e.data)}`, mg, y);
          doc.text(`Total de Operadores: ${getAllNamesInEscala(e).length}`, pW - mg, y, { align: 'right' });
          
          if (e.lider || e.sublider) {
            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accent[0], accent[1], accent[2]);
            let lidText = '';
            if (e.lider) lidText += `LÍDER: ${getName(e.lider)}   `;
            if (e.sublider) lidText += `SUB-LÍDER: ${getName(e.sublider)}`;
            doc.text(lidText, mg, y);
          }

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
        chkPage(totalH < 40 ? totalH : 30);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(mg, y - 8, pW - (mg * 2), totalH, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(title.toUpperCase(), mg + 5, y);
        doc.setDrawColor(accent[0], accent[1], accent[2]);
        doc.setLineWidth(1.5);
        doc.line(mg, y - 8, mg, y + 2);
        y += 10;
      }

      function opRow(nome, info) {
        chkPage(10);
        doc.setFillColor(255, 255, 255);
        doc.rect(mg, y - 4, pW - (mg * 2), 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11); 
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
        doc.text('Nenhum operador atribuído', mg + 5, y);
        y += 9;
      }

        drawPageBg();
        drawHeader(false);

        if (e.area === 'Compound') {
          const compound = Array.isArray(e.compound) ? e.compound : [];
          section('Participantes', compound.length);
          if (compound.length) {
            compound.forEach(o => {
              const label = o.nome || 'Operador';
              const extra = (o.empresa || '') + (o.horario ? ' | ' + o.horario : '');
              opRow(label, extra);
            });
          } else empty();
        } else {
          // 1. LIDERANÇA
          const lidCount = (e.lider ? 1 : 0) + (e.sublider ? 1 : 0);
          section('Liderança', lidCount);
          if (e.lider) opRow(getName(e.lider), 'LÍDER');
          if (e.sublider) opRow(getName(e.sublider), 'SUB-LÍDER');
          if (!lidCount) empty();
          y += 5;

          // 2. MÍDIA
          const midia = Array.isArray(e.midia) ? e.midia : [];
          section('Montagem de Mídia', midia.length);
          if (midia.length) midia.forEach(o => opRow(getName(o))); else empty();
          y += 5;

          // 3. MOVIMENTAÇÃO
          const mov = Array.isArray(e.mov) ? e.mov : [];
          section('Movimentação de Veículos', mov.length);
          if (mov.length) mov.forEach(o => opRow(getName(o))); else empty();
          y += 5;

          // 4. ADESIVOS
          const ades = Array.isArray(e.ades) ? e.ades : [];
          section('Adesivos', ades.length);
          if (ades.length) ades.forEach(o => opRow(getName(o))); else empty();
          y += 5;

          // 5. CONFERÊNCIA
          const confCount = (e.conferente1 ? 1 : 0) + (e.conferente2 ? 1 : 0);
          section('Conferência', confCount);
          if (e.conferente1) opRow(getName(e.conferente1), 'CONFERENTE 1');
          if (e.conferente2) opRow(getName(e.conferente2), 'CONFERENTE 2');
          if (!confCount) empty();
          y += 5;

          // 6. LINHAS
          const l1Count = (e.l1a ? 1 : 0) + (e.l1b ? 1 : 0);
          section('Linha de Produção - Linha 1', l1Count);
          if (e.l1a) opRow(getName(e.l1a), 'LADO A - Carros 1, 2, 3');
          if (e.l1b) opRow(getName(e.l1b), 'LADO B - Carros 4, 5, 6');
          if (!l1Count) empty();
          y += 5;

          const l2Count = (e.l2a ? 1 : 0) + (e.l2b ? 1 : 0);
          section('Linha de Produção - Linha 2', l2Count);
          if (e.l2a) opRow(getName(e.l2a), 'LADO A - Carros 1, 2, 3');
          if (e.l2b) opRow(getName(e.l2b), 'LADO B - Carros 4, 5, 6');
          if (!l2Count) empty();
          y += 5;

          const l3ops = ['l3a', 'l3b', 'l3c', 'l3d'].filter(k => e[k]);
          section('Linha 3 (Aprendizagem)', l3ops.length);
          if (l3ops.length) {
            ['l3a', 'l3b', 'l3c', 'l3d'].forEach((k, idx) => {
              if (e[k]) opRow(getName(e[k]), `Carro ${idx + 1}`);
            });
          } else empty();
        }

      var totalPages = doc.getNumberOfPages();
      for (var i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        var now = new Date().toLocaleString('pt-BR');
        doc.text(`Gerado em: ${now}  |  Página ${i} de ${totalPages}`, pW / 2, 288, { align: 'center' });
      }
      
      const cleanLabel = formatShiftLabel(e.data).replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `escala-${e.tipo === 'hora-extra' ? 'he' : 'vpc'}-${cleanLabel}.pdf`;
      doc.save(fileName);
      
      // Em dispositivos mobile, abrir em nova aba ajuda baixar
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }

      if (btn) { btn.textContent = 'Baixar PDF'; btn.disabled = false; }
      if (status) { status.textContent = 'PDF gerado!'; status.style.display = 'block'; setTimeout(() => status.style.display = 'none', 4000); }
    } catch (err) {
      console.error(err);
      if (btn) { btn.textContent = 'Baixar PDF'; btn.disabled = false; }
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
  if (btn) { btn.textContent = 'Gerando...'; btn.disabled = true; }

  function runExcel() {
    try {
      var e = escalaInput || getEscalaExport();
      var labelTurno = formatShiftLabel(e.data);
      var rows = [['Turno','Area','Funcionario','Empresa','Horário','Tipo']];
      const tipo = e.tipo === 'hora-extra' ? 'HE' : 'Normal';

      if (e.area === 'Compound') {
        const compound = Array.isArray(e.compound) ? e.compound : [];
        compound.forEach(o => rows.push([labelTurno, 'Compound', o.nome, o.empresa || 'CC', o.horario || '-', tipo]));
      } else {
        ['midia','mov','ades'].forEach(k => {
          if (Array.isArray(e[k])) e[k].forEach(o => rows.push([labelTurno, k, o.nome, '-', tipo]));
        });
        if (e.l1a) rows.push([labelTurno,'Linha 1', typeof e.l1a === 'string' ? e.l1a : e.l1a.nome, '1,2,3', tipo]);
        if (e.l1b) rows.push([labelTurno,'Linha 1', typeof e.l1b === 'string' ? e.l1b : e.l1b.nome, '4,5,6', tipo]);
        if (e.l2a) rows.push([labelTurno,'Linha 2', typeof e.l2a === 'string' ? e.l2a : e.l2a.nome, '1,2,3', tipo]);
        if (e.l2b) rows.push([labelTurno,'Linha 2', typeof e.l2b === 'string' ? e.l2b : e.l2b.nome, '4,5,6', tipo]);
        ['l3a','l3b','l3c','l3d'].forEach((k,i) => { if(e[k]) rows.push([labelTurno,'Linha 3', typeof e[k] === 'string' ? e[k] : e[k].nome, 'carro '+(i+1), tipo]); });
      }

      var wb  = XLSX.utils.book_new();
      var ws  = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{wch:14},{wch:24},{wch:20},{wch:14},{wch:10}];
      XLSX.utils.book_append_sheet(wb, ws, 'Escala');

      const cleanLabel = labelTurno.replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `escala-${e.tipo === 'hora-extra' ? 'he' : 'vpc'}-${cleanLabel}.xlsx`;
      XLSX.writeFile(wb, fileName);
      if (btn) { btn.textContent = 'Baixar Excel'; btn.disabled = false; }
      if (status) { status.textContent = 'Excel baixado!'; status.style.display = 'block'; setTimeout(() => status.style.display='none', 4000); }
    } catch(err) {
      console.error(err);
      if (btn) { btn.textContent = 'Baixar Excel'; btn.disabled = false; }
      alert('Erro ao gerar Excel: ' + err.message);
    }
  }

  if (window.XLSX) runExcel();
  else {
    var s = document.createElement('script');
    s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload  = runExcel;
    document.head.appendChild(s);
  }
}
