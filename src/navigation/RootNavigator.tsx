import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { HomeScreen } from '../screens/home/HomeScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { PlanSelectScreen } from '../screens/pay/PlanSelectScreen';
import { MyScrapsScreen } from '../screens/scrap/MyScrapsScreen';
import { SearchEmptyScreen } from '../screens/search/SearchEmptyScreen';
import { SearchResultBrowseScreen } from '../screens/search/SearchResultBrowseScreen';
import { SearchResultExperienceScreen } from '../screens/search/SearchResultExperienceScreen';
import { SearchResultInfoScreen } from '../screens/search/SearchResultInfoScreen';
import type { SearchResponse } from '../lib/api/contentClient';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  SearchResultInfo: { query: string; result: SearchResponse };
  SearchResultExperience: { query: string; result: SearchResponse };
  SearchResultBrowse: { query: string; result: SearchResponse };
  SearchEmpty: { query: string };
  MyScraps: undefined;
  Pay: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isRestoring, accessToken } = useAuth();

  if (isRestoring) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={accessToken ? 'Home' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SearchResultInfo" component={SearchResultInfoScreen} />
        <Stack.Screen name="SearchResultExperience" component={SearchResultExperienceScreen} />
        <Stack.Screen name="SearchResultBrowse" component={SearchResultBrowseScreen} />
        <Stack.Screen name="SearchEmpty" component={SearchEmptyScreen} />
        <Stack.Screen name="MyScraps" component={MyScrapsScreen} />
        <Stack.Screen name="Pay" component={PlanSelectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
