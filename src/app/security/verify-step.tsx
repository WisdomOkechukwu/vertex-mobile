import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/ui/toast';
import { Radius, Screen, withAlpha } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';
import { isLoading } from '@/lib/api-status';
import { VERIFICATION_COPY } from '@/services/mock/data/security';
import { useSecurityStore } from '@/stores/security-store';

/**
 * `design/home/verification-2 on click of the nin and bvn.png` and `verification-3a/3b on click of
 * the home address.png`.
 *
 * The per-step copy — headline, blurb, footnote and CTA — comes from `VERIFICATION_COPY`, which the
 * design defines and an earlier build never read: every step showed the same "Submit for review".
 * Prefilled field values come through too, so BVN and date of birth arrive already known.
 *
 * The address step alone carries a map picker and a proof-of-address dropzone.
 */
export default function VerifyStepScreen() {
  const theme = useTheme();
  const shadows = useShadows();
  const { show } = useToast();
  const { key } = useLocalSearchParams<{ key: string }>();
  const verificationSteps = useSecurityStore((s) => s.verificationSteps);
  const status = useSecurityStore((s) => s.status);
  const fetchVerification = useSecurityStore((s) => s.fetchVerification);
  const submitVerificationStep = useSecurityStore((s) => s.submitVerificationStep);

  const [edits, setEdits] = useState<Record<string, string>>({});
  const [proof, setProof] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (verificationSteps.length === 0) fetchVerification();
  }, [verificationSteps.length, fetchVerification]);

  // Deep-linked, the store is cold: the header read a generic "Verify" over an empty form, then
  // re-titled itself once the step arrived.
  const loading = verificationSteps.length === 0 && isLoading(status);
  const step = verificationSteps.find((s) => s.key === key);
  const copy = key ? VERIFICATION_COPY[key] : undefined;
  const isAddress = key === 'address';

  /**
   * The step's own prefills, overlaid with anything typed since. Derived rather than seeded into
   * state, so it stays correct when the step arrives after the first render.
   */
  const values = useMemo(() => {
    const base: Record<string, string> = {};
    for (const f of step?.fields ?? []) base[f.label] = f.value;
    return { ...base, ...edits };
  }, [step, edits]);

  const fieldsFilled = (step?.fields ?? []).every((f) => (values[f.label] ?? '').trim().length > 1);
  const canSubmit = fieldsFilled && (!isAddress || !!proof);

  const onSubmit = async () => {
    if (!step) return;
    setSubmitting(true);
    try {
      await submitVerificationStep(step.key, values);
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScreenHeader title={step?.label ?? 'Verify'} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <>
              <View style={styles.head}>
                <Skeleton width="70%" height={26} />
                <Skeleton width="90%" height={15} />
              </View>
              <View style={styles.fields}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={54} radius={Radius.field} />
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.head}>
                <ThemedText type="stepHeader">{copy?.head ?? step?.label ?? 'Verify'}</ThemedText>
                <ThemedText type="bodyLg" themeColor="mut" style={styles.blurb}>
                  {copy?.blurb ?? step?.desc ?? ''}
                </ThemedText>
              </View>

              <View style={styles.fields}>
                {step?.fields.map((f) => (
                  <TextField
                    key={f.label}
                    label={f.label}
                    value={values[f.label] ?? ''}
                    onChangeText={(v) => setEdits((prev) => ({ ...prev, [f.label]: v }))}
                    placeholder={f.ph}
                    autoCapitalize="words"
                  />
                ))}
              </View>
            </>
          )}

          {isAddress && (
            <>
              <View style={styles.block}>
                <ThemedText type="fieldLabel" themeColor="mut">
                  Pin your location
                </ThemedText>
                {/* A placeholder map: a grid with one crossing road, as the reference draws it. No
                    map SDK is a dependency yet, so this stands in without pretending to be live. */}
                <View style={[styles.map, { backgroundColor: theme.card }]}>
                  <View style={styles.mapGrid}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <View key={i} style={[styles.mapCell, { borderColor: theme.line }]} />
                    ))}
                  </View>
                  <View style={[styles.road, styles.roadH, { backgroundColor: theme.line }]} />
                  <View style={[styles.road, styles.roadV, { backgroundColor: theme.line }]} />
                  <Pressable
                    onPress={() => show('Location pinned to your current position', 'success')}
                    style={({ pressed }) => [
                      styles.locateBtn,
                      { backgroundColor: theme.chip },
                      shadows.raised,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Icon name="pin" size={16} color={theme.accent} strokeWidth={2.2} />
                    <ThemedText type="labelStrong" themeColor="accent">
                      Use my current location
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.block}>
                <ThemedText type="fieldLabel" themeColor="mut">
                  Proof of address
                </ThemedText>
                <Pressable
                  onPress={() => {
                    // No document picker is wired yet; record the intent so the CTA can unlock and
                    // the flow stays walkable end to end.
                    setProof('utility-bill.pdf');
                    show('Document attached', 'success');
                  }}
                  style={({ pressed }) => [
                    styles.drop,
                    {
                      borderColor: proof ? theme.accent : theme.line,
                      backgroundColor: proof ? withAlpha(theme.accent, 0.06) : 'transparent',
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Icon name={proof ? 'check' : 'upload'} size={22} color={theme.accent} strokeWidth={2.1} />
                  <ThemedText type="rowTitle">
                    {proof ?? 'Upload a utility bill or statement'}
                  </ThemedText>
                  <ThemedText type="body" themeColor="mut">
                    {proof ? 'Tap to replace' : 'PDF, JPG or PNG · up to 10 MB'}
                  </ThemedText>
                </Pressable>
              </View>
            </>
          )}

          {!!copy?.note && (
            <View style={[styles.note, { backgroundColor: theme.card }]}>
              <Icon name="shield2" size={16} color={theme.accent} strokeWidth={2} />
              <ThemedText type="body" themeColor="mut" style={styles.noteText}>
                {copy.note}
              </ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary
            label={copy?.cta ?? 'Submit for review'}
            onPress={onSubmit}
            loading={submitting}
            disabled={!canSubmit}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, paddingBottom: 100, gap: 22 },

  head: { gap: 8 },
  blurb: { lineHeight: 20.8 },

  fields: { gap: Screen.fieldGap },
  block: { gap: 8 },

  map: { height: 150, borderRadius: Radius.card, overflow: 'hidden', justifyContent: 'flex-end' },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' },
  mapCell: { width: '16.666%', height: '25%', borderRightWidth: 1, borderBottomWidth: 1 },
  road: { position: 'absolute' },
  roadH: { left: 18, right: '38%', top: '46%', height: 5, borderRadius: 3 },
  roadV: { top: 8, bottom: '20%', left: '62%', width: 5, borderRadius: 3 },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    margin: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: Radius.pill,
  },

  drop: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 26,
    paddingHorizontal: 18,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },

  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: Radius.rounded,
    alignItems: 'flex-start',
  },
  noteText: { flex: 1, lineHeight: 18.4 },

  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom, paddingTop: 8 },
});
