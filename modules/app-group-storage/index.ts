import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

const AppGroupStorageModule =
  Platform.OS === 'ios' || Platform.OS === 'android' ? requireNativeModule('AppGroupStorage') : null;

export function setAccessToken(accessToken: string | null): void {
  AppGroupStorageModule?.setAccessToken(accessToken);
}
