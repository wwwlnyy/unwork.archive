import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function ArrowUpRightIcon({ size = 21, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.3028 6.24087L6.02205 15.5216L5.09397 14.5936L14.3747 5.31279L15.3028 6.24087Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1825 6.43316L14.1825 14.439L15.495 14.439L15.495 5.12066L6.17666 5.12066L6.17666 6.43316H14.1825Z"
        fill={color}
      />
    </Svg>
  );
}
