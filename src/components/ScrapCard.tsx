import { Image, StyleSheet, View } from 'react-native';

import { AppText } from './ui/AppText';
import { imageProxyUrl, platformLabel, type SavedItem } from '../lib/api/contentClient';
import { colors } from '../styles/colors';

interface ScrapCardProps {
  item: SavedItem;
}

export function ScrapCard({ item }: ScrapCardProps) {
  const isPending = item.status === 'pending' || item.status === 'processing';
  const isFailed = item.status === 'failed';

  return (
    <View style={styles.card}>
      {item.thumbnail ? (
        <Image source={{ uri: imageProxyUrl(item.thumbnail) }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <AppText size="xl">🔖</AppText>
        </View>
      )}

      <AppText weight="semiBold" size="sm" numberOfLines={2} style={styles.title}>
        {item.title ?? item.url}
      </AppText>

      <AppText size="xs" color={colors.textFaint} style={styles.platform}>
        {platformLabel(item.platform)}
      </AppText>

      <View style={styles.tagRow}>
        {isPending ? (
          <View style={[styles.tagChip, styles.tagChipPending]}>
            <AppText size="xs" color={colors.textFaint}>
              AI 분석중…
            </AppText>
          </View>
        ) : isFailed ? (
          <View style={[styles.tagChip, styles.tagChipFailed]}>
            <AppText size="xs" color="#B3261E">
              저장 실패
            </AppText>
          </View>
        ) : (
          item.tags.slice(0, 3).map((tag) => (
            <View key={tag.name} style={styles.tagChip}>
              <AppText size="xs" color={colors.text}>
                #{tag.name}
              </AppText>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 10,
    backgroundColor: colors.background,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  image: {
    width: '100%',
    aspectRatio: 1.3,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginHorizontal: 8,
    marginTop: 6,
  },
  platform: {
    marginHorizontal: 8,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginHorizontal: 8,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagChipPending: {
    backgroundColor: colors.background,
  },
  tagChipFailed: {
    backgroundColor: '#FCE8E6',
  },
});
