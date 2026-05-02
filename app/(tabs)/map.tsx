import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAppStore } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';

export default function MapScreen() {
  const { expenses, baseCurrency } = useAppStore();

  const mapExpenses = expenses.filter(e => e.latitude && e.longitude);

  const initialRegion = mapExpenses.length > 0 ? {
    latitude: mapExpenses[0].latitude!,
    longitude: mapExpenses[0].longitude!,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: 52.4064, // Познань за замовчуванням
    longitude: 16.9252,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        userInterfaceStyle="dark"
      >
        {mapExpenses.map((expense) => (
          <Marker
            key={expense.id}
            coordinate={{ latitude: expense.latitude!, longitude: expense.longitude! }}
            title={expense.category}
            description={`${expense.amount} ${expense.currency} (~${expense.base_amount} ${baseCurrency})`}
          />
        ))}
      </MapView>
      {mapExpenses.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Немає витрат з геолокацією</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  }
});
