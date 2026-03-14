/**
 * VPC – utilidades de data e turno
 */

/**
 * Retorna a data de produção atual.
 * Se for antes das 5h da manhã, a data de produção ainda é o dia anterior.
 */
export function getProductionDate() {
  const now = new Date();
  const hour = now.getHours();
  const prodDate = new Date(now);

  if (hour < 5) {
    prodDate.setDate(prodDate.getDate() - 1);
  }
  
  return prodDate.toISOString().slice(0, 10);
}

/**
 * Formata a data para rótulo de turno (ex: "14 a 15 de Março")
 */
export function formatShiftLabel(dateStr) {
  if (!dateStr) return '—';
  
  // Criar data base (meio-dia para evitar problemas de fuso)
  const d1 = new Date(dateStr + 'T12:00:00');
  const d2 = new Date(d1);
  d2.setDate(d2.getDate() + 1);
  
  const day1 = d1.getDate().toString().padStart(2, '0');
  const day2 = d2.getDate().toString().padStart(2, '0');
  const month = d1.toLocaleDateString('pt-BR', { month: 'long' });
  const year = d1.getFullYear();
  
  return `${day1} a ${day2} de ${month} ${year}`;
}
