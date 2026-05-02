export const theme = {
  colors: {
    background: '#1A1C19', // Темний фон для контрасту
    card: '#242822', // Трохи світліший за фон
    primary: '#468432', // Темно-зелений
    secondary: '#9AD872', // Світло-зелений
    accent: '#FFEF91', // Жовтий
    danger: '#FFA02E', // Помаранчевий (використаємо замість червоного)
    text: '#F8FAFC',
    textSecondary: '#A0AAB2',
    border: '#333D31',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' as const },
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
  }
};
