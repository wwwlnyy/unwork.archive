import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { search, SessionExpiredError, type SearchResponse } from '../lib/api/contentClient';
import type { RootStackParamList } from '../navigation/RootNavigator';

export function useSearch() {
  const { accessToken, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = async (query: string): Promise<SearchResponse | null> => {
    if (!accessToken) {
      Alert.alert('로그인이 필요해요', '검색하려면 먼저 로그인해주세요.');
      return null;
    }

    setIsSearching(true);
    try {
      return await search(query, accessToken);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        logout();
        Alert.alert('로그인이 만료되었어요', '다시 로그인해주세요.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return null;
      }
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('검색 실패', message);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return { runSearch, isSearching };
}
