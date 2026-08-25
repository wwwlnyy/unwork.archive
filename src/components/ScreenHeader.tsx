import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './ui/AppText';
import { MenuIcon } from './icons/MenuIcon';
import { colors } from '../styles/colors';

type ScreenHeaderProps = {
  onMenuPress?: () => void;
};

export function ScreenHeader({ onMenuPress }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText weight="bold" size="xl" style={styles.wordmark}>
        un<AppText weight="bold" size="xl" color={colors.textFaint}>work</AppText>.archive
      </AppText>
      <Pressable onPress={onMenuPress} hitSlop={8} accessibilityLabel="사이드바 열기">
        <MenuIcon size={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    letterSpacing: -1.28,
  },
});
