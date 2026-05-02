import { create } from 'zustand';
import { Expense } from '../services/ExpenseManager';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: (value?: string) => void;
}

export interface AlertConfig {
  title: string;
  message: string;
  buttons?: AlertButton[];
  showPrompt?: boolean;
  defaultValue?: string;
}

interface AppState {
  isAuthenticated: boolean;
  isFaceIdUnlocked: boolean;
  requireFaceId: boolean;
  enableLocationTracking: boolean;
  baseLocation: { latitude: number; longitude: number };
  baseCurrency: string;
  expenses: Expense[];
  categories: Category[];
  editingExpense: Expense | null;
  alert: AlertConfig | null;
  
  setAuthenticated: (status: boolean) => void;
  setFaceIdUnlocked: (status: boolean) => void;
  setRequireFaceId: (status: boolean) => void;
  setEnableLocationTracking: (status: boolean) => void;
  setBaseLocation: (loc: { latitude: number; longitude: number }) => void;
  setBaseCurrency: (currency: string) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpenseToStore: (expense: Expense) => void;
  updateExpenseInStore: (expense: Expense) => void;
  removeExpenseFromStore: (id: string) => void;
  addCategory: (category: Category) => void;
  setEditingExpense: (expense: Expense | null) => void;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  isFaceIdUnlocked: false,
  requireFaceId: true,
  enableLocationTracking: true,
  baseLocation: { latitude: 52.4064, longitude: 16.9252 }, // Познань
  baseCurrency: 'PLN',
  expenses: [],
  categories: [
    { id: '1', name: 'Продукти', icon: 'cart-outline' },
    { id: '2', name: 'Транспорт', icon: 'bus-outline' },
    { id: '3', name: 'Розваги', icon: 'game-controller-outline' },
    { id: '4', name: 'Кафе', icon: 'restaurant-outline' },
    { id: '5', name: 'Житло', icon: 'home-outline' },
  ],
  editingExpense: null,
  alert: null,

  setAuthenticated: (status) => set({ isAuthenticated: status }),
  setFaceIdUnlocked: (status) => set({ isFaceIdUnlocked: status }),
  setRequireFaceId: (status) => set({ requireFaceId: status }),
  setEnableLocationTracking: (status) => set({ enableLocationTracking: status }),
  setBaseLocation: (loc) => set({ baseLocation: loc }),
  setBaseCurrency: (currency) => set({ baseCurrency: currency }),
  setExpenses: (expenses) => set({ expenses }),
  addExpenseToStore: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  updateExpenseInStore: (expense) => set((state) => ({
    expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
  })),
  removeExpenseFromStore: (id) => set((state) => ({
    expenses: state.expenses.filter(e => e.id !== id)
  })),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  setEditingExpense: (expense) => set({ editingExpense: expense }),
  showAlert: (config) => set({ alert: config }),
  hideAlert: () => set({ alert: null }),
}));
