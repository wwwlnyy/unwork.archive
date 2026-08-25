import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "./ui/AppText";
import {
  imageProxyUrl,
  platformLabel,
  type SavedItem,
} from "../lib/api/contentClient";
import { colors } from "../styles/colors";

interface ScrapCardProps {
  item: SavedItem;
  selectable?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

export function ScrapCard({
  item,
  selectable = false,
  selected = false,
  onPress,
}: ScrapCardProps) {
  const entities = item.entities ?? [];
  const [isImageReady, setIsImageReady] = useState(!item.thumbnail);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!selectable && !onPress}
    >
      <View>
        {item.thumbnail ? (
          <Image
            source={{ uri: imageProxyUrl(item.thumbnail) }}
            style={styles.image}
            onLoadEnd={() => setIsImageReady(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <AppText size="xl">🔖</AppText>
          </View>
        )}
        {!isImageReady && (
          <View style={[styles.image, styles.imageLoadingOverlay]} />
        )}
        {selectable && (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && (
              <AppText size="xs" color={colors.surface} weight="bold">
                ✓
              </AppText>
            )}
          </View>
        )}
      </View>

      {isImageReady && (
        <>
          <AppText
            weight="semiBold"
            size="sm"
            numberOfLines={2}
            style={styles.title}
          >
            {item.title ?? item.url}
          </AppText>

          <AppText size="xs" color={colors.textFaint} style={styles.platform}>
            {platformLabel(item.platform)}
          </AppText>

          {entities.length > 0 && (
            <View style={styles.entityBlock}>
              <AppText size="xs" color={colors.textFaint}>
                포함된 항목
              </AppText>
              {entities.slice(0, 3).map((entity) => (
                <AppText key={`${item.id}-${entity.name}`} size="xs" color={colors.textMuted} numberOfLines={1}>
                  {entity.name}
                  {entity.note ? ` · ${entity.note}` : ''}
                </AppText>
              ))}
              {entities.length > 3 && (
                <AppText size="xs" color={colors.textFaint}>
                  외 {entities.length - 3}개
                </AppText>
              )}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 10,
    backgroundColor: colors.background,
    overflow: "hidden",
    paddingBottom: 8,
  },
  image: {
    width: "100%",
    aspectRatio: 1.3,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: colors.border,
  },
  checkbox: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.surface,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  title: {
    marginHorizontal: 8,
    marginTop: 6,
  },
  platform: {
    marginHorizontal: 8,
    marginTop: 2,
  },
  entityBlock: {
    marginHorizontal: 8,
    marginTop: 8,
    gap: 2,
  },
});
