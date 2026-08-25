import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { SearchResultHeader } from "../../components/SearchResultHeader";
import { AppText } from "../../components/ui/AppText";
import { useSearch } from "../../hooks/useSearch";
import { colors } from "../../styles/colors";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SearchEmpty">;

export function SearchEmptyScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params.query);
  const { runSearch, isSearching } = useSearch();

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
    } else {
      navigation.replace("SearchResultExperience", {
        query: trimmed,
        result: nextResult,
      });
    }
  };

  return (
    <View style={styles.container}>
      <SearchResultHeader
        query={query}
        onQueryChange={setQuery}
        onSubmitEditing={handleSubmit}
        onMenuPress={() => navigation.navigate("MyScraps")}
      />

      <AppText weight="regular" size="lg" style={styles.message}>
        관련된 내용이 존재하지 않아요
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  message: {
    marginTop: 8,
    marginHorizontal: 55,
  },
});
