import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/ui/pressable-scale';

import { Icon, type IconProps } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { withAlpha } from '@/constants/colors';
import { Radius } from '@/constants/radius';
import { useTheme } from '@/hooks/use-theme';

/**
 * The accent-tinted call-out — Home's "2 verification steps left", the bills screen's cashback note.
 *
 * Measured off `design/home/default.png`: an 83px-tall block, `#fcede9` fill with a 1px `#f3baac`
 * hairline (accent at roughly 10% and 30% over white), a filled accent disc holding the icon, an
 * accent bold title over a muted body, and a trailing chevron when it navigates.
 */
export function AlertBanner({
  icon = 'alert',
  title,
  body,
  onPress,
  /** `disc` fills a circle behind the icon (Home); `bare` draws it plain (bills cashback note). */
  iconStyle = 'disc',
  /** `positive` is the green cashback call-out on `design/utility/review-payment.png`. */
  tone = 'accent',
}: {
  icon?: IconProps['name'];
  title: string;
  body?: string;
  onPress?: () => void;
  iconStyle?: 'disc' | 'bare';
  tone?: 'accent' | 'positive';
}) {
  const theme = useTheme();
  const toneColour = tone === 'positive' ? theme.pos : theme.accent;

  const content = (
    <>
      {iconStyle === 'disc' ? (
        <View style={[styles.disc, { backgroundColor: toneColour }]}>
          <Icon name={icon} size={17} color={theme.onAccent} strokeWidth={2} />
        </View>
      ) : (
        <Icon name={icon} size={19} color={toneColour} strokeWidth={1.8} />
      )}

      <View style={styles.text}>
        <ThemedText type="alertTitle" style={{ color: toneColour }}>
          {title}
        </ThemedText>
        {body && (
          <ThemedText type="body" themeColor="mut" style={styles.body}>
            {body}
          </ThemedText>
        )}
      </View>

      {onPress && <Icon name="chevronRight" size={17} color={toneColour} strokeWidth={2.2} />}
    </>
  );

  const style = [styles.base, { backgroundColor: withAlpha(toneColour, 0.1), borderColor: withAlpha(toneColour, 0.3) }];

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <PressableScale onPress={onPress} disabled={!onPress} style={style}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: Radius.cardLg,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  disc: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: { flex: 1, minWidth: 0 },
  body: { marginTop: 3 },
});
