import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, logout as logoutRequest, type LoginParams } from '../lib/api/authClient';
import { setAccessToken as setAppGroupAccessToken } from '../../modules/app-group-storage';

const STORAGE_KEY_USER_ID = 'unwork_user_id';
const STORAGE_KEY_ACCESS_TOKEN = 'unwork_access_token';
const STORAGE_KEY_DISPLAY_NAME = 'unwork_display_name';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  displayName: string | null;
}

interface AuthContextValue extends AuthState {
  isRestoring: boolean;
  login: (params: LoginParams, displayName?: string | null) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(userId: string, accessToken: string, displayName?: string | null) {
  await SecureStore.setItemAsync(STORAGE_KEY_USER_ID, userId);
  await SecureStore.setItemAsync(STORAGE_KEY_ACCESS_TOKEN, accessToken);
  if (displayName) {
    await SecureStore.setItemAsync(STORAGE_KEY_DISPLAY_NAME, displayName);
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY_DISPLAY_NAME);
  }
}

function clearPersistedSession() {
  SecureStore.deleteItemAsync(STORAGE_KEY_USER_ID).catch(() => {});
  SecureStore.deleteItemAsync(STORAGE_KEY_ACCESS_TOKEN).catch(() => {});
  SecureStore.deleteItemAsync(STORAGE_KEY_DISPLAY_NAME).catch(() => {});
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ userId: null, accessToken: null, displayName: null });
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [userId, accessToken, displayName] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEY_USER_ID),
          SecureStore.getItemAsync(STORAGE_KEY_ACCESS_TOKEN),
          SecureStore.getItemAsync(STORAGE_KEY_DISPLAY_NAME),
        ]);
        if (userId && accessToken) {
          setState({ userId, accessToken, displayName });
          setAppGroupAccessToken(accessToken);
        }
      } finally {
        setIsRestoring(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isRestoring,
      login: async (params, displayName) => {
        const result = await loginRequest(params);
        setState({ userId: result.user_id, accessToken: result.access_token, displayName: displayName ?? null });
        setAppGroupAccessToken(result.access_token);
        await persistSession(result.user_id, result.access_token, displayName);
        return { isNewUser: result.is_new_user };
      },
      logout: async () => {
        if (state.accessToken) {
          try {
            await logoutRequest(state.accessToken);
          } catch (error) {
            console.warn('[logout] API 호출 실패. 로컬 세션은 삭제합니다.', error);
          }
        }
        setState({ userId: null, accessToken: null, displayName: null });
        setAppGroupAccessToken(null);
        clearPersistedSession();
      },
    }),
    [state, isRestoring],
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
