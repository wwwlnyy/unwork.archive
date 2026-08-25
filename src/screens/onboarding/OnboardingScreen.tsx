import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const SPLASH_DURATION_MS = 1200;

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen style={styles.container} topSpacing={0}>
      <AppText weight="bold" size="xxl" style={styles.wordmark}>
        un<AppText weight="bold" size="xxl" color={colors.textFaint}>work</AppText>.archive
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    letterSpacing: -1.28,
  },
});
