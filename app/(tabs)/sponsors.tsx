import React, { useMemo, useState } from 'react';
import {
  Platform,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ExhibitorCard } from '@/components/ExhibitorCard';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useData } from '@/context/data-context';
import { Exhibitor, ExhibitorType } from '@/types';

type TypeFilter = ExhibitorType | 'all';

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'speaker',  label: 'Ponentes' },
  { key: 'business', label: 'Colaboradores' },
];

const TIER_ORDER: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

function sortExhibitors(list: Exhibitor[]): Exhibitor[] {
  return [...list].sort((a, b) => {
    if (a.exhibitor_type === 'business' && b.exhibitor_type === 'speaker') return -1;
    if (a.exhibitor_type === 'speaker' && b.exhibitor_type === 'business') return 1;
    if (a.exhibitor_type === 'business' && b.exhibitor_type === 'business') {
      const ta = a.sponsor_tier ? TIER_ORDER[a.sponsor_tier] : 99;
      const tb = b.sponsor_tier ? TIER_ORDER[b.sponsor_tier] : 99;
      if (ta !== tb) return ta - tb;
    }
    return a.name.localeCompare(b.name);
  });
}

export default function SponsorsScreen() {
  const { exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const filteredExhibitors = useMemo(() => {
    let result = [...exhibitors];
    if (typeFilter !== 'all') result = result.filter((e) => e.exhibitor_type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }
    return sortExhibitors(result);
  }, [exhibitors, search, typeFilter]);

  const listHeader = (
    <View>
      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          nativeID="sponsors-search"
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar patrocinadores y ponentes"
          placeholderTextColor={colors.icon}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {/* Type filter */}
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map(({ key, label }) => {
          const active = typeFilter === key;
          return (
            <Pressable
              key={key}
              style={[styles.chip, { backgroundColor: active ? BACColors.navyDark : colors.card, borderColor: active ? BACColors.navyDark : colors.border }]}
              onPress={() => setTypeFilter(key)}>
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
    gap: 8,
  },
  filterDivider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: BACColors.lightBlue,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingTop: 4, paddingBottom: Platform.select({ web: 32, default: 48 }) },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
