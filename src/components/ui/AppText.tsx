import { Text, type TextProps } from 'react-native';

import { colors } from '../../styles/colors';
import { fontFamily, fontSize, type FontFamilyKey, type FontSizeKey } from '../../styles/typography';

type AppTextProps = TextProps & {
  weight?: FontFamilyKey;
  size?: FontSizeKey;
  color?: string;
};

export function AppText({ weight = 'regular', size = 'base', color = colors.text, style, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fontFamily[weight], fontSize: fontSize[size], color }, style]}
    />
  );
}
