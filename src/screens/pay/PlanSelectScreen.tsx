import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Pay'>;

type PlanId = 'standard' | 'premium';

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  features: string[];
}[] = [
  {
    id: 'standard',
    name: '스탠다드',
    price: '5,900원',
    features: ['스크랩 최대 200개', 'AI 요약 월 100회', '이미지 검색 지원'],
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: '9,900원',
    features: ['스크랩 무제한', 'AI 요약 무제한', '이미지 검색 지원', '우선 분석 처리'],
  },
];

export function PlanSelectScreen({ navigation }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('standard');

  const handleSubscribe = () => {
    Alert.alert('준비 중이에요', '결제 기능은 아직 준비 중입니다.');
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton} accessibilityLabel="뒤로가기">
          <ChevronLeftIcon size={31} />
        </Pressable>
        <AppText weight="bold" size="xl" style={styles.headerTitle}>
          요금제 선택
        </AppText>
      </View>
      <AppText weight="medium" size="sm" color={colors.textFaint} style={styles.subtitle}>
        더 많은 스크랩과 AI 분석을 이용해보세요.
      </AppText>

      <View style={styles.planList}>
        {PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlan;
          return (
            <Pressable
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <AppText weight="bold" size="lg" color={isSelected ? colors.surface : colors.text}>
                  {plan.name}
                </AppText>
                <AppText weight="bold" size="lg" color={isSelected ? colors.surface : colors.text}>
                  {plan.price}
                </AppText>
              </View>
              <View style={styles.featureList}>
                {plan.features.map((feature) => (
                  <AppText
                    key={feature}
                    weight="regular"
                    size="sm"
                    color={isSelected ? colors.surface : colors.textMuted}
                    style={styles.featureLine}
                  >
                    {'• '}
                    {feature}
                  </AppText>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
        <AppText weight="semiBold" size="base" color={colors.surface}>
          구독하기
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 31,
  },
  backButton: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
  },
  subtitle: {
    marginTop: 8,
  },
  planList: {
    marginTop: 32,
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
  },
  planCardSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureList: {
    marginTop: 16,
    gap: 6,
  },
  featureLine: {
    lineHeight: 20,
  },
  subscribeButton: {
    marginTop: 32,
    backgroundColor: colors.text,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
