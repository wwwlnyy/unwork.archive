import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

import { SearchResultHeader } from '../../components/SearchResultHeader';
import { AppText } from '../../components/ui/AppText';
import { useSearch } from '../../hooks/useSearch';
import { imageProxyUrl, type SavedItem } from '../../lib/api/contentClient';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResultExperience'>;

export function SearchResultExperienceScreen({ route, navigation }: Props) {
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

  return (
    <View style={styles.container}>
      <SearchResultHeader
        query={query}
        onQueryChange={setQuery}
        onSubmitEditing={handleSubmit}
        onMenuPress={() => navigation.navigate('MyScraps')}
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
        renderItem={({ item }) => <GridThumbnail item={item} />}
      />
    </View>
  );
}

function GridThumbnail({ item }: { item: SavedItem }) {
  if (!item.thumbnail) {
    return <View style={styles.gridItem} />;
  }

  return <Image source={{ uri: imageProxyUrl(item.thumbnail) }} style={styles.gridItem} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
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
