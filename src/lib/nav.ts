export type TabType = 'explore' | 'corridors' | 'search' | 'publish' | 'telemetry' | 'profile';

export type ViewType = Exclude<TabType, 'publish'>;

const HASH: Record<ViewType, string> = {
  explore: '#/',
  search: '#/viajes',
  corridors: '#/corredores',
  telemetry: '#/mi-viaje',
  profile: '#/perfil',
};

export const hashFor = (v: ViewType) => HASH[v];

export function viewFromHash(hash: string): ViewType {
  const found = (Object.keys(HASH) as ViewType[]).find((k) => HASH[k] === hash);
  return found ?? 'explore';
}

export const NAV_LABELS: Record<ViewType, string> = {
  explore: 'Inicio',
  search: 'Buscar viaje',
  corridors: 'Corredores',
  telemetry: 'Mi viaje',
  profile: 'Perfil',
};
