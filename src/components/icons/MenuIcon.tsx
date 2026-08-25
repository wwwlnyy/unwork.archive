import Svg, { Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function MenuIcon({ size = 24, color = '#464A4D' }: IconProps) {
  const height = size * (13.5 / 18);

  return (
    <Svg width={size} height={height} viewBox="0 0 18 13.5" fill="none">
      <Rect x="0" y="0" width="18" height="1.5" fill={color} />
      <Rect x="0" y="6" width="18" height="1.5" fill={color} />
      <Rect x="0" y="12" width="18" height="1.5" fill={color} />
    </Svg>
  );
}
