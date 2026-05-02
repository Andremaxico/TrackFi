import React, { useState } from 'react';
import * as Linking from 'expo-linking';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../src/services/SupabaseClient';
import { theme } from '../../src/theme/theme';
import { useAppStore } from '../../src/store/useAppStore';

export default function LoginScreen() {
  const { showAlert } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      showAlert({ title: 'Помилка', message: 'Будь ласка, введіть Email та Пароль' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showAlert({ title: 'Помилка входу', message: error.message });
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      showAlert({ title: 'Помилка', message: 'Будь ласка, введіть Email та Пароль' });
      return;
    }
    setLoading(true);
    
    // Створюємо правильне посилання для повернення в додаток (працює і в Expo Go, і в зібраному додатку)
    const redirectUrl = Linking.createURL('/');

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    
    if (error) showAlert({ title: 'Помилка реєстрації', message: error.message });
    else showAlert({ title: 'Успіх', message: 'Перевірте вашу пошту! Ми надіслали вам лінк для підтвердження акаунта.' });
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrackFi</Text>
      <Text style={styles.subtitle}>Керуйте своїми фінансами розумно</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={signInWithEmail}>
              <Text style={styles.buttonText}>Увійти</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={signUpWithEmail}>
              <Text style={styles.buttonTextSecondary}>Створити акаунт</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonText: {
    ...theme.typography.h3,
    color: '#FFF',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonTextSecondary: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
});
