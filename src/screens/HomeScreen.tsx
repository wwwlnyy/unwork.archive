import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useShareIntentContext } from 'expo-share-intent';

export function HomeScreen() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ScrapApp</Text>

      {!hasShareIntent && !error && (
        <Text style={styles.placeholder}>
          다른 앱에서 공유 버튼 {'>'} ScrapApp을 눌러보세요.
        </Text>
      )}

      {error && <Text style={styles.error}>에러: {error}</Text>}

      {hasShareIntent && (
        <View style={styles.card}>
          <Text style={styles.label}>받은 텍스트</Text>
          <Text style={styles.value}>{shareIntent.text ?? '없음'}</Text>

          <Text style={styles.label}>추출된 URL</Text>
          <Text style={styles.value}>{shareIntent.webUrl ?? '없음'}</Text>

          <Text style={styles.label}>메타 제목</Text>
          <Text style={styles.value}>{shareIntent.meta?.title ?? '없음'}</Text>

          <View style={styles.buttonWrapper}>
            <Button title="초기화" onPress={() => resetShareIntent()} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  placeholder: {
    textAlign: 'center',
    color: '#666',
  },
  error: {
    color: '#c00',
  },
  card: {
    width: '100%',
    gap: 4,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
  },
  buttonWrapper: {
    marginTop: 16,
  },
});
