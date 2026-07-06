import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';
import { Loading } from '../components/ui';

import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import CartScreen from '../screens/CartScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AddressesScreen from '../screens/AddressesScreen';
import AddressFormScreen from '../screens/AddressFormScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabIcon({ icon, focused, badge }) {
  return (
    <View>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{icon}</Text>
      {badge > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -10, backgroundColor: colors.sale,
          borderRadius: 9, minWidth: 17, height: 17, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  const { cartCount } = useApp();
  const { t } = useI18n();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 58, paddingBottom: 6, paddingTop: 4 },
      }}>
      <Tabs.Screen name="Home" component={HomeScreen}
        options={{ title: t('tabHome'), tabBarIcon: (p) => <TabIcon icon="🏠" {...p} /> }} />
      <Tabs.Screen name="Catalog" component={CatalogScreen}
        options={{ title: t('tabCatalog'), tabBarIcon: (p) => <TabIcon icon="🗂️" {...p} /> }} />
      <Tabs.Screen name="Cart" component={CartScreen}
        options={{ title: t('tabCart'), tabBarIcon: (p) => <TabIcon icon="🛒" badge={cartCount} {...p} /> }} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen}
        options={{ title: t('tabFavorites'), tabBarIcon: (p) => <TabIcon icon="❤️" {...p} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen}
        options={{ title: t('tabProfile'), tabBarIcon: (p) => <TabIcon icon="👤" {...p} /> }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { booting } = useApp();
  const { t } = useI18n();
  if (booting) return <Loading />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
      }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductList" component={ProductListScreen}
        options={({ route }) => ({ title: route.params?.title || t('productsTitle') })} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Search" component={SearchScreen}
        options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: t('reviews') }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('checkoutTitle') }} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: t('myOrders') }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen}
        options={({ route }) => ({ title: t('orderTitle', { id: route.params.id }) })} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: t('myAddresses') }} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen}
        options={({ route }) => ({ title: route.params?.address ? t('editAddress') : t('newAddress') })} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t('notificationsTitle') }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('editProfile') }} />
      <Stack.Screen name="Language" component={LanguageSelectScreen} options={{ title: t('language') }} />
      <Stack.Screen name="Login" component={LoginScreen}
        options={{ title: t('login'), presentation: 'modal' }} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ title: t('register'), presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
