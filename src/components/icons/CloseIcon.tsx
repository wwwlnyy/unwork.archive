import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function CloseIcon({ size = 31, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 31 31" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.45831 21.9585L21.9583 6.4585L23.3283 7.82852L7.82833 23.3285L6.45831 21.9585Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.82833 6.4585L23.3283 21.9585L21.9583 23.3285L6.45831 7.82852L7.82833 6.4585Z"
        fill={color}
      />
    </Svg>
  );
}
