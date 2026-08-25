import Svg, { Path, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
};

export function KakaoIcon({ size = 60 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Rect width="60" height="60" rx="30" fill="#FEE500" />
      <Path
        d="M30 17C21.9 17 15 22.35 15 29.05C15 33.34 17.86 37.09 22.16 39.24C21.82 40.46 20.61 44.75 20.55 45.1C20.55 45.1 20.53 45.28 20.65 45.36C20.76 45.44 20.9 45.39 20.9 45.39C21.38 45.32 26.3 41.95 27.1 41.39C28.03 41.53 28.99 41.6 30 41.6C38.1 41.6 45 36.25 45 29.55C45 22.85 38.1 17 30 17Z"
        fill="#3C1E1E"
      />
    </Svg>
  );
}
