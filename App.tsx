import { StatusBar } from 'expo-status-bar';
import { ShareIntentProvider } from 'expo-share-intent';

import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <ShareIntentProvider>
      <HomeScreen />
      <StatusBar style="auto" />
    </ShareIntentProvider>
  );
}
