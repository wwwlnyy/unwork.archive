import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { ScreenHeader } from "../../components/ScreenHeader";
import { SearchBar } from "../../components/SearchBar";
import { Sidebar } from "../../components/Sidebar";
import { AppText } from "../../components/ui/AppText";
import { Screen } from "../../components/ui/Screen";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../hooks/useSearch";
import { getStats } from "../../lib/api/contentClient";
import { mockUser } from "../../mocks/user";
import { colors } from "../../styles/colors";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { accessToken, displayName, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);
  const { runSearch, isSearching } = useSearch();

  const openSidebar = () => {
    setIsSidebarOpen(true);
    if (accessToken) {
      // 사이드바에 보이는 스크랩 수는 부가 정보라 실패해도 조용히 이전 값을 유지한다.
      getStats(accessToken)
        .then((stats) => setScrapCount(stats.total))
        .catch(() => {});
    }
  };

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching) {
      return;
    }

    const result = await runSearch(trimmed);
    if (!result) {
      return;
    }

    if (result.mode === "none") {
      navigation.navigate("SearchEmpty", { query: trimmed });
    } else if (result.mode === "informational") {
      navigation.navigate("SearchResultInfo", { query: trimmed, result });
    } else if (result.mode === "experiential") {
      navigation.navigate("SearchResultExperience", { query: trimmed, result });
    } else if (result.mode === "browse") {
      navigation.navigate("SearchResultBrowse", { query: trimmed, result });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <Screen>
      <ScreenHeader onMenuPress={openSidebar} />

      <AppText weight="bold" size="xl" style={styles.headline}>
        저장한 정보를,{"\n"}다시 찾는 곳.
      </AppText>
      <AppText
        weight="medium"
        size="sm"
        color={colors.textFaint}
        style={styles.subline}
      >
        정리하지 않아도, 필요한 순간 과거의 스크랩을 다시 활용합니다.
      </AppText>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSubmit}
      />
      {isSearching && (
        <ActivityIndicator style={styles.searchSpinner} color={colors.text} />
      )}

      <Sidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={displayName ?? mockUser.name}
        scrapCount={scrapCount}
        onScrapListPress={() => navigation.navigate("MyScraps")}
        onPlanChangePress={() => navigation.navigate("Pay")}
        onLogoutPress={handleLogout}
        // TODO: 공지사항/고객센터 화면 미구현
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: {
    marginTop: 117,
    lineHeight: 34,
  },
  subline: {
    marginTop: 12,
    marginBottom: 97,
  },
  searchSpinner: {
    marginTop: 16,
  },
});
