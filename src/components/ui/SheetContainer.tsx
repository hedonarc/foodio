import { KeyboardAvoidingView, Modal, Pressable, View } from 'react-native';

import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetContainerProps = {
  visible: boolean;
  /** Backdrop tap and the hardware back button both land here. */
  onClose: () => void;
  children: ReactNode;
};

/** Bottom sheet chrome: modal, backdrop, keyboard avoidance, inset padding. */
export function SheetContainer({ visible, onClose, children }: SheetContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} accessibilityRole="button" />
      {/* A Modal is its own native window: neither safe area nor Android's
          adjustResize reaches it, hence the explicit inset padding and behavior. */}
      <KeyboardAvoidingView behavior="padding">
        <View
          className="rounded-t-3xl bg-white px-4 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 32) }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
