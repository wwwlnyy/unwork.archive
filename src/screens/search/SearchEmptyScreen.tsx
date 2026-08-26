import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet } from "react-native";

import { AppSidebar } from "../../components/AppSidebar";
import { SearchResultHeader } from "../../components/SearchResultHeader";
import { AppText } from "../../components/ui/AppText";
import { Screen } from "../../components/ui/Screen";
import { useSearch } from "../../hooks/useSearch";
import { useSidebar } from "../../hooks/useSidebar";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SearchEmpty">;

export function SearchEmptyScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params.query);
  const { runSearch, isSearching } = useSearch();
  const sidebar = useSidebar();

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching) {
      return;
    }

    const nextResult = await runSearch(trimmed);
    if (!nextResult) {
      return;
    }

    if (nextResult.mode === "none") {
      navigation.replace("SearchEmpty", { query: trimmed });
    } else if (nextResult.mode === "informational") {
      navigation.replace("SearchResultInfo", {
        query: trimmed,
        result: nextResult,
      });
    } else if (nextResult.mode === "browse") {
      navigation.replace("SearchResultBrowse", {
        query: trimmed,
        result: nextResult,
      });
    } else {
      navigation.replace("SearchResultExperience", {
        query: trimmed,
        result: nextResult,
      });
    }
  };

  return (
    <Screen paddingHorizontal={0}>
      <SearchResultHeader
        query={query}
        onQueryChange={setQuery}
        onSubmitEditing={handleSubmit}
        onMenuPress={sidebar.open}
        isSearching={isSearching}
      />

      <AppText weight="regular" size="lg" style={styles.message}>
        관련된 내용이 존재하지 않아요
      </AppText>

      <AppSidebar visible={sidebar.isOpen} onClose={sidebar.close} scrapCount={sidebar.scrapCount} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    marginTop: 8,
    marginHorizontal: 55,
  },
});
