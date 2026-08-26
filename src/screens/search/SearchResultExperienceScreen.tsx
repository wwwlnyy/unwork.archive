import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet } from 'react-native';

import { AppSidebar } from '../../components/AppSidebar';
import { ScrapDetailSheet } from '../../components/ScrapDetailSheet';
import { SearchResultHeader } from '../../components/SearchResultHeader';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useSearch } from '../../hooks/useSearch';
import { useSidebar } from '../../hooks/useSidebar';
import { imageProxyUrl, type SavedItem } from '../../lib/api/contentClient';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultExperience'>;

export function SearchResultExperienceScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params.query);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
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
        {`"${result.query}"과 관련해\n저장한 내용이에요`}
      </AppText>

      <FlatList
        data={result.items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <GridThumbnail item={item} onPress={() => setSelectedItem(item)} />}
      />

      <ScrapDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />

      <AppSidebar visible={sidebar.isOpen} onClose={sidebar.close} scrapCount={sidebar.scrapCount} />
    </Screen>
  );
}

function GridThumbnail({ item, onPress }: { item: SavedItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.gridItem}>
      {item.thumbnail && (
        <Image source={{ uri: imageProxyUrl(item.thumbnail) }} style={styles.gridItem} resizeMode="cover" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headline: {
    marginTop: 8,
    marginHorizontal: 37,
    lineHeight: 26,
  },
  grid: {
    paddingHorizontal: 36,
    paddingTop: 25,
    gap: 14,
  },
  row: {
    gap: 18,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
});
