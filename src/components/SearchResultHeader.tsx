import { Pressable, StyleSheet, View } from 'react-native';

import { SearchBar } from './SearchBar';
import { MenuIcon } from './icons/MenuIcon';
import { colors } from '../styles/colors';

type SearchResultHeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmitEditing: () => void;
  onMenuPress?: () => void;
};

export function SearchResultHeader({ query, onQueryChange, onSubmitEditing, onMenuPress }: SearchResultHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
        <MenuIcon size={24} />
      </Pressable>
      <SearchBar value={query} onChangeText={onQueryChange} onSubmit={onSubmitEditing} borderColor={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  menuButton: {
    alignSelf: 'flex-end',
    marginBottom: 21,
  },
});
