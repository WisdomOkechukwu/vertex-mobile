import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Defs, Pattern, Rect, Circle, Svg } from 'react-native-svg';

import { SlideToSend } from '@/components/marketing/slide-to-send';
import { Avatar } from '@/components/ui/avatar';
import { Icon, type IconProps } from '@/components/ui/icon';
import { VertexMark } from '@/components/ui/vertex-mark';
import { ThemedText } from '@/components/themed-text';
import { accentDiscGradient, shadeAccent, withAlpha } from '@/constants/colors';
import { Radius } from '@/constants/theme';
import { useShadows } from '@/hooks/use-shadows';
import { useTheme } from '@/hooks/use-theme';
import type { TourVariant } from '@/constants/content';

/**
 * The mock-UI vignettes inside each feature tour's hero (each flow's `onboarding.png`). They are
 * illustrations, not working UI — nothing is interactive and nothing reads from a store.
 *
 * Each one positions itself: the send, links and rewards vignettes deliberately **bleed off the
 * right edge** (the hero clips them), the card stack is centred, and the bills grid sits on the
 * 24pt margins with no card behind it. That is how the references are composed.
 */

/** The dotted texture behind every hero — 21pt pitch, measured off `design/utility/onboarding.png`. */
export function DotGrid({ ink }: { ink: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id="tour-dots" width={21} height={21} patternUnits="userSpaceOnUse">
          <Circle cx={1.4} cy={1.4} r={1.4} fill={withAlpha(ink, 0.24)} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#tour-dots)" />
    </Svg>
  );
}

/** White card surface shared by the vignettes that use one. */
function ArtCard({ width, children }: { width: number; children: React.ReactNode }) {
  const theme = useTheme();
  const shadows = useShadows();
  return (
    <View style={[styles.card, { width, backgroundColor: theme.chip }, shadows.card]}>{children}</View>
  );
}

function Tag({ label, colour }: { label: string; colour: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: withAlpha(colour, 0.13) }]}>
      <ThemedText type="nano" style={{ color: colour }}>
        {label}
      </ThemedText>
    </View>
  );
}

/** `send money/onboarding.png` — recipient, amount, and the slide-to-send track. */
function SendMock() {
  const theme = useTheme();
  return (
    <ArtCard width={380}>
      <View style={styles.row}>
        <Avatar label="Nkem Obi" size={32} tint="#dfe7ff" />
        <View style={styles.rowText}>
          <ThemedText type="rowTitle">Nkem Obi</ThemedText>
          <ThemedText type="nano" themeColor="mut">
            GTBank · 01••••6789
          </ThemedText>
        </View>
        <Tag label="Verified" colour={theme.pos} />
      </View>

      <View style={[styles.rule, { backgroundColor: theme.line }]} />

      <View style={styles.amountRow}>
        <ThemedText type="artSymbol" themeColor="accent">
          ₦
        </ThemedText>
        <ThemedText type="artFigure">45,000</ThemedText>
      </View>

      <View style={styles.slideWrap}>
        <SlideToSend height={38} />
      </View>
    </ArtCard>
  );
}

/** `payment links/onboarding.png` — the link, what it has taken, and who paid. */
function LinksMock() {
  const theme = useTheme();
  const payers = [
    { name: 'Tunde Bello', amount: '+₦5,000', tint: '#e2f4e6' },
    { name: 'Zainab Ali', amount: '+₦2,000', tint: '#fff0cf' },
    { name: 'Emeka Nwosu', amount: '+₦1,500', tint: '#ffe3d8' },
  ];

  return (
    <ArtCard width={380}>
      <View style={styles.row}>
        <LinearGradient colors={accentDiscGradient(theme.accent)} style={styles.linkDisc}>
          <ThemedText type="micro" style={styles.onDark}>
            BC
          </ThemedText>
        </LinearGradient>
        <View style={styles.rowText}>
          <ThemedText type="rowTitle">Buy me a coffee</ThemedText>
          <ThemedText type="nano" themeColor="mut">
            vertex.ng/adaeze/coffee
          </ThemedText>
        </View>
        <ThemedText type="labelStrong" themeColor="pos">
          ₦8,500
        </ThemedText>
      </View>

      <View style={[styles.rule, { backgroundColor: theme.line }]} />

      <View style={styles.payerList}>
        {payers.map((payer) => (
          <View key={payer.name} style={styles.payerRow}>
            <Avatar label={payer.name} size={24} tint={payer.tint} />
            <ThemedText type="micro" style={styles.grow}>
              {payer.name}
            </ThemedText>
            <ThemedText type="micro" themeColor="pos">
              {payer.amount}
            </ThemedText>
          </View>
        ))}
      </View>
    </ArtCard>
  );
}

const CARD_FACES = [
  { label: 'Ads', colour: '#1b1917' },
  { label: 'Travel', colour: '#166b46' },
  { label: 'Subscriptions', colour: '#4338ca' },
  { label: 'Everyday', colour: '#1e40af' },
] as const;

/** `virtual card/onboarding.png` — four card faces fanned so only the front one is whole. */
function CardsMock() {
  const shadows = useShadows();

  return (
    <View style={styles.cardStack}>
      {CARD_FACES.map((face, i) => (
        <LinearGradient
          key={face.label}
          colors={[face.colour, shadeAccent(face.colour, 0.62)]}
          style={[styles.cardFace, { marginTop: i === 0 ? 0 : -160 }, i === CARD_FACES.length - 1 && shadows.card]}
        >
          <View style={styles.cardFaceHead}>
            <VertexMark size={15} color="#ffffff" />
            <ThemedText type="labelStrong" style={styles.onDark}>
              Vertex
            </ThemedText>
            <ThemedText type="micro" style={[styles.onDarkSoft, styles.faceLabel]}>
              {face.label}
            </ThemedText>
          </View>
          {i === CARD_FACES.length - 1 && (
            <ThemedText type="cardNumber" style={[styles.onDark, styles.cardNumber]}>
              •••• •••• •••• 2214
            </ThemedText>
          )}
        </LinearGradient>
      ))}
    </View>
  );
}

/** Three across the 24pt margins with an 11pt gutter — a fixed width overflows on a 390pt screen. */
const BILL_GAP = 11;
const BILL_TILE_WIDTH = (Dimensions.get('window').width - 48 - BILL_GAP * 2) / 3;

const BILL_TILES: { label: string; icon: IconProps['name'] }[] = [
  { label: 'Electricity', icon: 'bolt' },
  { label: 'Airtime', icon: 'phone' },
  { label: 'Data', icon: 'wifi' },
  { label: 'Cable TV', icon: 'tv' },
  { label: 'Water', icon: 'water' },
  { label: 'Internet', icon: 'globe' },
];

/** `utility/onboarding.png` — the category grid with the first tile filled in the accent. */
function BillsMock({ ink }: { ink: string }) {
  const theme = useTheme();

  return (
    <View style={styles.billGrid}>
      {BILL_TILES.map((tile, i) => {
        const active = i === 0;
        const content = (
          <>
            <Icon name={tile.icon} size={19} color={active ? theme.onAccent : ink} strokeWidth={1.9} />
            <ThemedText type="labelStrong" style={active ? styles.onDark : { color: ink }}>
              {tile.label}
            </ThemedText>
          </>
        );
        return active ? (
          <LinearGradient key={tile.label} colors={accentDiscGradient(theme.accent)} style={styles.billTile}>
            {content}
          </LinearGradient>
        ) : (
          <View key={tile.label} style={[styles.billTile, { backgroundColor: theme.card }]}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

/** Relative bar heights in the rewards chart; the sixth is the highlighted month. */
const REWARD_BARS = [14, 20, 12, 24, 16, 30, 16];

/** `security/rewards-onboarding.png` — cashback earned over a small monthly chart. */
function RewardsMock({ ink }: { ink: string }) {
  return (
    <ArtCard width={380}>
      <ThemedText type="micro" themeColor="mut">
        Cashback earned
      </ThemedText>
      <ThemedText type="stepHeader" style={[styles.rewardFigure, { color: ink }]}>
        ₦12,480
      </ThemedText>
      <View style={styles.barRow}>
        {REWARD_BARS.map((height, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height, backgroundColor: i === 5 ? ink : withAlpha(ink, 0.16) },
            ]}
          />
        ))}
      </View>
    </ArtCard>
  );
}

/** No reference exists for the swap tour; it follows the same vignette grammar as the others. */
function SwapMock({ ink }: { ink: string }) {
  const theme = useTheme();
  return (
    <ArtCard width={380}>
      <View style={styles.row}>
        <Avatar label="NGN" size={32} tint="#ffe3d8" />
        <View style={styles.rowText}>
          <ThemedText type="rowTitle">From NGN wallet</ThemedText>
          <ThemedText type="nano" themeColor="mut">
            ₦482,650.00 available
          </ThemedText>
        </View>
        <ThemedText type="labelStrong">₦150,000</ThemedText>
      </View>

      <View style={styles.swapDivider}>
        <View style={[styles.rule, styles.grow, { backgroundColor: theme.line }]} />
        <View style={[styles.swapKnob, { backgroundColor: withAlpha(ink, 0.13) }]}>
          <Icon name="swapVertical" size={16} color={ink} strokeWidth={2} />
        </View>
        <View style={[styles.rule, styles.grow, { backgroundColor: theme.line }]} />
      </View>

      <View style={styles.row}>
        <Avatar label="USD" size={32} tint="#dfe7ff" />
        <View style={styles.rowText}>
          <ThemedText type="rowTitle">To USD wallet</ThemedText>
          <ThemedText type="nano" themeColor="mut">
            1 USD ≈ ₦1,585.00
          </ThemedText>
        </View>
        <ThemedText type="labelStrong">$94.64</ThemedText>
      </View>
    </ArtCard>
  );
}

/** No reference exists for the add-money tour; same grammar, showing the funding routes. */
function DepositMock({ ink }: { ink: string }) {
  const theme = useTheme();
  const rows: { icon: IconProps['name']; title: string; meta: string }[] = [
    { icon: 'bank', title: 'Bank transfer', meta: 'Wema · 7011234567' },
    { icon: 'card', title: 'Debit card', meta: '•••• 4291 · Visa' },
    { icon: 'swap', title: 'Swap a wallet', meta: 'Live rate, no fee' },
  ];

  return (
    <ArtCard width={380}>
      <ThemedText type="micro" themeColor="mut">
        Add money to NGN
      </ThemedText>
      <View style={styles.depositList}>
        {rows.map((row) => (
          <View key={row.title} style={styles.row}>
            <View style={[styles.depositTile, { backgroundColor: withAlpha(ink, 0.13) }]}>
              <Icon name={row.icon} size={17} color={ink} strokeWidth={1.9} />
            </View>
            <View style={styles.rowText}>
              <ThemedText type="rowTitle">{row.title}</ThemedText>
              <ThemedText type="nano" themeColor="mut">
                {row.meta}
              </ThemedText>
            </View>
            <Icon name="chevronRight" size={16} color={theme.mut} strokeWidth={2.2} />
          </View>
        ))}
      </View>
    </ArtCard>
  );
}

/** No reference exists for the gifts tour; it follows the same vignette grammar as the others. */
function GiftsMock({ ink }: { ink: string }) {
  const theme = useTheme();
  return (
    <ArtCard width={380}>
      <View style={styles.row}>
        <Avatar label="Amazon" size={32} tint="#fff0cf" />
        <View style={{ flex: 1 }}>
          <ThemedText type="microStrong">Amazon</ThemedText>
          <ThemedText type="nano" themeColor="mut">
            $50 gift card
          </ThemedText>
        </View>
        <ThemedText type="microStrong" style={{ color: ink }}>
          ₦76,650
        </ThemedText>
      </View>
      <View style={[styles.giftCode, { backgroundColor: theme.key }]}>
        <ThemedText type="codeLabel" style={{ color: ink }}>
          AMZN-4F2K-9QT1
        </ThemedText>
      </View>
    </ArtCard>
  );
}

export function TourArt({ variant, ink }: { variant: TourVariant; ink: string }) {
  switch (variant) {
    case 'links':
      return <LinksMock />;
    case 'cards':
      return <CardsMock />;
    case 'bills':
      return <BillsMock ink={ink} />;
    case 'loyalty':
      return <RewardsMock ink={ink} />;
    case 'internal':
      return <SwapMock ink={ink} />;
    case 'deposit':
      return <DepositMock ink={ink} />;
    case 'gifts':
      return <GiftsMock ink={ink} />;
    default:
      return <SendMock />;
  }
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.cardLg, padding: 16, marginLeft: 26 },
  giftCode: { marginTop: 12, alignItems: 'center', paddingVertical: 11, borderRadius: Radius.crisp },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  grow: { flex: 1, minWidth: 0 },
  tag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill },
  rule: { height: 1, marginVertical: 14 },
  // Card faces and tinted heroes are dark in both schemes, so this ink does not flip.
  onDark: { color: '#ffffff' },
  onDarkSoft: { color: 'rgba(255,255,255,0.72)' },

  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  slideWrap: { marginTop: 16 },

  linkDisc: { width: 32, height: 32, borderRadius: Radius.crisp, alignItems: 'center', justifyContent: 'center' },
  payerList: { gap: 10 },
  payerRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },

  cardStack: { alignItems: 'center', marginTop: -34 },
  cardFace: { width: 215, height: 190, borderRadius: Radius.cardLg, padding: 15 },
  cardFaceHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  faceLabel: { flex: 1, textAlign: 'right' },
  cardNumber: { letterSpacing: 1, marginTop: 74 },

  billGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: BILL_GAP, paddingHorizontal: 24 },
  billTile: { width: BILL_TILE_WIDTH, height: 76, borderRadius: Radius.tile, padding: 13, justifyContent: 'space-between' },

  rewardFigure: { marginTop: 6 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 40, marginTop: 20 },
  bar: { flex: 1, borderRadius: 6 },

  swapDivider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swapKnob: { width: 30, height: 30, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },

  depositList: { gap: 16, marginTop: 14 },
  depositTile: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
