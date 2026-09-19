import { jsPDF } from 'jspdf';
import { estimate, money, paidAmount, paymentStatus, prettyDate, rentalDays, totalCapacity, totalUnits, vendorCost, type Booking, type DemoData, type Document } from '../data';

const ink: [number, number, number] = [27, 42, 35];
const muted: [number, number, number] = [100, 113, 106];
const rule: [number, number, number] = [220, 226, 222];

function header(doc: jsPDF, title: string, subtitle = '') {
  doc.setFillColor(...ink); doc.rect(0, 0, 297, 8, 'F');
  doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.text('nusaride.', 16, 25);
  doc.setFontSize(15); doc.text(title.toUpperCase(), 281, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted); doc.setFontSize(8); doc.text(subtitle, 281, 28, { align: 'right' }); doc.setDrawColor(...rule); doc.line(16, 34, 281, 34);
}
function footer(doc: jsPDF) { doc.setDrawColor(...rule); doc.line(16, 195, 281, 195); doc.setTextColor(...muted); doc.setFontSize(7.5); doc.text('NusaRide Workspace', 16, 201); doc.text(`Halaman ${doc.getCurrentPageInfo().pageNumber}`, 281, 201, { align: 'right' }); }
function table(doc: jsPDF, headers: string[], rows: string[][], startY: number) {
  const left = 16, width = 265, col = width / Math.max(headers.length, 1); let y = startY;
  const tableHeader = () => { doc.setFillColor(235, 241, 237); doc.rect(left, y, width, 8, 'F'); doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); headers.forEach((h, i) => doc.text(h, left + i * col + 3, y + 5.2)); y += 8; };
  tableHeader();
  rows.forEach((values, index) => { const cells = values.map(value => doc.splitTextToSize(String(value || '-'), col - 6)); const height = Math.max(7, ...cells.map(cell => cell.length * 4.2 + 3)); if (y + height > 190) { footer(doc); doc.addPage(); header(doc, 'Report'); y = 42; tableHeader(); } if (index % 2) { doc.setFillColor(249, 251, 249); doc.rect(left, y, width, height, 'F'); } doc.setTextColor(...ink); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.7); cells.forEach((cell, i) => doc.text(cell, left + i * col + 3, y + 4.8)); doc.setDrawColor(...rule); doc.line(left, y + height, left + width, y + height); y += height; });
  return y;
}

export function downloadBookingPDF(data: DemoData, booking: Booking, type: 'Quotation' | 'Invoice' = 'Invoice', document?: Document) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }); const discount = document?.discount || 0, total = Math.max(0, booking.total - discount), paid = paidAmount(data, booking.id);
  header(doc, type, document?.number || `${type === 'Quotation' ? 'QUO' : 'INV'}/${booking.code}`);
  doc.setTextColor(...muted); doc.setFontSize(8); doc.text('DITUJUKAN KEPADA', 16, 45); doc.text('DETAIL DOKUMEN', 154, 45); doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(booking.company || booking.name, 16, 52); doc.text(document?.number || booking.code, 154, 52);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted); doc.setFontSize(8.5); doc.text([booking.name, booking.email, booking.whatsapp], 16, 58); doc.text([`Berlaku sampai: ${document ? prettyDate(document.validUntil) : '-'}`, `Status: ${document?.status || booking.status}`], 154, 58);
  doc.setDrawColor(...rule); doc.line(16, 75, 281, 75); doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(`${booking.pickup}  -  ${booking.destination}`, 16, 84); doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(`${prettyDate(booking.start)} - ${prettyDate(booking.end)}  |  ${booking.time} WIB  |  ${booking.passengers} penumpang`, 16, 90);
  doc.setFillColor(249, 251, 249); doc.rect(16, 96, 265, 10, 'F'); doc.setTextColor(...muted); doc.setFontSize(7.5); doc.text('RINGKASAN PERJALANAN', 19, 100); doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text(`${totalUnits(booking.items)} unit`, 19, 104); doc.text(`${totalCapacity(data, booking.items)} kursi`, 78, 104); doc.text(`${rentalDays(booking.start, booking.end)} hari rental`, 137, 104); doc.text(`Status pembayaran: ${paymentStatus(data, { ...booking, total })}`, 274, 104, { align: 'right' });
  const tableEnd = table(doc, ['ARMADA', 'UNIT', 'LAYANAN', 'KAPASITAS', 'ESTIMASI'], booking.items.map(item => { const fleet = data.fleet.find(f => f.id === item.fleetId); return [fleet?.name || item.fleetId, `${item.quantity} unit`, item.mode === 'driver' ? 'Dengan supir' : 'Lepas kunci', `${fleet?.capacity || 0} kursi / unit`, money(estimate(data, [item], booking.start, booking.end))]; }), 112);
  const x = 192; let y = Math.max(151, tableEnd + 16); const totalLine = (label: string, value: string, strong = false) => { doc.setFont('helvetica', strong ? 'bold' : 'normal'); doc.setFontSize(strong ? 11 : 8.5); doc.setTextColor(...(strong ? ink : muted)); doc.text(label, x, y); doc.setTextColor(...ink); doc.text(value, 281, y, { align: 'right' }); y += strong ? 9 : 6.5; };
  totalLine('Subtotal', money(booking.total)); if (discount) totalLine('Diskon dokumen', `-${money(discount)}`); y += 3; doc.setDrawColor(...rule); doc.line(x, y - 4, 281, y - 4); y += 3; totalLine('TOTAL', money(total), true); y += 3; totalLine('Sudah dibayar', money(paid)); totalLine('Sisa pembayaran', money(Math.max(0, total - paid)), true);
  doc.setTextColor(...muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(document?.notes || 'Tarif dasar unit. BBM, tol, parkir, dan akomodasi driver dikonfirmasi sebelum perjalanan.', 16, 178, { maxWidth: 155 }); footer(doc); doc.save(`${document?.number.replace(/\//g, '-') || `${type}-${booking.code}`}.pdf`);
}

export function downloadReportPDF(title: string, headers: string[], rows: string[][], subtitle = '') { const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }); header(doc, title, subtitle || `${rows.length} data`); doc.setTextColor(...muted); doc.setFontSize(8); doc.text(`${rows.length} data ditampilkan`, 16, 42); table(doc, headers, rows, 48); footer(doc); doc.save(`NusaRide-${title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`); }
export function bookingReportRows(data: DemoData, bookings: Booking[]) { return bookings.map(booking => [booking.code, booking.name, prettyDate(booking.start), `${booking.pickup} - ${booking.destination}`, booking.status, money(booking.total), money(paidAmount(data, booking.id)), money(booking.total - vendorCost(data, booking))]); }
