import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Pressable, View } from 'react-native';

import type { ReactNode } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetContainerProps = {
  visible: boolean;
  /** Backdrop tap and the hardware back button both land here. */
  onClose: () => void;
  children: ReactNode;
};

/**
 * Nav-bar clearance while resting, with headroom on top of the inset itself:
 * `insets.bottom` alone lands the buttons exactly flush against the nav bar,
 * which reads as touching it even with zero overlap. The keyboard's own lift
 * is enough once it's up, so stacking the nav-bar padding on top of it would
 * just leave dead space between the buttons and the keyboard.
 */
const REST_BOTTOM_GAP = 16;

function SheetSurface({ onClose, children }: Pick<SheetContainerProps, 'onClose' | 'children'>) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const subs = [
      Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true)),
      Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false)),
    ];
    return () => subs.forEach((sub) => sub.remove());
  }, []);

  return (
    <>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} accessibilityRole="button" />
      <KeyboardAvoidingView behavior="padding">
        <View
          className="rounded-t-3xl bg-white px-4 pt-5"
          style={{
            paddingBottom: keyboardVisible ? 16 : Math.max(insets.bottom + REST_BOTTOM_GAP, 32),
          }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

/** Bottom sheet chrome: modal, backdrop, keyboard avoidance, inset padding. */
export function SheetContainer({ visible, onClose, children }: SheetContainerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* A Modal is its own native window: the outer SafeAreaProvider's insets
          were measured for the app window, not this one, so they read wrong
          in here without a provider of the sheet's own. */}
      <SafeAreaProvider>
        <SheetSurface onClose={onClose}>{children}</SheetSurface>
      </SafeAreaProvider>
    </Modal>
  );
}
