import React, { useMemo, useState } from 'react';
import {
  Platform,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ExhibitorCard } from '@/components/ExhibitorCard';
import { FilterDropdown, FilterOption } from '@/components/FilterDropdown';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useData } from '@/context/data-context';
import { Exhibitor } from '@/types';

// ─── Filter definitions ──────────────────────────────────────────────────────

type SuperCategory = 'all' | 'person' | 'entity';
type RoleFilter    = 'all' | 'spk' | 'cc' | 'ch' | 'mc' | 'mi' | 'biz' | 'org';

const SUPER_OPTIONS: FilterOption[] = [
  { key: 'person', label: 'Personas',  iconName: 'person'   },
  { key: 'entity', label: 'Entidades', iconName: 'business' },
];

const PERSON_ROLE_OPTIONS: FilterOption[] = [
  { key: 'spk', label: 'Ponentes',          iconName: 'mic'          },
  { key: 'cc',  label: 'Comité Científico', iconName: 'science'      },
  { key: 'ch',  label: 'Comité de Honor',   iconName: 'star'         },
  { key: 'mc',  label: 'Mesa Clausura',     iconName: 'meeting-room' },
  { key: 'mi',  label: 'Mesa Inaugural',    iconName: 'flag'         },
];

const ENTITY_ROLE_OPTIONS: FilterOption[] = [
  { key: 'biz', label: 'Colaboradores', iconName: 'handshake' },
  { key: 'org', label: 'Organizadores', iconName: 'groups'    },
];

const ALL_ROLE_OPTIONS: FilterOption[] = [...PERSON_ROLE_OPTIONS, ...ENTITY_ROLE_OPTIONS];

const PERSON_PREFIXES = new Set(['spk', 'cc', 'ch', 'mc', 'mi']);
const ENTITY_PREFIXES = new Set(['biz', 'org']);

function idPrefix(id: string): string {
  return id.match(/^[a-zA-Z]+/)?.[0]?.toLowerCase() ?? '';
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

function sortExhibitors(list: Exhibitor[]): Exhibitor[] {
  return [...list].sort((a, b) => {
    const pa = ENTITY_PREFIXES.has(idPrefix(a.id)) ? 0 : 1;
    const pb = ENTITY_PREFIXES.has(idPrefix(b.id)) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    if (pa === 0) {
      const ta = a.sponsor_tier ? TIER_ORDER[a.sponsor_tier] : 99;
      const tb = b.sponsor_tier ? TIER_ORDER[b.sponsor_tier] : 99;
      if (ta !== tb) return ta - tb;
    }
    return a.name.localeCompare(b.name);
  });
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SponsorsScreen() {
  const { exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [search, setSearch]               = useState('');
  const [superCategory, setSuperCategory] = useState<SuperCategory>('all');
  const [roleFilter, setRoleFilter]       = useState<RoleFilter>('all');

  const handleSuperChange = (key: string) => {
    setSuperCategory(key as SuperCategory);
    setRoleFilter('all');
  };

  const roleOptions: FilterOption[] =
    superCategory === 'person' ? PERSON_ROLE_OPTIONS :
    superCategory === 'entity' ? ENTITY_ROLE_OPTIONS :
    ALL_ROLE_OPTIONS;

  const filteredExhibitors = useMemo(() => {
    let result = [...exhibitors];

    if (superCategory === 'person') {
      result = result.filter((e) => PERSON_PREFIXES.has(idPrefix(e.id)));
    } else if (superCategory === 'entity') {
      result = result.filter((e) => ENTITY_PREFIXES.has(idPrefix(e.id)));
    }

    if (roleFilter !== 'all') {
      result = result.filter((e) => idPrefix(e.id) === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    return sortExhibitors(result);
  }, [exhibitors, search, superCategory, roleFilter]);

  const listHeader = (
    <View>
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          nativeID="sponsors-search"
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar participantes"
          placeholderTextColor={colors.icon}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      <FilterDropdown
        value={superCategory}
        options={SUPER_OPTIONS}
        onChange={handleSuperChange}
        allLabel="Todas las categorías"
      />

      <FilterDropdown
        value={roleFilter}
        options={roleOptions}
        onChange={(k) => setRoleFilter(k as RoleFilter)}
        allLabel="Todos los roles"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredExhibitors}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => <ExhibitorCard exhibitor={item} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.icon }]}>Sin resultados.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    height: 44,
  },
  searchInput: { fontSize: 15, textAlignVertical: 'center', paddingVertical: 0 },
  list: { flex: 1 },
  listContent: { paddingTop: 4, paddingBottom: Platform.select({ web: 32, default: 48 }) },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
