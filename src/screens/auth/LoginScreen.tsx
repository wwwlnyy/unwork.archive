import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "../../components/ui/AppText";
import { useAuth } from "../../context/AuthContext";
import type { AuthProvider } from "../../lib/api/authClient";
import { colors } from "../../styles/colors";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const SNS_PROVIDERS: { id: AuthProvider; label: string; source: number }[] = [
  {
    id: "kakao",
    label: "카카오로 로그인",
    source: require("../../../assets/images/sns/kakao.png"),
  },
  {
    id: "naver",
    label: "네이버로 로그인",
    source: require("../../../assets/images/sns/naver.png"),
  },
  {
    id: "google",
    label: "구글로 로그인",
    source: require("../../../assets/images/sns/google.png"),
  },
];

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(
    null,
  );

  const handleSnsLogin = async (provider: AuthProvider) => {
    setLoadingProvider(provider);
    try {
      // TODO: 실제 SNS SDK 연동 전까지는 임시 provider_id로 API 동작만 검증
      const stubProviderId = `${provider}-stub-${Date.now()}`;
      const { isNewUser } = await login(provider, stubProviderId);
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
    <View style={styles.container}>
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
            ) : (
              <Image
                source={provider.source}
                style={styles.snsIcon}
                resizeMode="contain"
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 183,
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
  snsIcon: {
    width: 60,
    height: 60,
  },
});
