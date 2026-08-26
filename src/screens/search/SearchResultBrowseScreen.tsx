import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Linking, StyleSheet } from 'react-native';

import { AppSidebar } from '../../components/AppSidebar';
import { ScrapCard } from '../../components/ScrapCard';
import { SearchResultHeader } from '../../components/SearchResultHeader';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useSearch } from '../../hooks/useSearch';
import { useSidebar } from '../../hooks/useSidebar';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultBrowse'>;

export function SearchResultBrowseScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params.query);
  const { result } = route.params;
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

    if (nextResult.mode === 'none') {
      navigation.replace('SearchEmpty', { query: trimmed });
    } else if (nextResult.mode === 'informational') {
      navigation.replace('SearchResultInfo', { query: trimmed, result: nextResult });
    } else if (nextResult.mode === 'browse') {
      navigation.replace('SearchResultBrowse', { query: trimmed, result: nextResult });
    } else {
      navigation.replace('SearchResultExperience', { query: trimmed, result: nextResult });
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

      <AppText weight="medium" size="lg" style={styles.headline}>
        {`"${result.query}" 검색 결과예요`}
      </AppText>

      <FlatList
        data={result.items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ScrapCard item={item} onPress={() => Linking.openURL(item.url)} />}
      />

      <AppSidebar visible={sidebar.isOpen} onClose={sidebar.close} scrapCount={sidebar.scrapCount} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: {
    marginTop: 8,
    marginHorizontal: 37,
    lineHeight: 26,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
});
