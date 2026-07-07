import { useEffect, useState } from 'react';
import { Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { colors, radius } from '../theme';
import { Loading } from '../components/ui';
import { useI18n } from '../i18n';

/** Katalog — kategoriyalar daraxti */
export default function CatalogScreen({ navigation }) {
  const { t, lname } = useI18n();
  const [cats, setCats] = useState(null);

  useEffect(() => {
    api('/categories').then((d) => setCats(d.categories)).catch(() => setCats([]));
  }, []);

  if (!cats) return <Loading />;

  const sections = cats.map((c) => ({
    id: c.id,
    cat: c,
    title: lname(c),
    icon: c.icon,
    data: c.children.length ? c.children : [{ id: c.id, _all: true }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={s.title}>{t('catalogTitle')}</Text>
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
                title: item._all ? section.title : lname(item),
              })}>
            <Text style={s.rowText}>
              {item._all ? t('allProducts') : `${item.icon ? item.icon + ' ' : ''}${lname(item)}`}
            </Text>
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
