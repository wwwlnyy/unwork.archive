import { Image, Linking, Pressable, StyleSheet, View } from "react-native";

import { ArrowUpRightIcon } from "./icons/ArrowUpRightIcon";
import { AppText } from "./ui/AppText";
import { imageProxyUrl, type SavedItem } from "../lib/api/contentClient";
import { colors } from "../styles/colors";

type SourceCardProps = {
  item: SavedItem;
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
}

export function SourceCard({ item }: SourceCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => Linking.openURL(item.url)}>
      <View style={styles.thumbnailWrap}>
        {item.thumbnail ? (
          <Image
            source={{ uri: imageProxyUrl(item.thumbnail) }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
        )}
      </View>

      <View style={styles.info}>
        {item.platform ? (
          <AppText
            weight="medium"
            size="base"
            color={colors.text}
            numberOfLines={1}
          >
            @{item.platform}
          </AppText>
        ) : null}
        <AppText
          weight="medium"
          size="base"
          color={colors.text}
          numberOfLines={2}
        >
          {item.title ?? item.url}
        </AppText>
        <AppText
          weight="medium"
          size="base"
          color={colors.textFaint}
          numberOfLines={1}
        >
          {formatDate(item.created_at)}
        </AppText>
        <View style={styles.linkRow}>
          <AppText
            weight="medium"
            size="base"
            color={colors.text}
            numberOfLines={1}
          >
            게시물 보기
          </AppText>
          <ArrowUpRightIcon size={21} color={colors.text} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  thumbnailWrap: {
    width: 110,
    height: 110,
  },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: 10,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
