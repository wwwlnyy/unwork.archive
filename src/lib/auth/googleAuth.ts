import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Google Cloud Console(unithon archive 프로젝트)에서 발급받은 OAuth 클라이언트 ID.
// Android 클라이언트는 패키지명+SHA-1로 콘솔에 등록만 해두면 되고 코드에는 필요 없음.
const GOOGLE_WEB_CLIENT_ID = '325265117449-vjm2gqosl6gpflu3ed9fi9qgks10p4mc.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '325265117449-9omb1jnqqguk6rk28pt1rai6msonnckv.apps.googleusercontent.com';

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) {
    return;
  }
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
  isConfigured = true;
}

export async function signInWithGoogle(): Promise<{ providerId: string; displayName: string | null } | null> {
  ensureConfigured();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') {
    return null;
  }

  return {
    providerId: response.data.user.id,
    displayName: response.data.user.name ?? null,
  };
}
