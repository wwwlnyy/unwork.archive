import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function ChevronLeftIcon({ size = 24, color = '#464A4D' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1213 11.5303L15.591 6.06066L14.5303 5L8 11.5303L14.5303 18.0607L15.591 17L10.1213 11.5303Z"
        fill={color}
      />
    </Svg>
  );
}
