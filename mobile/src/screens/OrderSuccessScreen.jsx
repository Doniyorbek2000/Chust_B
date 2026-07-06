import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fmtSum } from '../theme';
import { Button } from '../components/ui';

export default function OrderSuccessScreen({ route, navigation }) {
  const { orders = [] } = route.params || {};
  const total = orders.reduce((s, o) => s + o.total, 0);

  return (
    <SafeAreaView style={s.wrap}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 72 }}>🎉</Text>
        <Text style={s.title}>Buyurtma qabul qilindi!</Text>
        <Text style={s.text}>
          {orders.length > 1
            ? `${orders.length} ta do'kondan ${orders.length} ta buyurtma yaratildi.`
            : `Buyurtma raqami: #${orders[0]?.id}`}
          {'\n'}Jami: {fmtSum(total)}
        </Text>
        <Text style={[s.text, { fontSize: 13, color: colors.muted }]}>
          Sotuvchi tasdiqlagach sizga bildirishnoma keladi
        </Text>
        <View style={{ gap: 10, width: '100%', marginTop: 26 }}>
          <Button title="Buyurtmalarimni ko'rish"
            onPress={() => navigation.replace('Orders')} />
          <Button title="Xaridni davom ettirish" variant="ghost"
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
