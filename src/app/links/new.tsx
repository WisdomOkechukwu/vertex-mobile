import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { SettingRow } from '@/components/ui/setting-row';
import { Skeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Screen } from '@/constants/theme';
import { useLinksHydrated } from '@/hooks/use-links-hydrated';
import { useTheme } from '@/hooks/use-theme';
import { formatMoneyCompact, linkSlug } from '@/lib/format';
import type { PaymentLink } from '@/services/types/links';
import { useAuthStore } from '@/stores/auth-store';
import { useLinksStore } from '@/stores/links-store';

/**
 * Create — and, from the detail screen's pencil, edit — a payment link. From
 * `design/payment links/create payment link.png` and its `Payer decides` variant: a gradient panel
 * previewing the link as you type, the title, the amount mode, then the three option switches.
 *
 * There is no reference for an edit screen, so editing is this same form with the link's values
 * seeded in and the header and CTA reworded, rather than a second screen to keep in sync.
 */
export default function NewPaymentLinkScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const hydrating = useLinksHydrated();
  const link = useLinksStore((s) => s.links.find((l) => l.id === id));

  // Editing can be entered on a cold store (deep link, web reload), so wait for the list rather
  // than seeding the form from nothing.
  if (id && !link) {
    return (
      <Screenful title="Edit payment link">
        {hydrating ? (
          <View style={styles.loading}>
            <Skeleton height={127} radius={Radius.hero} />
            <Skeleton height={54} radius={Radius.field} />
            <Skeleton height={50} radius={Radius.pill} />
          </View>
        ) : (
          <EmptyState icon="link" title="Link not found" />
        )}
      </Screenful>
    );
  }

  // Keyed on the link so the form's `useState` initialisers seed themselves, rather than a
  // setState-in-effect once the store resolves.
  return <LinkForm key={link?.id ?? 'new'} link={link} />;
}

/** The screen chrome the loading and not-found states share with the form. */
function Screenful({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title={title} />
        <View style={styles.stateWrap}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

function LinkForm({ link }: { link?: PaymentLink }) {
  const theme = useTheme();
  const createLink = useLinksStore((s) => s.createLink);
  const updateLink = useLinksStore((s) => s.updateLink);
  const tag = useAuthStore((s) => s.user?.profileTag) ?? 'you';

  const [title, setTitle] = useState(link?.title ?? '');
  const [amountMode, setAmountMode] = useState<'fixed' | 'open'>(
    link && link.amount === 0 ? 'open' : 'fixed'
  );
  const [amount, setAmount] = useState(link && link.amount > 0 ? String(link.amount) : '');
  const [collectName, setCollectName] = useState(link?.collectName ?? true);
  const [allowReuse, setAllowReuse] = useState(link?.allowReuse ?? true);
  const [notify, setNotify] = useState(link?.notify ?? true);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    setSaving(true);
    try {
      const draft = {
        title: title.trim(),
        amount: amountMode === 'fixed' ? Number(amount) : undefined,
        collectName,
        allowReuse,
        notify,
      };
      if (link) {
        await updateLink(link.id, draft);
        router.back();
      } else {
        const created = await createLink(draft);
        router.replace(`/links/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const previewAmount =
    amountMode === 'open' ? 'Payer decides' : formatMoneyCompact(Number(amount) || 0, 'NGN');

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title={link ? 'Edit payment link' : 'New payment link'} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <LinearGradient
            colors={[theme.wash1, theme.wash2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.preview}
          >
            <ThemedText type="label" themeColor="mut">
              Preview
            </ThemedText>
            <ThemedText type="greeting" numberOfLines={2}>
              {title || 'What are you collecting for?'}
            </ThemedText>
            <ThemedText type="screenTitle" themeColor="accent" numberOfLines={1}>
              {previewAmount}
            </ThemedText>
            <ThemedText type="body" themeColor="mut" numberOfLines={1}>
              {linkSlug(tag, title)}
            </ThemedText>
          </LinearGradient>

          <TextField
            label="What is it for"
            value={title}
            onChangeText={setTitle}
            placeholder="Design retainer, Ankara dress, event ticket…"
            autoCapitalize="sentences"
          />

          <View style={styles.group}>
            <ThemedText type="fieldLabel" themeColor="mut">
              Amount
            </ThemedText>
            <SegmentedToggle
              options={[
                { label: 'Fixed amount', value: 'fixed' as const },
                { label: 'Payer decides', value: 'open' as const },
              ]}
              value={amountMode}
              onChange={setAmountMode}
            />
            {/* The `Payer decides` reference drops the field entirely rather than disabling it. */}
            {amountMode === 'fixed' && (
              <TextField
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                prefix="₦"
                prefixTone="accent"
                prefixRule={false}
              />
            )}
          </View>

          <View style={styles.group}>
            <ThemedText type="fieldLabel" themeColor="mut">
              Options
            </ThemedText>
            <View style={styles.options}>
              <SettingRow
                title="Collect payer’s name"
                subtitle="Shown on the payment in your history"
                value={collectName}
                onValueChange={setCollectName}
              />
              <SettingRow
                title="Reusable link"
                subtitle="Off means it closes after one payment"
                value={allowReuse}
                onValueChange={setAllowReuse}
              />
              <SettingRow
                title="Notify me on every payment"
                subtitle="Push and email as money lands"
                value={notify}
                onValueChange={setNotify}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary
            label={link ? 'Save changes' : 'Create link'}
            onPress={onSubmit}
            loading={saving}
            disabled={!title.trim() || (amountMode === 'fixed' && !Number(amount))}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: 32, gap: 18 },
  preview: { borderRadius: Radius.hero, padding: 20, gap: 6 },
  /** A label and the control it belongs to sit 8pt apart, matching `TextField`'s own spacing. */
  group: { gap: 8 },
  options: { gap: Screen.rowGap },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 8 },

  stateWrap: { paddingHorizontal: Screen.horizontal },
  loading: { gap: 18 },
});
