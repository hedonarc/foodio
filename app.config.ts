import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * app.json plus the one thing that cannot live in it.
 *
 * The Maps SDK key is not a secret — it ships inside the APK's manifest and
 * anyone can read it out. What it must not be is committed: this repository is
 * public, and Google keys are harvested from public repos within hours. Safety
 * comes from restricting the key to this package and to Maps SDK for Android,
 * not from hiding it.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // A missing key is a grey rectangle where the delivery-area map should be,
  // with nothing in the logs. Fail the build instead of shipping that.
  if (!apiKey && process.env.EAS_BUILD_PLATFORM === 'android') {
    throw new Error('GOOGLE_MAPS_API_KEY is unset. Set it in EAS environment variables.');
  }

  return {
    ...config,
    name: config.name ?? 'foodio',
    slug: config.slug ?? 'foodio',
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: { apiKey },
      },
    },
  };
};
