import { useEffect } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text, TextField } from '@/components/ui';
import type { ReviewFormValues } from '@/features/restaurants/types/review.types';
import {
  REVIEW_COMMENT_MAX,
  REVIEW_RATING_MAX,
  reviewFormSchema,
  toNewReview,
} from '@/features/restaurants/types/review.types';
import { colors } from '@/theme';

import { useSubmitReview } from '../hooks/useSubmitReview';
import { isAlreadyReviewed } from '../lib/reviewSubmission';

const STARS = Array.from({ length: REVIEW_RATING_MAX }, (_, index) => index + 1);

type RateOrderSheetProps = {
  visible: boolean;
  orderId: string;
  restaurantName: string;
  onClose: () => void;
};

/** Five stars, an optional comment, one submission. */
export function RateOrderSheet({ visible, orderId, restaurantName, onClose }: RateOrderSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const submitReview = useSubmitReview();

  const { control, handleSubmit, reset } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    // `rating: 0` means "nothing picked yet"; the schema refuses it.
    defaultValues: { rating: 0, comment: '' },
  });

  // Reopening must not carry a previous draft or a stale error.
  useEffect(() => {
    if (visible) {
      reset();
      submitReview.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset refs are stable
  }, [visible]);

  const submit = (values: ReviewFormValues) => {
    submitReview.mutate(
      { orderId, review: toNewReview(values) },
      {
        onSuccess: onClose,
        // Already reviewed settles the affordance into "Rated" — close quietly.
        onError: (error) => {
          if (isAlreadyReviewed(error)) onClose();
        },
      },
    );
  };

  const submitError =
    submitReview.error && !isAlreadyReviewed(submitReview.error) ? submitReview.error : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} accessibilityRole="button" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* A Modal is its own native window: root-level safe area never reaches it. */}
        <View
          className="rounded-t-3xl bg-white px-4 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 32) }}
        >
          <Text variant="subheading" className="text-gray-900">
            {t('review.sheetTitle')}
          </Text>
          <Text variant="body" className="mt-1 text-gray-500">
            {t('order.fromRestaurant', { restaurant: restaurantName })}
          </Text>

          <Controller
            control={control}
            name="rating"
            render={({ field, fieldState }) => (
              <View className="mt-4">
                <View className="flex-row justify-center gap-2">
                  {STARS.map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => field.onChange(star)}
                      accessibilityRole="button"
                      accessibilityLabel={t('review.starLabel', { count: star })}
                      accessibilityState={{ selected: field.value >= star }}
                      className="p-1 active:opacity-70"
                    >
                      <Ionicons
                        name={field.value >= star ? 'star' : 'star-outline'}
                        size={34}
                        color={field.value >= star ? colors.warning[500] : colors.gray[300]}
                      />
                    </Pressable>
                  ))}
                </View>
                {fieldState.error ? (
                  <Text
                    variant="caption"
                    className="mt-2 text-center text-error-500"
                    accessibilityLiveRegion="polite"
                  >
                    {t('review.errors.rating')}
                  </Text>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="comment"
            render={({ field, fieldState }) => (
              <TextField
                label={t('review.commentLabel')}
                placeholder={t('review.commentPlaceholder')}
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error ? t('review.errors.comment') : undefined}
                maxLength={REVIEW_COMMENT_MAX}
                multiline
                className="mt-4"
              />
            )}
          />

          {submitError ? (
            <Text
              variant="caption"
              className="mt-3 text-error-500"
              accessibilityLiveRegion="polite"
            >
              {submitError.message}
            </Text>
          ) : null}

          <View className="mt-5 flex-row gap-3">
            <Button variant="ghost" onPress={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onPress={() => void handleSubmit(submit)()}
              disabled={submitReview.isPending}
              className="flex-1"
            >
              {t('review.submit')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
