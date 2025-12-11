import { useContext } from 'react';
import { FacebookPixelContext } from '@/components/analytics/FacebookPixelProvider';

export function useFacebookPixel() {
  const context = useContext(FacebookPixelContext);
  if (!context) {
    throw new Error('useFacebookPixel must be used within a FacebookPixelProvider');
  }
  return context;
}
