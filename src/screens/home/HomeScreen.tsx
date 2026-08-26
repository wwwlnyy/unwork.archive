import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet } from "react-native";

import { AppSidebar } from "../../components/AppSidebar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SearchBar } from "../../components/SearchBar";
import { AppText } from "../../components/ui/AppText";
import { Screen } from "../../components/ui/Screen";
import { useSearch } from "../../hooks/useSearch";
import { useSidebar } from "../../hooks/useSidebar";
import { colors } from "../../styles/colors";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const sidebar = useSidebar();
  const { runSearch, isSearching } = useSearch();

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

  return (
    <Screen>
      <ScreenHeader onMenuPress={sidebar.open} />

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
        isSearching={isSearching}
      />

      <AppSidebar visible={sidebar.isOpen} onClose={sidebar.close} scrapCount={sidebar.scrapCount} />
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
});
