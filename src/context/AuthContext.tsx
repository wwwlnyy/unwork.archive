import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, type AuthProvider } from '../lib/api/authClient';
import { setAccessToken as setAppGroupAccessToken } from '../../modules/app-group-storage';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (provider: AuthProvider, providerId: string) => Promise<{ isNewUser: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// TODO: 현재는 메모리에만 보관 — 앱 재실행 시 로그인 풀림. 추후 expo-secure-store로 영속화 필요.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ userId: null, accessToken: null });

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: async (provider, providerId) => {
        const result = await loginRequest(provider, providerId);
        setState({ userId: result.user_id, accessToken: result.access_token });
        setAppGroupAccessToken(result.access_token);
        return { isNewUser: result.is_new_user };
      },
      logout: () => {
        setState({ userId: null, accessToken: null });
        setAppGroupAccessToken(null);
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
