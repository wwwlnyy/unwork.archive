import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SearchResultHeader } from '../../components/SearchResultHeader';
import { SourceBadge } from '../../components/SourceBadge';
import { AppText } from '../../components/ui/AppText';
import { useSearch } from '../../hooks/useSearch';
import { platformLabel } from '../../lib/api/contentClient';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultInfo'>;

export function SearchResultInfoScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params.query);
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

    if (nextResult.mode === 'none') {
      navigation.replace('SearchEmpty', { query: trimmed });
    } else if (nextResult.mode === 'informational') {
      navigation.replace('SearchResultInfo', { query: trimmed, result: nextResult });
    } else {
      navigation.replace('SearchResultExperience', { query: trimmed, result: nextResult });
    }
  };

  const sourceCounts = result.items.reduce<Record<string, number>>((acc, item) => {
    const key = platformLabel(item.platform);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <SearchResultHeader
        query={query}
        onQueryChange={setQuery}
        onSubmitEditing={handleSubmit}
        onMenuPress={() => navigation.navigate('MyScraps')}
      />

      <AppText weight="medium" size="lg" style={styles.summaryTitle}>
        {result.answer?.intro}
      </AppText>

      <View style={styles.sectionList}>
        {result.answer?.sections.map((section, index) => (
          <View key={`${section.title}-${index}`} style={styles.section}>
            <AppText weight="semiBold" size="base" color={colors.text}>
              {section.title}
            </AppText>
            {section.lines.map((line, lineIndex) => (
              <AppText key={lineIndex} weight="regular" size="sm" color={colors.textMuted} style={styles.sectionLine}>
                {'• '}
                {line}
              </AppText>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.sourceRow}>
        {Object.entries(sourceCounts).map(([label, count]) => (
          <SourceBadge key={label} label={label} count={count} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 37,
    marginTop: 32,
  },
});
