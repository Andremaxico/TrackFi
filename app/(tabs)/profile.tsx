import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../../src/services/SupabaseClient';
import { useAppStore } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

const AVAILABLE_CURRENCIES = ['PLN', 'UAH', 'USD', 'EUR', 'GBP'];

export default function ProfileScreen() {
  const { 
    requireFaceId, setRequireFaceId, 
    enableLocationTracking, setEnableLocationTracking,
    baseCurrency, setBaseCurrency, showAlert
  } = useAppStore();

  const handleLogout = async () => {
    showAlert({
      title: 'Вихід',
      message: 'Ви впевнені, що хочете вийти?',
      buttons: [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Вийти', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
        }}
      ]
    });
  };

  const changeCurrency = () => {
    showAlert({
      title: 'Базова валюта',
      message: `Введіть одну з: ${AVAILABLE_CURRENCIES.join(', ')}`,
      showPrompt: true,
      defaultValue: baseCurrency,
      buttons: [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Зберегти', onPress: (val) => {
          const curr = val?.toUpperCase().trim();
          if (curr && AVAILABLE_CURRENCIES.includes(curr)) {
            setBaseCurrency(curr);
          } else {
            showAlert({ title: 'Помилка', message: 'Невідома валюта' });
          }
        }}
      ]
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Налаштування</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Безпека</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="face-id" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.rowText}>Вхід за FaceID / TouchID</Text>
          </View>
          <Switch 
            value={requireFaceId} 
            onValueChange={setRequireFaceId} 
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Дані</Text>
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="location-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.rowText}>Зберігати геолокацію витрат</Text>
          </View>
          <Switch 
            value={enableLocationTracking} 
            onValueChange={setEnableLocationTracking} 
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <TouchableOpacity style={styles.row} onPress={changeCurrency}>
          <View style={styles.rowLeft}>
            <Ionicons name="cash-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.rowText}>Базова валюта</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.valueText}>{baseCurrency}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Вийти з акаунту</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.md,
  },
  rowText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 160, 46, 0.1)', // danger with opacity
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
  },
  logoutText: {
    ...theme.typography.h3,
    color: theme.colors.danger,
  }
});
