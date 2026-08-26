const AUTH_BASE_URL = 'https://unithonapi.fly.dev';

export type AuthProvider = 'kakao' | 'naver' | 'google' | 'device';

export type LoginParams =
  | { provider: 'google'; socialToken: string }
  | { provider: Exclude<AuthProvider, 'google'>; providerId: string };

export interface LoginResponse {
  user_id: string;
  access_token: string;
  is_new_user: boolean;
}

export interface LogoutResponse {
  message: string;
}

export async function login(params: LoginParams): Promise<LoginResponse> {
  // 백엔드는 provider로 "device" / "google"만 허용한다. 카카오·네이버는 아직 스텁이라
  // 기기 고유 임시 ID를 device 로그인으로 보낸다.
  const body =
    params.provider === 'google'
      ? { provider: 'google', social_token: params.socialToken }
      : { provider: 'device', provider_id: params.providerId };

  const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`로그인 실패 (${response.status}): ${responseBody}`);
  }

  return response.json();
}

export async function logout(accessToken: string): Promise<LogoutResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`로그아웃 실패 (${response.status}): ${body}`);
  }

  return response.json();
}
