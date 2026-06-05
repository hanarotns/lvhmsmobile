import * as eva from '@eva-design/eva';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ApplicationProvider } from '@ui-kitten/components';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toast.config';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig} bottomOffset={insets.bottom + 20} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('@/src/assets/fonts/Pretendard-Medium.otf'),
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApplicationProvider {...eva} theme={eva.light}>
          <BottomSheetModalProvider>
            <AppContent />
          </BottomSheetModalProvider>
        </ApplicationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
