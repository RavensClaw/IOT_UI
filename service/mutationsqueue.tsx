// mutationQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource'

const QUEUE_KEY = 'dashboardAccessMutationQueue';

export async function queueddashboardAccess(dashboardAccess: any) {
  const existing = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
  existing.push(dashboardAccess);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
}

export async function processQueue() {
  const client = generateClient<Schema>();

  const queued = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) || '[]');
  for (const dashboardAccess of queued) {
    try {
        const { data: dashboardAccesss, errors } = await client.models.DashboardsAccess.create(dashboardAccess);
    } catch (e) {
      console.log('Failed to sync dashboardAccess:', dashboardAccess, e);
    }
  }
  await AsyncStorage.removeItem(QUEUE_KEY);
}

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processQueue();
  }
});
