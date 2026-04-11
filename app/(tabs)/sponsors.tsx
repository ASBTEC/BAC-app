import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ExhibitorCard } from '@/components/ExhibitorCard';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Exhibitor, ExhibitorType, SponsorTier } from '@/types';
import allExhibitors from '@/data/exhibitors.json';

const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

type TypeFilter = ExhibitorType | 'all';
type TierFilter = SponsorTier | 'all';

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'speaker',  label: 'Ponentes' },
  { key: 'business', label: 'Empresas' },
];

const TIER_FILTERS: { key: TierFilter; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'platinum', label: 'Platino' },
  { key: 'gold',     label: 'Oro' },
  { key: 'silver',   label: 'Plata' },
  { key: 'bronze',   label: 'Bronce' },
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
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');

  const showTierFilter = typeFilter === 'business' || typeFilter === 'all';

  const filteredExhibitors = useMemo(() => {
    let result = [...EXHIBITORS];

    if (typeFilter !== 'all') {
      result = result.filter((e) => e.exhibitor_type === typeFilter);
    }

    if (showTierFilter && tierFilter !== 'all') {
      result = result.filter((e) => e.sponsor_tier === tierFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    return sortExhibitors(result);
  }, [search, typeFilter, tierFilter, showTierFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          nativeID="sponsors-search"
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar patrocinadores y ponentes…"
          placeholderTextColor={colors.icon}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {/* Type filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {TYPE_FILTERS.map(({ key, label }) => {
          const active = typeFilter === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.chip,
                { backgroundColor: active ? BACColors.navyDark : colors.card, borderColor: active ? BACColors.navyDark : colors.border },
              ]}
              onPress={() => { setTypeFilter(key); setTierFilter('all'); }}>
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tier filter (shown when viewing companies) */}
      {showTierFilter && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={[styles.filterScroll, styles.tierScroll]}>
          {TIER_FILTERS.map(({ key, label }) => {
            const active = tierFilter === key;
            return (
              <Pressable
                key={key}
                style={[
                  styles.chip,
                  { backgroundColor: active ? BACColors.amber : colors.card, borderColor: active ? BACColors.amber : colors.border },
                ]}
                onPress={() => setTierFilter(key)}>
                <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <FlatList
        data={filteredExhibitors}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
    paddingVertical: 10,
  },
  searchInput: { fontSize: 15 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, alignItems: 'center' },
  tierScroll: { marginTop: 4 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingTop: 4, paddingBottom: 32 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
