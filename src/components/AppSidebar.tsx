import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { mockUser } from '../mocks/user';
import type { RootStackParamList } from '../navigation/RootNavigator';

type AppSidebarProps = {
  visible: boolean;
  onClose: () => void;
  scrapCount: number;
};

export function AppSidebar({ visible, onClose, scrapCount }: AppSidebarProps) {
  const { displayName, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <Sidebar
      visible={visible}
      onClose={onClose}
      userName={displayName ?? mockUser.name}
      scrapCount={scrapCount}
      onScrapListPress={() => navigation.navigate('MyScraps')}
      onPlanChangePress={() => navigation.navigate('Pay')}
      onLogoutPress={handleLogout}
      // TODO: 공지사항/고객센터 화면 미구현
    />
  );
}
