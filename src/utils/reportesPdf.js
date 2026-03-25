import { jsPDF } from 'jspdf';

const BRAND_NAME = 'ARROYO Hospedaje';

function writeHeader(doc, title, subtitle) {
  const generatedAt = new Date().toLocaleString('es-PE');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(BRAND_NAME, 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Descargado: ${generatedAt}`, 196, 14, { align: 'right' });

  doc.setDrawColor(200);
  doc.line(14, 18, 196, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (subtitle) {
    doc.text(subtitle, 14, 32);
  }

  return subtitle ? 40 : 34;
}

function drawTableHeader(doc, y, columns) {
  doc.setFillColor(242, 242, 242);
  doc.rect(14, y - 5, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  let x = 14;
  columns.forEach((col) => {
    doc.text(col.label, x + 2, y);
    x += col.width;
  });

  return y + 8;
}

function formatDateOnly(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-PE');
}

function normalizeDateForFilename() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function descargarReporteCajaMovimientos(movimientos, filtros = {}) {
  const doc = new jsPDF();
  const periodo = filtros?.desde && filtros?.hasta
    ? `Periodo: ${filtros.desde} a ${filtros.hasta}`
    : 'Periodo: Vista actual';
  const resumen = filtros?.resumen || {};
  let y = writeHeader(doc, 'Reporte de Caja', periodo);

  const totalIngresos = Number(resumen.totalIngresos || 0);
  const totalEgresos = Number(resumen.totalEgresos || 0);
  const balance = Number(resumen.balance || 0);
  const movimientosCount = Number(resumen.cantidadMovimientos || 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Resumen', 14, y);

  const summaryY = y + 4;
  const summaryCols = [
    { label: 'Total Ingresos', value: `S/ ${totalIngresos.toFixed(2)}`, color: [15, 138, 84] },
    { label: 'Total Egresos', value: `S/ ${totalEgresos.toFixed(2)}`, color: [214, 69, 65] },
    { label: 'Balance', value: `S/ ${balance.toFixed(2)}`, color: balance >= 0 ? [17, 138, 178] : [214, 69, 65] },
    { label: 'Movimientos', value: String(movimientosCount), color: [64, 64, 64] },
  ];

  const cellWidth = 45.5;
  const cellHeight = 20;
  summaryCols.forEach((item, index) => {
    const x = 14 + (index * cellWidth);
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(220);
    doc.roundedRect(x, summaryY, cellWidth - 1.5, cellHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(95);
    doc.text(item.label.toUpperCase(), x + 2, summaryY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, x + 2, summaryY + 14);
  });

  doc.setTextColor(0);
  y = summaryY + cellHeight + 10;

  const columns = [
    { label: 'Fecha', width: 38 },
    { label: 'Descripcion', width: 104 },
    { label: 'Monto', width: 40 },
  ];

  y = drawTableHeader(doc, y, columns);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  (movimientos || []).forEach((row) => {
    if (y > 275) {
      doc.addPage();
      y = writeHeader(doc, 'Reporte de Caja', periodo);
      y = drawTableHeader(doc, y, columns);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    }

    const fecha = String(row?.fecha || '-');
    const descripcion = String(row?.descripcion || '-').slice(0, 68);
    const monto = String(row?.monto || '-');

    doc.text(fecha, 16, y);
    doc.text(descripcion, 54, y);
    doc.text(monto, 194, y, { align: 'right' });
    doc.setDrawColor(232);
    doc.line(14, y + 2, 196, y + 2);
    y += 7;
  });

  if (!movimientos || movimientos.length === 0) {
    doc.setTextColor(110);
    doc.text('No hay movimientos para exportar con los filtros actuales.', 14, y + 4);
    doc.setTextColor(0);
  }

  doc.save(`caja-movimientos-${normalizeDateForFilename()}.pdf`);
}

export function descargarReporteAlquileresActivos(alquileres) {
  const doc = new jsPDF();
  let y = writeHeader(doc, 'Reporte de Alquileres Activos', 'Vista actual de alquileres activos');

  const columns = [
    { label: 'Habitacion', width: 20 },
    { label: 'Cliente', width: 30 },
    { label: 'Empresa', width: 30 },
    { label: 'Fecha Ingreso', width: 28 },
    { label: 'Fecha Prevista Salida', width: 44 },
    { label: 'Firma', width: 30 },
  ];

  y = drawTableHeader(doc, y, columns);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  (alquileres || []).forEach((row) => {
    if (y > 275) {
      doc.addPage();
      y = writeHeader(doc, 'Reporte de Alquileres Activos', 'Vista actual de alquileres activos');
      y = drawTableHeader(doc, y, columns);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    }

    const habitacion = String(row?.numeroHabitacion || '-').slice(0, 10);
    const cliente = String(row?.nombreCliente || '-').slice(0, 16);
    const empresa = String(row?.empresaNombre || '-').slice(0, 16);
    const ingreso = formatDateOnly(row?.fechaIngreso);
    const salida = formatDateOnly(row?.fechaPrevista);

    doc.text(habitacion, 16, y);
    doc.text(cliente, 36, y);
    doc.text(empresa, 66, y);
    doc.text(ingreso, 96, y);
    doc.text(salida, 124, y);
    doc.rect(164, y - 4, 28, 6);

    doc.setDrawColor(232);
    doc.line(14, y + 2, 196, y + 2);
    y += 8;
  });

  if (!alquileres || alquileres.length === 0) {
    doc.setTextColor(110);
    doc.text('No hay alquileres activos para exportar en la vista actual.', 14, y + 4);
    doc.setTextColor(0);
  }

  doc.save(`alquileres-activos-${normalizeDateForFilename()}.pdf`);
}
