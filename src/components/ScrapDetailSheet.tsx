import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";

import { SourceCard } from "./SourceCard";
import { AppText } from "./ui/AppText";
import { platformLabel, type SavedItem } from "../lib/api/contentClient";
import { colors } from "../styles/colors";

const ANIMATION_DURATION_MS = 220;

type ScrapDetailSheetProps = {
  item: SavedItem | null;
  onClose: () => void;
};

export function ScrapDetailSheet({ item, onClose }: ScrapDetailSheetProps) {
  const visible = item !== null;
  const translateY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 1,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="닫기"
      />
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              {
                translateY: translateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 400],
                }),
              },
            ],
          },
        ]}
      >
        {item && (
          <>
            <View style={styles.dragHandle} />

            <View style={styles.body}>
              <SourceCard item={item} />
            </View>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingBottom: 24,
  },
  dragHandle: {
    alignSelf: "center",
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
  body: {
    marginHorizontal: 20,
  },
});
