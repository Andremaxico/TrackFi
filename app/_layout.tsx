import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { useAppStore } from '../src/store/useAppStore';
import { supabase } from '../src/services/SupabaseClient';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { CustomAlert } from '../src/components/CustomAlert';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, setAuthenticated, isFaceIdUnlocked, setFaceIdUnlocked, requireFaceId } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Підписка на зміну стану авторизації Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setIsInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Логіка захисту FaceID (блокування при згортанні додатку)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (isAuthenticated && requireFaceId) {
          setFaceIdUnlocked(false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated, requireFaceId]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inLockedScreen = segments[0] === 'locked';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (requireFaceId && !isFaceIdUnlocked) {
        if (!inLockedScreen) {
          router.replace('/locked');
        }
      } else {
        if (inAuthGroup || inLockedScreen) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, isFaceIdUnlocked, requireFaceId, segments, isInitialized]);

  if (!isInitialized) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Slot />
      <CustomAlert />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
