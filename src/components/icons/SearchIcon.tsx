import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export function SearchIcon({ size = 24, color = '#464A4D' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 10.75C2 5.93579 5.93579 2 10.75 2C15.5642 2 19.5 5.93579 19.5 10.75C19.5 15.5642 15.5642 19.5 10.75 19.5C5.93579 19.5 2 15.5642 2 10.75ZM10.75 3.5C6.76421 3.5 3.5 6.76421 3.5 10.75C3.5 14.7358 6.76421 18 10.75 18C14.7358 18 18 14.7358 18 10.75C18 6.76421 14.7358 3.5 10.75 3.5Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.8804 15.8196L21.2804 20.2196L20.2197 21.2803L15.8197 16.8803L16.8804 15.8196Z"
        fill={color}
      />
    </Svg>
  );
}
