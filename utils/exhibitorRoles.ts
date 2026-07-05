// Exhibitor IDs are prefixed by role (e.g. "spk_001", "biz_014") — this maps
// prefixes to display labels, shared by the participant card, the event detail
// page's grouped exhibitor sections, and the Participantes tab's role filter.

export function idPrefix(id: string): string {
  return id.match(/^[a-zA-Z]+/)?.[0]?.toLowerCase() ?? '';
}

export const ENTITY_PREFIXES = new Set(['biz', 'org']);
export const PERSON_PREFIXES = new Set(['spk', 'cc', 'ch', 'mc', 'mi']);

// Singular — for a single exhibitor's role badge (e.g. ExhibitorCard).
export const ROLE_LABEL: Record<string, string> = {
  mi: 'Mesa Inaugural',
  mc: 'Mesa Clausura',
  ch: 'Comité de Honor',
  cc: 'Comité Científico',
  spk: 'Ponente',
  biz: 'Colaborador',
  org: 'Organizador',
};

// Plural/group — for section headers grouping multiple exhibitors (e.g. event detail page).
export const ROLE_GROUP_LABEL: Record<string, string> = {
  mi: 'Mesa Inaugural',
  mc: 'Mesa Clausura',
  ch: 'Comité de Honor',
  cc: 'Comité Científico',
  spk: 'Ponentes',
  biz: 'Colaboradores',
  org: 'Organizadores',
};

export const ROLE_ORDER = ['mi', 'mc', 'ch', 'cc', 'spk', 'biz', 'org'];
