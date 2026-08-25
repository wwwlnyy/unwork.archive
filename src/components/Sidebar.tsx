import { useEffect, useRef } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CloseIcon } from './icons/CloseIcon';
import { HeadphoneIcon } from './icons/HeadphoneIcon';
import { NoticeIcon } from './icons/NoticeIcon';
import { AppText } from './ui/AppText';
import { colors } from '../styles/colors';

const SIDEBAR_WIDTH = 289;
const ANIMATION_DURATION_MS = 220;

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  userName: string;
  scrapCount: number;
  avatarUri?: string;
  onScrapListPress: () => void;
  onPlanChangePress: () => void;
  onLogoutPress: () => void;
  onNoticePress?: () => void;
  onSupportPress?: () => void;
};

export function Sidebar({
  visible,
  onClose,
  userName,
  scrapCount,
  avatarUri,
  onScrapListPress,
  onPlanChangePress,
  onLogoutPress,
  onNoticePress,
  onSupportPress,
}: SidebarProps) {
  const translateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : SIDEBAR_WIDTH,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [visible, translateX]);

  const handlePress = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="사이드바 닫기" />
      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton} accessibilityLabel="닫기">
          <CloseIcon size={31} />
        </Pressable>

        <View style={styles.profileRow}>
          <View style={styles.profileInfo}>
            <AppText weight="bold" size="xl" color={colors.text}>
              {userName}
            </AppText>
            <View style={styles.scrapCountBlock}>
              <AppText weight="medium" size="lg" color={colors.text}>
                {scrapCount.toLocaleString()}
              </AppText>
              <AppText weight="medium" size="xs" color={colors.textFaint}>
                스크랩
              </AppText>
            </View>
          </View>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
        </View>

        <Pressable onPress={handlePress(onScrapListPress)} style={styles.listRow}>
          <AppText weight="medium" size="xs" color={colors.textMuted}>
            스크랩 목록
          </AppText>
          <ChevronRightIcon size={24} />
        </Pressable>

        <Pressable onPress={handlePress(onPlanChangePress)} style={[styles.listRow, styles.listRowLast]}>
          <AppText weight="medium" size="xs" color={colors.textMuted}>
            요금제 변경
          </AppText>
          <ChevronRightIcon size={24} />
        </Pressable>

        <Pressable onPress={handlePress(onLogoutPress)} style={[styles.listRow, styles.listRowLast]}>
          <AppText weight="medium" size="xs" color={colors.textMuted}>
            로그아웃
          </AppText>
          <ChevronRightIcon size={24} />
        </Pressable>

        <View style={styles.sectionDivider} />

        <View style={styles.iconRow}>
          <Pressable onPress={handlePress(() => onNoticePress?.())} style={styles.iconItem}>
            <NoticeIcon size={24} />
            <AppText weight="medium" size="xs" color={colors.textMuted} numberOfLines={1}>
              공지사항
            </AppText>
          </Pressable>
          <Pressable onPress={handlePress(() => onSupportPress?.())} style={styles.iconItem}>
            <HeadphoneIcon size={24} />
            <AppText weight="medium" size="xs" color={colors.textMuted} numberOfLines={1}>
              고객센터
            </AppText>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.background,
  },
  closeButton: {
    marginLeft: 16,
    marginTop: 55,
    width: 31,
    height: 31,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 33,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileInfo: {
    gap: 20,
  },
  scrapCountBlock: {
    gap: 4,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  avatarPlaceholder: {
    backgroundColor: colors.accent,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listRowLast: {
    marginBottom: 0,
  },
  sectionDivider: {
    width: '100%',
    height: 15,
    backgroundColor: colors.border,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 31,
    marginHorizontal: 16,
    marginTop: 30,
  },
  iconItem: {
    alignItems: 'center',
    gap: 11,
  },
});
