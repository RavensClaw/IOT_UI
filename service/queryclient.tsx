// queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Platform } from 'react-native';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      //staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

if (Platform.OS !== 'web') {
  const asyncStoragePersister = createAsyncStoragePersister({ storage: AsyncStorage })

  persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: Infinity
  });
}

export default queryClient;
