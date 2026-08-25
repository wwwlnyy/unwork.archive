import { useEffect, useRef } from 'react';
import { Animated, FlatList, Image, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import { CloseIcon } from './icons/CloseIcon';
import { AppText } from './ui/AppText';
import { imageProxyUrl, type SavedItem } from '../lib/api/contentClient';
import { colors } from '../styles/colors';

const ANIMATION_DURATION_MS = 220;

type SourceListSheetProps = {
  visible: boolean;
  title: string;
  items: SavedItem[];
  onClose: () => void;
};

export function SourceListSheet({ visible, title, items, onClose }: SourceListSheetProps) {
  const translateY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 1,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기" />
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              {
                translateY: translateY.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }),
              },
            ],
          },
        ]}
      >
        <View style={styles.header}>
          <AppText weight="bold" size="lg" color={colors.text}>
            {title}
          </AppText>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="닫기">
            <CloseIcon size={24} />
          </Pressable>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => Linking.openURL(item.url)}>
              {item.thumbnail ? (
                <Image source={{ uri: imageProxyUrl(item.thumbnail) }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
              )}
              <View style={styles.rowText}>
                <AppText weight="semiBold" size="sm" color={colors.text} numberOfLines={2}>
                  {item.title ?? item.url}
                </AppText>
                {item.author ? (
                  <AppText weight="regular" size="xs" color={colors.textFaint} numberOfLines={1}>
                    {item.author}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.border,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
});
