import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { MyScrapsScreen } from '../screens/scrap/MyScrapsScreen';
import { SearchEmptyScreen } from '../screens/search/SearchEmptyScreen';
import { SearchResultExperienceScreen } from '../screens/search/SearchResultExperienceScreen';
import { SearchResultInfoScreen } from '../screens/search/SearchResultInfoScreen';
import type { SearchResponse } from '../lib/api/contentClient';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  SearchResultInfo: { query: string; result: SearchResponse };
  SearchResultExperience: { query: string; result: SearchResponse };
  SearchEmpty: { query: string };
  MyScraps: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SearchResultInfo" component={SearchResultInfoScreen} />
        <Stack.Screen name="SearchResultExperience" component={SearchResultExperienceScreen} />
        <Stack.Screen name="SearchEmpty" component={SearchEmptyScreen} />
        <Stack.Screen name="MyScraps" component={MyScrapsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
