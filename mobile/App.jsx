import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/store/AppContext';
import { I18nProvider, useI18n } from './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';

function Gate() {
  const { locale } = useI18n();
  // Birinchi ochilishda til tanlanadi
  if (!locale) return <LanguageSelectScreen firstLaunch />;
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <Gate />
        </AppProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
