import { View } from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { colors } from '@/theme';

type SignInRequiredProps = {
  /** What this particular screen needs a Person for. */
  message: string;
  className?: string;
};

/**
 * A wall with a door in it.
 *
 * The sign-in screen used to be reachable only from the identity chip on Home,
 * so a screen that needed a session showed the server's own "Not authenticated."
 * and left the customer to find their own way out — see issue #177.
 */
export function SignInRequired({ message, className }: SignInRequiredProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const guard = useNavigationGuard();

  return (
    <View className={className ?? 'items-center justify-center px-8 py-10'}>
      <Ionicons name="person-circle-outline" size={28} color={colors.gray[400]} />
      <Text variant="body" className="mt-3 text-center text-gray-500">
        {message}
      </Text>
      <Button
        variant="secondary"
        onPress={() => guard(() => router.push('/sign-in'))}
        className="mt-4"
      >
        {t('identity.signIn')}
      </Button>
    </View>
  );
}
