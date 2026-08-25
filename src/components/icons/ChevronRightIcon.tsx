import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function ChevronRightIcon({ size = 24, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.8787 11.5303L8.40901 6.06066L9.46967 5L16 11.5303L9.46967 18.0607L8.40901 17L13.8787 11.5303Z"
        fill={color}
      />
    </Svg>
  );
}
