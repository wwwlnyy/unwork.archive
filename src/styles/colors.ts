// Figma get_design_context 응답 기준 (Login/Onboarding 화면)
export const colors = {
  background: '#F5F6F7',
  surface: '#FFFFFF',
  text: '#111111',
  textMuted: '#56595D',
  textFaint: '#87898C',
  border: '#AEADAD',
  accent: '#111111',
} as const;

export type ColorKey = keyof typeof colors;
