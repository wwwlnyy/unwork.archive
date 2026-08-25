import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../styles/colors';

const HORIZONTAL_PADDING = 16;
const TOP_SPACING = 16;

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  paddingHorizontal?: number;
  topSpacing?: number;
};

export function Screen({
  children,
  style,
  paddingHorizontal = HORIZONTAL_PADDING,
  topSpacing = TOP_SPACING,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingHorizontal, paddingTop: insets.top + topSpacing }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
