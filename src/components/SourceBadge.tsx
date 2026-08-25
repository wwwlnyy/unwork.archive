import { StyleSheet, View } from 'react-native';

import { AppText } from './ui/AppText';
import { colors } from '../styles/colors';

type SourceBadgeProps = {
  label: string;
  count: number;
};

export function SourceBadge({ label, count }: SourceBadgeProps) {
  return (
    <View style={styles.container}>
      <AppText weight="regular" size="xs" color={colors.text}>
        {label}
      </AppText>
      <AppText weight="regular" size="xs" color={colors.text}>
        {count}개
      </AppText>
    </View>
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
