import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './ui/AppText';
import { colors } from '../styles/colors';

type SourceBadgeProps = {
  label: string;
  count: number;
  onPress?: () => void;
};

export function SourceBadge({ label, count, onPress }: SourceBadgeProps) {
  return (
    <Pressable style={styles.container} onPress={onPress} disabled={!onPress}>
      <AppText weight="regular" size="xs" color={colors.text}>
        {label}
      </AppText>
      <AppText weight="regular" size="xs" color={colors.text}>
        {count}개
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
