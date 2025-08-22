import 'react-native-reanimated';
import queryClient from '@/service/queryclient';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo'
import { syncOffline } from '@/service/servicehook';


// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        setOnline(!!state.isInternetReachable);
        if (state.isInternetReachable) {
          syncOffline().catch((error) => {
            console.error('Error syncing offline data:', error);
          });
        }
      });
      return unsubscribe;
    })
  }, [])


  return (

    <PaperProvider>
      <QueryClientProvider client={queryClient}>

        <Stack initialRouteName='index'>
          <Stack.Screen name="+not-found" />
        </Stack>
      </QueryClientProvider>

    </PaperProvider>
  );
}
