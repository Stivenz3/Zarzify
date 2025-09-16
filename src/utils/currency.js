// Configuración de divisas soportadas
export const CURRENCIES = {
  COP: {
    code: 'COP',
    name: 'Peso Colombiano',
    symbol: '$',
    locale: 'es-CO',
    decimals: 0
  },
  USD: {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    locale: 'en-US',
    decimals: 2
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'es-ES',
    decimals: 2
  },
  MXN: {
    code: 'MXN',
    name: 'Peso Mexicano',
    symbol: '$',
    locale: 'es-MX',
    decimals: 2
  },
  PEN: {
    code: 'PEN',
    name: 'Sol Peruano',
    symbol: 'S/',
    locale: 'es-PE',
    decimals: 2
  },
  ARS: {
    code: 'ARS',
    name: 'Peso Argentino',
    symbol: '$',
    locale: 'es-AR',
    decimals: 2
  },
  CLP: {
    code: 'CLP',
    name: 'Peso Chileno',
    symbol: '$',
    locale: 'es-CL',
    decimals: 0
  },
  VES: {
    code: 'VES',
    name: 'Bolívar Venezolano',
    symbol: 'Bs.',
    locale: 'es-VE',
    decimals: 2
  }
};

// Formatear número con divisa
export const formatCurrency = (amount, currencyCode = 'COP', showSymbol = true, showCode = true) => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.COP;
  const numericAmount = Number(amount) || 0;
  
  const formatted = numericAmount.toLocaleString(currency.locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals
  });
  
  if (showSymbol && showCode) {
    return `${currency.symbol} ${formatted} ${currency.code}`;
  } else if (showSymbol) {
    return `${currency.symbol} ${formatted}`;
  } else if (showCode) {
    return `${formatted} ${currency.code}`;
  }
  
  return formatted;
};

// Formatear solo número sin símbolo
export const formatNumber = (amount, currencyCode = 'COP') => {
  return formatCurrency(amount, currencyCode, false);
};

// Obtener símbolo de divisa
export const getCurrencySymbol = (currencyCode = 'COP') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.COP;
  return currency.symbol;
};

// Obtener nombre de divisa
export const getCurrencyName = (currencyCode = 'COP') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.COP;
  return currency.name;
};

// Obtener lista de divisas para select
export const getCurrencyOptions = () => {
  return Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.symbol})`,
    symbol: currency.symbol
  }));
};
