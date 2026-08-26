import { useEffect, useRef } from 'react';
import { Animated, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { SourceCard } from './SourceCard';
import { AppText } from './ui/AppText';
import { type SavedItem } from '../lib/api/contentClient';
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
        <View style={styles.dragHandle} />

        <AppText weight="medium" size="lg" color={colors.text} style={styles.header}>
          {title} 출처 · {items.length}개
        </AppText>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <SourceCard item={item} />}
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
    maxHeight: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 47,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 22,
  },
  header: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
  },
});
