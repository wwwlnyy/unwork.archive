import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SearchResultHeader } from "../../components/SearchResultHeader";
import { SourceBadge } from "../../components/SourceBadge";
import { SourceListSheet } from "../../components/SourceListSheet";
import { AppText } from "../../components/ui/AppText";
import { Screen } from "../../components/ui/Screen";
import { useSearch } from "../../hooks/useSearch";
import {
  platformLabel,
  type SearchAnswerSection,
  type SavedItem,
} from "../../lib/api/contentClient";
import { colors } from "../../styles/colors";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SearchResultInfo">;

export function SearchResultInfoScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params.query);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { result } = route.params;
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

  const sourceCounts = result.items.reduce<Record<string, number>>(
    (acc, item) => {
      const key = platformLabel(item.platform);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const sections = getDisplaySections(result.answer?.sections, result.items);

  return (
    <Screen paddingHorizontal={0}>
      <SearchResultHeader
        query={query}
        onQueryChange={setQuery}
        onSubmitEditing={handleSubmit}
        onMenuPress={() => navigation.navigate("MyScraps")}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AppText weight="medium" size="lg" style={styles.summaryTitle}>
          {result.answer?.intro ??
            `"${result.query}"에 대해 저장하신 내용을 찾았어요.`}
        </AppText>

        <View style={styles.sectionList}>
          {sections.map((section, index) => (
            <View key={`${section.title}-${index}`} style={styles.section}>
              <AppText weight="semiBold" size="base" color={colors.text}>
                {section.title}
              </AppText>
              {section.lines.map((line, lineIndex) => (
                <AppText
                  key={lineIndex}
                  weight="regular"
                  size="sm"
                  color={colors.textMuted}
                  style={styles.sectionLine}
                >
                  {"• "}
                  {line}
                </AppText>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.sourceRow}>
          {Object.entries(sourceCounts).map(([label, count]) => (
            <SourceBadge
              key={label}
              label={label}
              count={count}
              onPress={() => setSelectedSource(label)}
            />
          ))}
        </View>
      </ScrollView>

      <SourceListSheet
        visible={selectedSource !== null}
        title={selectedSource ?? ""}
        items={result.items.filter(
          (item) => platformLabel(item.platform) === selectedSource,
        )}
        onClose={() => setSelectedSource(null)}
      />
    </Screen>
  );
}

function getDisplaySections(
  sections: SearchAnswerSection[] | undefined,
  items: SavedItem[],
): SearchAnswerSection[] {
  if (sections && sections.length > 0) {
    return sections;
  }

  const entitySections = items.flatMap((item) =>
    (item.entities ?? []).map((entity) => ({
      title: entity.name,
      lines: entity.note ? [entity.note] : [],
    })),
  );
  if (entitySections.length > 0) {
    return entitySections;
  }

  return items
    .map((item) => ({
      title: item.title ?? platformLabel(item.platform),
      lines: [item.summary, ...item.key_points].filter((line): line is string =>
        Boolean(line),
      ),
    }))
    .filter((section) => section.lines.length > 0);
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  summaryTitle: {
    marginTop: 42,
    marginHorizontal: 37,
    lineHeight: 26,
  },
  sectionList: {
    marginTop: 24,
    marginHorizontal: 31,
    gap: 16,
  },
  section: {
    gap: 4,
  },
  sectionLine: {
    marginLeft: 8,
  },
  sourceRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 37,
    marginTop: 32,
  },
});
