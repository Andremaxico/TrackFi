import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@currency_rates_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RatesCache {
  timestamp: number;
  rates: Record<string, number>;
  base: string;
}

class CurrencyManager {
  private static instance: CurrencyManager;
  private readonly API_URL = 'https://api.frankfurter.app/latest?from=USD';

  private constructor() {}

  public static getInstance(): CurrencyManager {
    if (!CurrencyManager.instance) {
      CurrencyManager.instance = new CurrencyManager();
    }
    return CurrencyManager.instance;
  }

  // Отримуємо курси валют (з кешу або API)
  private async getRates(): Promise<Record<string, number>> {
    try {
      const cachedString = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedString) {
        const cache: RatesCache = JSON.parse(cachedString);
        if (Date.now() - cache.timestamp < CACHE_EXPIRY_MS) {
          return cache.rates;
        }
      }

      // Якщо кеш порожній або старий — запит до API
      const response = await fetch(this.API_URL);
      const data = await response.json();
      
      const newCache: RatesCache = {
        timestamp: Date.now(),
        rates: data.rates,
        base: 'USD'
      };
      
      // Frankfurter не повертає USD до USD, додамо вручну
      newCache.rates['USD'] = 1;

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      return newCache.rates;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      // Fallback якщо немає інтернету і кешу: повертаємо порожній об'єкт
      return { 'USD': 1 };
    }
  }

  // Конвертація
  public async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const rates = await this.getRates();
    
    const rateFrom = rates[fromCurrency] || 1;
    const rateTo = rates[toCurrency] || 1;

    // Конвертуємо спочатку в базову валюту API (USD), потім в цільову
    const amountInUSD = amount / rateFrom;
    const result = amountInUSD * rateTo;

    return Number(result.toFixed(2));
  }
}

export const currencyManager = CurrencyManager.getInstance();
