import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ButtonPrimary } from '@/components/ui/button-primary';
import { Icon } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { Screen, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

export default function EditProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const [preferredName, setPreferredName] = useState(user?.profileName ?? '');
  const [tag, setTag] = useState(user?.profileTag ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 600);
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.flex}>
        <ScreenHeader title="Edit profile" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarWrap}>
            <Avatar label={preferredName || 'V'} size={84} />
            <Pressable style={[styles.cameraBadge, { backgroundColor: theme.accent, borderColor: theme.background }]}>
              <Icon name="camera" size={14} color={theme.onAccent} />
            </Pressable>
          </View>

          <TextField label="Preferred name" value={preferredName} onChangeText={setPreferredName} autoCapitalize="words" />
          <TextField label="Vertex tag" value={tag} onChangeText={setTag} placeholder="@yourtag" autoCapitalize="none" />
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <InfoBanner text={`Legal name ${user?.fullName ?? ''} is locked to your BVN/NIN records.`} />
        </ScrollView>
        <View style={styles.footer}>
          <ButtonPrimary label="Save changes" onPress={onSave} loading={saving} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Screen.horizontal, gap: Spacing.two },
  avatarWrap: { alignSelf: 'center', marginBottom: Spacing.two },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: Screen.horizontal, paddingBottom: Screen.bottom },
});
