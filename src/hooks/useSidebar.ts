import { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { getStats } from '../lib/api/contentClient';

export function useSidebar() {
  const { accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);

  const open = () => {
    setIsOpen(true);
    if (accessToken) {
      // 사이드바에 보이는 스크랩 수는 부가 정보라 실패해도 조용히 이전 값을 유지한다.
      getStats(accessToken)
        .then((stats) => setScrapCount(stats.total))
        .catch(() => {});
    }
  };

  const close = () => setIsOpen(false);

  return { isOpen, open, close, scrapCount };
}
