import { supabase } from './SupabaseClient';

export interface Expense {
  id?: string;
  user_id?: string;
  amount: number;
  currency: string;
  base_amount: number;
  base_currency: string;
  category: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

class ExpenseManager {
  private static instance: ExpenseManager;

  private constructor() {}

  public static getInstance(): ExpenseManager {
    if (!ExpenseManager.instance) {
      ExpenseManager.instance = new ExpenseManager();
    }
    return ExpenseManager.instance;
  }

  // Додавання нової витрати
  public async addExpense(expense: Expense): Promise<Expense | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not logged in');

    const expenseToInsert = {
      ...expense,
      user_id: userData.user.id,
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    return data;
  }

  // Отримання витрат поточного місяця
  public async getCurrentMonthExpenses(): Promise<Expense[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return data || [];
  }

  // Отримання витрат, згрупованих за категоріями (для діаграм)
  public async getExpensesByCategory(): Promise<{ category: string; total: number }[]> {
    const expenses = await this.getCurrentMonthExpenses();
    
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.base_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(grouped).map(key => ({
      category: key,
      total: grouped[key]
    }));
  }

  // Оновлення витрати
  public async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    return data;
  }

  // Видалення витрати
  public async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
}

export const expenseManager = ExpenseManager.getInstance();
