import { supabase } from './SupabaseClient';
import * as LocalAuthentication from 'expo-local-authentication';

class AuthManager {
  private static instance: AuthManager;

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Аутентифікація через FaceID / TouchID
  public async authenticateWithBiometrics(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Підтвердіть особу для доступу до TrackFi',
        fallbackLabel: 'Використати пароль',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric Auth Error:', error);
      return false;
    }
  }

  // Отримання поточної сесії Supabase
  public async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // Вихід
  public async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const authManager = AuthManager.getInstance();
