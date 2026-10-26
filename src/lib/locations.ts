import type { Waypoint } from '../types';

const metroSanSalvador = new Set(['san salvador', 'antiguo cuscatlan', 'santa tecla']);

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function locationMatches(query: string, points: Waypoint[]) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const terms = normalizedQuery.split(/[\/,()]+/).map(term => term.trim()).filter(term => term.length > 1);
  const normalizedPoints = points.map(point => normalize(`${point.name} ${point.city} ${point.address}`));

  if (terms.includes('san salvador') && points.some(point => metroSanSalvador.has(normalize(point.city)))) return true;
  return terms.some(term => normalizedPoints.some(point => point.includes(term)));
}
