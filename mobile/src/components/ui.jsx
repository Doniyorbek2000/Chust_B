import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { colors, radius, fmtSum } from '../theme';
import { imgUrl } from '../api/client';

/* ---------- Tugma ---------- */

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        s.btn,
        isPrimary ? s.btnPrimary : s.btnGhost,
        variant === 'danger' && s.btnDanger,
        (disabled || loading) && { opacity: 0.55 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.brand} />
      ) : (
        <Text style={[s.btnText, isPrimary ? { color: '#fff' } : { color: colors.brand }, variant === 'danger' && { color: colors.danger }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/* ---------- Kiritish maydoni ---------- */

export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[s.input, error && { borderColor: colors.danger }, style]}
        {...props}
      />
      {error ? <Text style={s.errText}>{error}</Text> : null}
    </View>
  );
}

/* ---------- Narx ---------- */

export function Price({ price, oldPrice, size = 15 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
      <Text style={{ fontSize: size, fontWeight: '700', color: colors.ink }}>{fmtSum(price)}</Text>
      {oldPrice ? (
        <Text style={{ fontSize: size - 3, color: colors.muted, textDecorationLine: 'line-through' }}>
          {fmtSum(oldPrice)}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------- Reyting yulduzlari ---------- */

export function Rating({ value, count, size = 12 }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Text style={{ fontSize: size, color: colors.star }}>★</Text>
      <Text style={{ fontSize: size, color: colors.ink2, fontWeight: '600' }}>{value}</Text>
      {count != null && <Text style={{ fontSize: size, color: colors.muted }}>({count})</Text>}
    </View>
  );
}

/* ---------- Mahsulot kartasi (gridda) ---------- */

export function ProductCard({ product, onPress, onToggleFav, isFav, width }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[s.card, width ? { width } : { flex: 1 }]}>
      <View>
        <Image source={{ uri: imgUrl(product.image) }} style={s.cardImg} />
        {product.discount_percent > 0 && (
          <View style={s.saleBadge}>
            <Text style={s.saleBadgeText}>−{product.discount_percent}%</Text>
          </View>
        )}
        {onToggleFav && (
          <TouchableOpacity onPress={onToggleFav} style={s.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        <Text numberOfLines={2} style={{ fontSize: 13, color: colors.ink, minHeight: 34 }}>
          {product.name}
        </Text>
        <Rating value={product.rating} count={product.rating_count} />
        <Price price={product.price} oldPrice={product.old_price} size={14} />
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Miqdor tanlagich ---------- */

export function QtyStepper({ qty, onChange, max = 99 }) {
  return (
    <View style={s.stepper}>
      <TouchableOpacity style={s.stepBtn} onPress={() => onChange(qty - 1)} disabled={qty <= 1}>
        <Text style={[s.stepText, qty <= 1 && { color: colors.muted }]}>−</Text>
      </TouchableOpacity>
      <Text style={{ minWidth: 30, textAlign: 'center', fontWeight: '700', color: colors.ink }}>{qty}</Text>
      <TouchableOpacity style={s.stepBtn} onPress={() => onChange(qty + 1)} disabled={qty >= max}>
        <Text style={[s.stepText, qty >= max && { color: colors.muted }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Bo'sh holat ---------- */

export function Empty({ icon = '🛒', title, text, action }) {
  return (
    <View style={{ alignItems: 'center', padding: 40, gap: 8 }}>
      <Text style={{ fontSize: 52 }}>{icon}</Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{title}</Text>
      {text ? <Text style={{ color: colors.ink2, textAlign: 'center' }}>{text}</Text> : null}
      {action}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}

/* ---------- Bo'lim sarlavhasi ---------- */

export function SectionHead({ title, onMore }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{title}</Text>
      {onMore && (
        <TouchableOpacity onPress={onMore}>
          <Text style={{ color: colors.brand, fontWeight: '600' }}>Barchasi →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', paddingHorizontal: 18,
  },
  btnPrimary: { backgroundColor: colors.brand },
  btnGhost: { backgroundColor: colors.brandSoft },
  btnDanger: { backgroundColor: '#fbe5e4' },
  btnText: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink2, marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
    paddingHorizontal: 14, fontSize: 15, backgroundColor: colors.surface, color: colors.ink,
  },
  errText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.line,
  },
  cardImg: { width: '100%', aspectRatio: 1, backgroundColor: colors.bg },
  saleBadge: {
    position: 'absolute', top: 8, left: 8, backgroundColor: colors.sale,
    borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2,
  },
  saleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  favBtn: {
    position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.full, width: 30, height: 30, alignItems: 'center', justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.md, backgroundColor: colors.surface,
  },
  stepBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, color: colors.ink, fontWeight: '600' },
});
