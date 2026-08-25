import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '../../components/ScreenHeader';
import { SearchBar } from '../../components/SearchBar';
import { Sidebar } from '../../components/Sidebar';
import { AppText } from '../../components/ui/AppText';
import { useSearch } from '../../hooks/useSearch';
import { mockUser } from '../../mocks/user';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    if (result.mode === 'none') {
      navigation.navigate('SearchEmpty', { query: trimmed });
    } else if (result.mode === 'informational') {
      navigation.navigate('SearchResultInfo', { query: trimmed, result });
    } else {
      navigation.navigate('SearchResultExperience', { query: trimmed, result });
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader onMenuPress={() => setIsSidebarOpen(true)} />

      <AppText weight="bold" size="xl" style={styles.headline}>
        저장한 정보를,{'\n'}다시 찾는 곳.
      </AppText>
      <AppText weight="medium" size="sm" color={colors.textFaint} style={styles.subline}>
        정리하지 않아도, 필요한 순간 과거의 스크랩을 다시 활용합니다.
      </AppText>

      <SearchBar value={query} onChangeText={setQuery} onSubmit={handleSubmit} />
      {isSearching && <ActivityIndicator style={styles.searchSpinner} color={colors.text} />}

      <Sidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={mockUser.name}
        scrapCount={mockUser.scrapCount}
        onScrapListPress={() => navigation.navigate('MyScraps')}
        // TODO: 요금제 변경/공지사항/고객센터 화면 미구현 (Phase 4 이후 연결)
        onPlanChangePress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 67,
  },
  headline: {
    marginTop: 117,
    lineHeight: 34,
  },
  subline: {
    marginTop: 12,
    marginBottom: 97,
  },
  searchSpinner: {
    marginTop: 16,
  },
});
