import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ChevronLeftIcon } from "../../components/icons/ChevronLeftIcon";
import { ScrapCard } from "../../components/ScrapCard";
import { AppText } from "../../components/ui/AppText";
import { Screen } from "../../components/ui/Screen";
import { useAuth } from "../../context/AuthContext";
import {
  deleteItems,
  getItems,
  imageProxyUrl,
  SessionExpiredError,
  type SavedItem,
} from "../../lib/api/contentClient";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { colors } from "../../styles/colors";

const POLL_INTERVAL_MS = 2000;
const PREFETCH_TIMEOUT_MS = 5000;

// 썸네일 하나가 느리거나 실패해도 화면 전체가 무한정 멈추지 않도록 타임아웃을 둔다.
function prefetchWithTimeout(uri: string): Promise<void> {
  return Promise.race([
    Image.prefetch(uri).then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, PREFETCH_TIMEOUT_MS)),
  ]);
}

export function MyScrapsScreen() {
  const { accessToken, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
        if (showSpinner) {
          await Promise.all(
            result
              .filter((item) => item.thumbnail)
              .map((item) => prefetchWithTimeout(imageProxyUrl(item.thumbnail!))),
          );
        }
        setItems(result);

        const hasPendingItem = result.some(
          (item) => item.status === "pending" || item.status === "processing",
        );
        stopPolling();
        if (hasPendingItem) {
          pollTimeoutRef.current = setTimeout(
            () => load(false),
            POLL_INTERVAL_MS,
          );
        }
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          stopPolling();
          logout();
          Alert.alert("로그인이 만료되었어요", "다시 로그인해주세요.");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
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
        setIsSelecting(false);
        setSelectedIds(new Set());
      };
    }, [load, stopPolling]),
  );

  // 화면은 이미 focus된 채로 앱이 백그라운드→포그라운드 전환될 때는
  // useFocusEffect가 다시 안 불리므로, 앱이 다시 활성화될 때도 새로고침한다.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && isFocusedRef.current) {
        load(false);
      }
    });
    return () => subscription.remove();
  }, [load]);

  const toggleSelecting = () => {
    setIsSelecting((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0 || !accessToken) {
      return;
    }
    Alert.alert(
      "스크랩 삭제",
      `선택한 ${selectedIds.size}개 항목을 삭제할까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            const ids = [...selectedIds];
            try {
              await deleteItems(ids, accessToken);
              await load(false);
              setIsSelecting(false);
              setSelectedIds(new Set());
            } catch (error) {
              if (error instanceof SessionExpiredError) {
                logout();
                Alert.alert("로그인이 만료되었어요", "다시 로그인해주세요.");
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                return;
              }

              const message =
                error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다.";
              Alert.alert("스크랩 삭제 실패", message);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen paddingHorizontal={0}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={styles.backButton}
          accessibilityLabel="뒤로가기"
        >
          <ChevronLeftIcon size={31} />
        </Pressable>
        <AppText weight="bold" size="xl" style={styles.headerTitle}>
          내 스크랩
        </AppText>
        <View style={styles.headerRight}>
          {items.length > 0 && (
            <Pressable onPress={toggleSelecting} hitSlop={10}>
              <AppText weight="medium" size="sm" color={colors.textMuted}>
                {isSelecting ? "취소" : "선택"}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.text} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ScrapCard
              item={item}
              selectable={isSelecting}
              selected={selectedIds.has(item.id)}
              onPress={isSelecting ? () => toggleSelected(item.id) : undefined}
            />
          )}
          ListEmptyComponent={
            <AppText size="sm" color={colors.textFaint} style={styles.empty}>
              저장된 스크랩이 없습니다.
            </AppText>
          }
        />
      )}

      {isSelecting && selectedIds.size > 0 && (
        <Pressable style={styles.deleteBar} onPress={handleDeleteSelected}>
          <AppText weight="semiBold" size="sm" color={colors.surface}>
            선택한 {selectedIds.size}개 삭제
          </AppText>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    minHeight: 31,
  },
  backButton: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
  },
  headerRight: {
    minWidth: 31,
    alignItems: "flex-end",
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  loading: {
    marginTop: 40,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
  },
  deleteBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: colors.text,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: "center",
  },
});
