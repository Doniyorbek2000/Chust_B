import { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { colors, radius } from '../theme';
import { Loading } from '../components/ui';

/** Katalog — kategoriyalar daraxti */
export default function CatalogScreen({ navigation }) {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    api('/categories').then((d) =>
      setSections(
        d.categories.map((c) => ({
          id: c.id,
          title: c.name,
          icon: c.icon,
          data: c.children.length ? c.children : [{ id: c.id, name: 'Barcha mahsulotlar', icon: c.icon, _all: true }],
        }))
      )
    ).catch(() => setSections([]));
  }, []);

  if (!sections) return <Loading />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={s.title}>Katalog</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderSectionHeader={({ section }) => (
          <TouchableOpacity style={s.sectionHead}
            onPress={() => navigation.navigate('ProductList', { category: section.id, title: section.title })}>
            <Text style={{ fontSize: 20 }}>{section.icon}</Text>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={{ color: colors.muted }}>→</Text>
          </TouchableOpacity>
        )}
        renderItem={({ item, section }) => (
          <TouchableOpacity style={s.row}
            onPress={() =>
              navigation.navigate('ProductList', {
                category: item.id,
                title: item._all ? section.title : item.name,
              })}>
            <Text style={s.rowText}>{item._all ? item.name : `${item.icon ? item.icon + ' ' : ''}${item.name}`}</Text>
            <Text style={{ color: colors.muted }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, padding: 16, paddingBottom: 8 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 12,
    padding: 14, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    borderWidth: 1, borderColor: colors.line, borderBottomWidth: 0,
  },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, marginHorizontal: 16,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: colors.line, borderTopWidth: 0,
  },
  rowText: { fontSize: 14.5, color: colors.ink2 },
});
