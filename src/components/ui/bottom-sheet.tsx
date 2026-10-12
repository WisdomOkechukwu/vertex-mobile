import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SheetProps = {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  snapPoints?: (string | number)[];
  /**
   * Whether this is the frontmost layer of `SheetHost`'s stack. Only the top layer takes taps on the
   * scrim; a buried layer's scrim would otherwise close the wrong sheet.
   */
  isTop?: boolean;
};

/** The grab handle, title and close button, shared by the native and web paths. */
function SheetHeader({ title, onClose }: { title?: string; onClose: () => void }) {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <ThemedText type="sectionHeader">{title}</ThemedText>
      <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.key }]}>
        <Icon name="close" size={16} color={theme.fg} />
      </Pressable>
    </View>
  );
}

/**
 * `@gorhom/bottom-sheet`'s `BottomSheetModal` renders nothing under react-native-web — `present()`
 * adds no DOM at all — so every sheet in the app was unreachable in the browser, including the
 * `design/payment links/share.png` one. This is the web stand-in: the same header and body over a
 * dismissable scrim, driven through the same imperative `present`/`dismiss` handle so `SheetHost`
 * does not have to know which path it got. Native is untouched.
 */
const WebBottomSheet = forwardRef<BottomSheetModal, SheetProps>(function WebBottomSheet(
  { title, children, onClose, snapPoints, isTop = true },
  ref
) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useImperativeHandle(
    ref,
    () =>
      ({
        present: () => setOpen(true),
        dismiss: () => setOpen(false),
      }) as unknown as BottomSheetModal,
    []
  );

  const close = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);

  if (!open) return null;

  // Honour the native snap point: without it every sheet was capped at 80% and the 92% amount
  // sheets lost their CTA below the fold in the browser.
  const first = snapPoints?.[0];
  const maxHeight = typeof first === 'string' ? (first as `${number}%`) : first ?? '80%';

  return (
    <View style={styles.webOverlay} pointerEvents="box-none">
      <Pressable
        style={[styles.webScrim, { backgroundColor: theme.scrim }]}
        onPress={isTop ? close : undefined}
      />
      <View style={[styles.webPanel, { maxHeight }, { backgroundColor: theme.background }]}>
        <View style={[styles.webHandle, { backgroundColor: theme.mut }]} />
        <SheetHeader title={title} onClose={close} />
        <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
      </View>
    </View>
  );
});

/** House-styled wrapper around @gorhom/bottom-sheet's modal: grab handle + title + close + scroll body. */
const NativeBottomSheet = forwardRef<BottomSheetModal, SheetProps>(function NativeBottomSheet(
  { title, children, onClose, snapPoints, isTop = true },
  ref
) {
  const theme = useTheme();
  const points = useMemo(() => snapPoints ?? ['60%'], [snapPoints]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        // `theme.scrim`, matching the web twin above — the library default is a flat black at 0.4,
        // where dark mode wants 0.6 to hold the sheet apart from the page behind it.
        pressBehavior={isTop ? 'close' : 'none'}
        opacity={1}
        style={[props.style, { backgroundColor: theme.scrim }]}
      />
    ),
    [theme.scrim, isTop]
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.mut }}
      backdropComponent={renderBackdrop}
    >
      <SheetHeader title={title} onClose={onClose} />
      <BottomSheetScrollView contentContainerStyle={styles.body}>{children}</BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export const AppBottomSheet = Platform.OS === 'web' ? WebBottomSheet : NativeBottomSheet;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Screen.horizontal,
    paddingBottom: Spacing.two,
  },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: Screen.horizontal, paddingBottom: Spacing.four, gap: Spacing.one },

  webOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  webScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  webPanel: {
    borderTopLeftRadius: Radius.heroSheet,
    borderTopRightRadius: Radius.heroSheet,
    paddingTop: 10,
    paddingBottom: Screen.bottom,
  },
  webHandle: { width: 34, height: 4, borderRadius: 2, alignSelf: 'center', opacity: 0.4, marginBottom: 14 },
});
