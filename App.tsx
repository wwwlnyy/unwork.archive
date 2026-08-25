import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ShareIntentProvider } from 'expo-share-intent';
import { View } from 'react-native';

import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { fontFamily } from './src/styles/typography';

export default function App() {
  const [fontsLoaded] = useFonts({
    [fontFamily.regular]: require('./assets/fonts/Pretendard-Regular.otf'),
    [fontFamily.medium]: require('./assets/fonts/Pretendard-Medium.otf'),
    [fontFamily.semiBold]: require('./assets/fonts/Pretendard-SemiBold.otf'),
    [fontFamily.bold]: require('./assets/fonts/Pretendard-Bold.otf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <ShareIntentProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </ShareIntentProvider>
  );
}
