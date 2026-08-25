import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { GoogleIcon } from "../../components/icons/GoogleIcon";
import { KakaoIcon } from "../../components/icons/KakaoIcon";
import { NaverIcon } from "../../components/icons/NaverIcon";
import { AppText } from "../../components/ui/AppText";
import { Screen } from "../../components/ui/Screen";
import { useAuth } from "../../context/AuthContext";
import { signInWithGoogle } from "../../lib/auth/googleAuth";
import type { AuthProvider } from "../../lib/api/authClient";
import { colors } from "../../styles/colors";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const SNS_PROVIDERS: { id: AuthProvider; label: string }[] = [
  { id: "kakao", label: "카카오로 로그인" },
  { id: "naver", label: "네이버로 로그인" },
  { id: "google", label: "구글로 로그인" },
];

const STUB_PROVIDER_ID_PREFIX = "unwork_stub_provider_id";

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(
    null,
  );

  const resolveProviderProfile = async (
    provider: AuthProvider,
  ): Promise<{ providerId: string; displayName: string | null } | null> => {
    if (provider === "google") {
      return signInWithGoogle();
    }
    // TODO: 카카오/네이버는 아직 실제 SDK 미연동. 같은 기기에서는 같은 임시 계정으로 로그인한다.
    const storageKey = `${STUB_PROVIDER_ID_PREFIX}_${provider}`;
    const savedProviderId = await SecureStore.getItemAsync(storageKey);
    if (savedProviderId) {
      return { providerId: savedProviderId, displayName: null };
    }

    const nextProviderId = `${provider}-stub-${Math.random().toString(36).slice(2)}`;
    await SecureStore.setItemAsync(storageKey, nextProviderId);
    return { providerId: nextProviderId, displayName: null };
  };

  const handleSnsLogin = async (provider: AuthProvider) => {
    setLoadingProvider(provider);
    try {
      const profile = await resolveProviderProfile(provider);
      if (!profile) {
        // 사용자가 로그인 창을 취소한 경우
        return;
      }
      const { isNewUser } = await login(provider, profile.providerId, profile.displayName);
      console.log(`[login] provider=${provider} isNewUser=${isNewUser}`);
      navigation.replace("Home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      Alert.alert("로그인 실패", message);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <AppText weight="bold" size="xxl" style={styles.wordmark}>
        un
        <AppText weight="bold" size="xxl" color={colors.textFaint}>
          work
        </AppText>
        .archive
      </AppText>

      <AppText
        weight="medium"
        size="sm"
        color={colors.textMuted}
        style={{ textAlign: "center" }}
      >
        SNS 계정으로 로그인
      </AppText>

      <View style={styles.snsRow}>
        {SNS_PROVIDERS.map((provider) => (
          <Pressable
            key={provider.id}
            onPress={() => handleSnsLogin(provider.id)}
            disabled={loadingProvider !== null}
            accessibilityLabel={provider.label}
            style={styles.snsButton}
          >
            {loadingProvider === provider.id ? (
              <ActivityIndicator color={colors.text} />
            ) : provider.id === "kakao" ? (
              <KakaoIcon size={60} />
            ) : provider.id === "naver" ? (
              <NaverIcon size={60} />
            ) : (
              <GoogleIcon size={60} />
            )}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  wordmark: {
    alignSelf: "center",
    letterSpacing: -1.28,
    marginBottom: 101,
  },
  snsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 30,
  },
  snsButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
