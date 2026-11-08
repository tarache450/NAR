export type ViewType = 'explore' | 'search' | 'corridors' | 'profile';

const HASH: Record<ViewType, string> = {
  explore: '#/',
  search: '#/rutas',
  corridors: '#/corredores',
  profile: '#/perfil',
};

export const hashFor = (v: ViewType) => HASH[v] || '#/';

export function viewFromHash(hash: string): ViewType {
  const found = (Object.keys(HASH) as ViewType[]).find((k) => HASH[k] === hash);
  return found ?? 'explore';
}

export const NAV_LABELS: Record<ViewType, string> = {
  explore: 'Inicio',
  search: 'Rutas',
  corridors: 'Corredores',
  profile: 'Perfil',
};
