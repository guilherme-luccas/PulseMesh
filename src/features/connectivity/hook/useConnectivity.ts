import { useEffect } from 'react';
import { useConnectivityStore } from '../store/useConnectivityStore';

export function useConnectivity(): void {
  const start = useConnectivityStore((state) => state.start);

  useEffect(() => {
    start();
  }, [start]);
}
