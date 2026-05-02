import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { authManager } from '../src/services/AuthManager';
import { useAppStore } from '../src/store/useAppStore';
import { theme } from '../src/theme/theme';

export default function LockedScreen() {
  const setFaceIdUnlocked = useAppStore((state) => state.setFaceIdUnlocked);

  const handleUnlock = async () => {
    const success = await authManager.authenticateWithBiometrics();
    if (success) {
      setFaceIdUnlocked(true);
    }
  };

  useEffect(() => {
    // Автоматично пробуємо розблокувати при відкритті екрану
    handleUnlock();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>Додаток заблоковано</Text>
      <Text style={styles.subtitle}>Використайте FaceID / TouchID для доступу</Text>

      <TouchableOpacity style={styles.button} onPress={handleUnlock}>
        <Text style={styles.buttonText}>Розблокувати</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => authManager.signOut()}>
        <Text style={styles.logoutText}>Вийти з акаунту</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  buttonText: {
    ...theme.typography.h3,
    color: '#FFF',
  },
  logoutButton: {
    marginTop: theme.spacing.xxl,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
});
