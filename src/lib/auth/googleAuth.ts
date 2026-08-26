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

export async function signInWithGoogle(): Promise<{ socialToken: string; displayName: string | null } | null> {
  ensureConfigured();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') {
    return null;
  }

  // 서버가 provider_id가 아니라 구글 Access Token(social_token)으로 계정을 식별하므로
  // 기기와 무관하게 항상 같은 구글 계정으로 로그인된다.
  const { accessToken } = await GoogleSignin.getTokens();

  return {
    socialToken: accessToken,
    displayName: response.data.user.name ?? null,
  };
}
