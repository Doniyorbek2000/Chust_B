import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Button } from '../components/ui';
import { useI18n } from '../i18n';

export default function OrderSuccessScreen({ route, navigation }) {
  const { orders = [] } = route.params || {};
  const { t, fmtSum } = useI18n();
  const total = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <SafeAreaView style={s.wrap}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 72 }}>🎉</Text>
        <Text style={s.title}>{t('orderAccepted')}</Text>
        <Text style={s.text}>
          {orders.length > 1
            ? t('orderMulti', { n: orders.length })
            : t('orderNo', { id: orders[0]?.id })}
          {'\n'}{t('totalN', { n: fmtSum(total) })}
        </Text>
        <Text style={[s.text, { fontSize: 13, color: colors.muted }]}>{t('orderHint')}</Text>
        <View style={{ gap: 10, width: '100%', marginTop: 26 }}>
          <Button title={t('viewMyOrders')} onPress={() => navigation.replace('Orders')} />
          <Button title={t('continueShopping')} variant="ghost"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 14 },
  text: { color: colors.ink2, textAlign: 'center', marginTop: 10, lineHeight: 22, fontSize: 15 },
});
