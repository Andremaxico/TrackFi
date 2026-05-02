import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { expenseManager, Expense } from '../../src/services/ExpenseManager';
import { useAppStore } from '../../src/store/useAppStore';
import { theme } from '../../src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { expenses, setExpenses, baseCurrency, categories, removeExpenseFromStore, setEditingExpense, showAlert } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ category: string; total: number }[]>([]);

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat ? cat.icon : 'cash-outline';
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseManager.getCurrentMonthExpenses();
      setExpenses(data);
      
      const categoryStats = await expenseManager.getExpensesByCategory();
      setStats(categoryStats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleLongPress = (expense: Expense) => {
    showAlert({
      title: 'Дії з транзакцією',
      message: `${expense.category}: -${expense.amount} ${expense.currency}`,
      buttons: [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Редагувати', onPress: () => {
          setEditingExpense(expense);
          router.push('/(tabs)/add');
        }},
        { text: 'Видалити', style: 'destructive', onPress: () => {
          showAlert({
            title: 'Підтвердження',
            message: 'Ви впевнені, що хочете видалити цю витрату?',
            buttons: [
              { text: 'Ні', style: 'cancel' },
              { text: 'Так, видалити', style: 'destructive', onPress: async () => {
                  if (expense.id) {
                    await expenseManager.deleteExpense(expense.id);
                    removeExpenseFromStore(expense.id);
                    fetchExpenses(); // Refresh stats
                  }
              }}
            ]
          });
        }}
      ]
    });
  };

  const totalMonth = stats.reduce((acc, curr) => acc + curr.total, 0);

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = new Date(expense.created_at!).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchExpenses} tintColor={theme.colors.primary} />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.headerSubtitle}>Витрати цього місяця</Text>
        <Text style={styles.headerTitle}>{totalMonth.toFixed(2)} {baseCurrency}</Text>
      </View>

      <Text style={styles.sectionTitle}>За категоріями</Text>
      {stats.map((stat) => (
        <View key={stat.category} style={styles.statCard}>
          <View style={styles.row}>
            <Ionicons name={getCategoryIcon(stat.category) as any} size={24} color={theme.colors.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.statCategory}>{stat.category}</Text>
          </View>
          <Text style={styles.statTotal}>{stat.total.toFixed(2)} {baseCurrency}</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Останні транзакції</Text>
      
      {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
        <View key={date}>
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.dateLine} />
          </View>
          
          {dayExpenses.map((expense) => (
            <TouchableOpacity 
              key={expense.id} 
              style={styles.expenseCard}
              onLongPress={() => handleLongPress(expense)}
              delayLongPress={300}
            >
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name={getCategoryIcon(expense.category) as any} size={24} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                  <Text style={styles.expenseDate}>{new Date(expense.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <Text style={styles.expenseAmount}>- {expense.amount} {expense.currency}</Text>
                {expense.currency !== baseCurrency && (
                  <Text style={styles.expenseBaseAmount}>
                    (~ {expense.base_amount} {expense.base_currency})
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  headerCard: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: '#FFF',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  statCategory: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(70, 132, 50, 0.2)', // theme.colors.primary with opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statTotal: {
    ...theme.typography.h3,
    color: theme.colors.danger,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  expenseCategory: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  expenseDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  expenseAmount: {
    ...theme.typography.body,
    color: theme.colors.danger,
    fontWeight: 'bold',
  },
  expenseBaseAmount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    fontWeight: 'bold',
  },
});
