import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { currencyManager } from '../../src/services/CurrencyManager';
import { expenseManager, Expense } from '../../src/services/ExpenseManager';
import { locationManager } from '../../src/services/LocationManager';
import { useAppStore, Category } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';
import { Ionicons } from '@expo/vector-icons';

const CURRENCIES = ['PLN', 'UAH', 'USD', 'EUR', 'GBP'];
const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

export default function AddExpenseScreen() {
  const router = useRouter();
  const { 
    baseCurrency, addExpenseToStore, updateExpenseInStore, 
    categories, addCategory, editingExpense, setEditingExpense,
    enableLocationTracking, baseLocation, showAlert
  } = useAppStore();

  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState(baseCurrency);
  const [category, setCategory] = useState<Category>(categories[0]);
  const [loading, setLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCurrency(editingExpense.currency);
      const cat = categories.find(c => c.name === editingExpense.category);
      if (cat) setCategory(cat);
    } else {
      setAmount('0');
      setCurrency(baseCurrency);
      setCategory(categories[0]);
    }
  }, [editingExpense]);

  const resetForm = () => {
    setAmount('0');
    setCurrency(baseCurrency);
    setCategory(categories[0]);
    setEditingExpense(null);
  };

  const handleNumpadPress = (val: string) => {
    if (val === '⌫') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      setAmount(prev => prev === '0' ? val : prev + val);
    }
  };

  const handleSave = async () => {
    if (!amount || amount === '0' || isNaN(Number(amount))) {
      showAlert({ title: 'Помилка', message: 'Введіть коректну суму' });
      return;
    }

    setLoading(true);
    try {
      let latitude = baseLocation.latitude;
      let longitude = baseLocation.longitude;

      if (enableLocationTracking) {
        const location = await locationManager.getCurrentLocation();
        if (location) {
          latitude = location.latitude;
          longitude = location.longitude;
        }
      }

      const numericAmount = Number(amount);
      const baseAmount = await currencyManager.convert(numericAmount, currency, baseCurrency);

      const newExpense: Expense = {
        amount: numericAmount,
        currency,
        base_amount: baseAmount,
        base_currency: baseCurrency,
        category: category.name,
        latitude,
        longitude,
      };

      if (editingExpense && editingExpense.id) {
        // Редагування
        const updatedExpense = await expenseManager.updateExpense(editingExpense.id, newExpense);
        if (updatedExpense) {
          updateExpenseInStore(updatedExpense);
          resetForm();
          router.push('/(tabs)');
        }
      } else {
        // Створення
        const savedExpense = await expenseManager.addExpense(newExpense);
        if (savedExpense) {
          addExpenseToStore(savedExpense);
          resetForm();
          router.push('/(tabs)');
        }
      }
    } catch (error) {
      showAlert({ title: 'Помилка', message: 'Не вдалося зберегти витрату' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    showAlert({
      title: 'Нова категорія',
      message: 'Введіть назву:',
      showPrompt: true,
      defaultValue: 'Назва...',
      buttons: [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Додати', onPress: (name) => {
            if (name) {
              const newCat = { id: Date.now().toString(), name, icon: 'star-outline' };
              addCategory(newCat);
              setCategory(newCat);
            }
          } 
        }
      ]
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{editingExpense ? 'Редагувати' : 'Нова витрата'}</Text>
          {editingExpense && (
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelEdit}>Скасувати</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Categories (horizontal scroll) */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[...categories, { id: 'add', name: 'Додати', icon: 'add-outline' }]}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              if (item.id === 'add') {
                return (
                  <TouchableOpacity style={styles.categoryItem} onPress={handleAddCategory}>
                    <View style={[styles.categoryIconBox, { backgroundColor: theme.colors.card }]}>
                      <Ionicons name="add" size={24} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.categoryText}>Додати</Text>
                  </TouchableOpacity>
                );
              }
              const isActive = category.id === item.id;
              return (
                <TouchableOpacity style={styles.categoryItem} onPress={() => setCategory(item as Category)}>
                  <View style={[styles.categoryIconBox, isActive && styles.categoryIconBoxActive]}>
                    <Ionicons name={item.icon as any} size={24} color={isActive ? '#FFF' : theme.colors.primary} />
                  </View>
                  <Text style={[styles.categoryText, isActive && { color: theme.colors.text }]}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={{ flex: 1 }} />

        {/* Input Area (pushed down) */}
        <View style={styles.inputArea}>
          <Text style={styles.amountText}>{amount}</Text>
          <TouchableOpacity style={styles.currencySelector} onPress={() => setShowCurrencyModal(true)}>
            <Text style={styles.currencyText}>{currency}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calculator Numpad */}
      <View style={styles.numpadContainer}>
        {NUMPAD.map((key) => (
          <TouchableOpacity key={key} style={styles.numKey} onPress={() => handleNumpadPress(key)}>
            {key === '⌫' ? (
              <Ionicons name="backspace-outline" size={28} color={theme.colors.text} />
            ) : (
              <Text style={styles.numText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
        
        {/* Smaller Save Button spanning bottom */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Зберегти</Text>}
        </TouchableOpacity>
      </View>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть валюту</Text>
            {CURRENCIES.map(curr => (
              <TouchableOpacity key={curr} style={styles.modalItem} onPress={() => { setCurrency(curr); setShowCurrencyModal(false); }}>
                <Text style={styles.modalItemText}>{curr}</Text>
                {currency === curr && <Ionicons name="checkmark" size={24} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setShowCurrencyModal(false)}>
              <Text style={{ color: theme.colors.danger, fontSize: 18 }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  cancelEdit: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  categoriesWrapper: {
    marginBottom: theme.spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  categoryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(70, 132, 50, 0.2)', // theme primary light
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryIconBoxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.secondary,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  currencyText: {
    ...theme.typography.h3,
    color: theme.colors.accent,
    marginRight: 4,
  },
  numpadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.sm,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  numKey: {
    width: '33.33%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    fontSize: 28,
    fontWeight: '500',
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: '5%',
    width: '90%',
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl, // For safe area
  },
  saveButtonText: {
    ...theme.typography.h3,
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalItemText: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
});
