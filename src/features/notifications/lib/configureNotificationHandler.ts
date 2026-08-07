/**
 * Without this, a push received while the app is open is silently dropped
 * (SDK 57's default handler shows nothing). `shouldShowBanner`/`shouldShowList`
 * replace the deprecated `shouldShowAlert` from older SDKs.
 */
export async function configureNotificationHandler(): Promise<void> {
  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}
