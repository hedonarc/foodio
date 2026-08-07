import { useEffect } from 'react';

import { useRouter } from 'expo-router';

import { logError } from '@/lib/logger';

import { configureNotificationHandler } from '../lib/configureNotificationHandler';
import { extractOrderId } from '../lib/extractOrderId';

/**
 * Global, mount-once wiring for two concerns that only make sense together:
 * configuring the foreground handler (so a push isn't dropped while the app
 * is open) and deep-linking a tapped notification to its order.
 */
export function useNotificationListener(): void {
  const router = useRouter();

  useEffect(() => {
    void configureNotificationHandler().catch((error: unknown) => {
      logError('notifications.configureHandler', error);
    });
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;

    void (async () => {
      try {
        const Notifications = await import('expo-notifications');
        subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const orderId = extractOrderId(response.notification.request.content.data);
          if (orderId) router.push(`/order/${orderId}`);
        });
      } catch (error) {
        logError('notifications.responseListener', error);
      }
    })();

    return () => subscription?.remove();
  }, [router]);
}
