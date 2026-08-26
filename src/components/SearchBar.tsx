import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SearchIcon } from './icons/SearchIcon';
import { colors } from '../styles/colors';
import { fontFamily, fontSize } from '../styles/typography';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  borderColor?: string;
  isSearching?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  autoFocus,
  placeholder = 'Search',
  borderColor = colors.textFaint,
  isSearching = false,
}: SearchBarProps) {
  return (
    <View style={[styles.container, { borderColor }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={styles.input}
        returnKeyType="search"
        editable={!isSearching}
      />
      {isSearching ? (
        <ActivityIndicator color={colors.text} accessibilityLabel="검색 중" />
      ) : (
        <Pressable onPress={onSubmit} hitSlop={8} accessibilityLabel="검색">
          <SearchIcon size={24} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.text,
  },
});
