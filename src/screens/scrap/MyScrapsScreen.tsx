import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, FlatList, StyleSheet, View } from 'react-native';

import { ScrapCard } from '../../components/ScrapCard';
import { AppText } from '../../components/ui/AppText';
import { useAuth } from '../../context/AuthContext';
import { getItems, SessionExpiredError, type SavedItem } from '../../lib/api/contentClient';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { colors } from '../../styles/colors';

const POLL_INTERVAL_MS = 2000;

export function MyScrapsScreen() {
  const { accessToken, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const load = useCallback(
    async (showSpinner: boolean) => {
      if (!accessToken) {
        return;
      }
      if (showSpinner) {
        setIsLoading(true);
      }
      try {
        const result = await getItems(accessToken);
        setItems(result);

        const hasPendingItem = result.some((item) => item.status === 'pending' || item.status === 'processing');
        stopPolling();
        if (hasPendingItem) {
          pollTimeoutRef.current = setTimeout(() => load(false), POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          stopPolling();
          logout();
          Alert.alert('로그인이 만료되었어요', '다시 로그인해주세요.');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      } finally {
        if (showSpinner) {
          setIsLoading(false);
        }
      }
    },
    [accessToken, logout, navigation, stopPolling],
  );

  const isFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      load(true);
      return () => {
        isFocusedRef.current = false;
        stopPolling();
      };
    }, [load, stopPolling]),
  );

  // 화면은 이미 focus된 채로 앱이 백그라운드→포그라운드 전환될 때는
  // useFocusEffect가 다시 안 불리므로, 앱이 다시 활성화될 때도 새로고침한다.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isFocusedRef.current) {
        load(false);
      }
    });
    return () => subscription.remove();
  }, [load]);

  return (
    <View style={styles.container}>
      <AppText weight="bold" size="xl" style={styles.header}>
        내 스크랩
      </AppText>

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.text} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ScrapCard item={item} />}
          ListEmptyComponent={
            <AppText size="sm" color={colors.textFaint} style={styles.empty}>
              저장된 스크랩이 없습니다.
            </AppText>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 60,
  },
  header: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  loading: {
    marginTop: 40,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
