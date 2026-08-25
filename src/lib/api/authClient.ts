const AUTH_BASE_URL = 'https://unithon.fly.dev';

export type AuthProvider = 'kakao' | 'naver' | 'google' | 'device';

export interface LoginResponse {
  user_id: string;
  access_token: string;
  is_new_user: boolean;
}

export async function login(provider: AuthProvider, providerId: string): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, provider_id: providerId }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`로그인 실패 (${response.status}): ${body}`);
  }

  return response.json();
}
