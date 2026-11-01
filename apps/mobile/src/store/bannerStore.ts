import { create } from 'zustand';
import { Vibration } from 'react-native';

export interface BannerData {
  id: string;
  title: string;
  message: string;
  type: 'VERIFICATION' | 'PAYMENT' | 'TASK' | 'ARRIVAL' | 'INFO';
  timestamp: string;
  data?: any;
}

interface BannerStore {
  banner: BannerData | null;
  showBanner: (banner: Omit<BannerData, 'id' | 'timestamp'>) => void;
  dismissBanner: () => void;
}

export const useBannerStore = create<BannerStore>((set) => ({
  banner: null,

  showBanner: (data) => {
    // Light imperial vibration alert pattern
    try {
      Vibration.vibrate([0, 70, 40, 70]);
    } catch {
      // Ignore vibration error on emulators/unsupported environments
    }

    const newBanner: BannerData = {
      ...data,
      id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    set({ banner: newBanner });
  },

  dismissBanner: () => set({ banner: null }),
}));
