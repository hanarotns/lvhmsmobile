import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('@/src/assets/fonts/Pretendard-Medium.otf'),
  });

  return (
    <SafeAreaProvider>
      <ApplicationProvider {...eva} theme={eva.light}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
        </GestureHandlerRootView>
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}
