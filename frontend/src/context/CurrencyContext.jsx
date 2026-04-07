import { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext({});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved || 'USD';
  });

  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.5,
    INR: 83.5,
    CAD: 1.35,
    AUD: 1.52,
    CNY: 7.25,
    SGD: 1.34
  });

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
  ];

  useEffect(() => {
    localStorage.setItem('currency', currency);
    const selected = currencies.find(c => c.code === currency);
    setCurrencySymbol(selected?.symbol || '$');
  }, [currency]);

  const convertAmount = (amount) => {
    if (!amount) return 0;
    const rate = exchangeRates[currency] || 1;
    return amount * rate;
  };

  const formatCurrency = (amount) => {
    const converted = convertAmount(amount);
    return `${currencySymbol}${converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencySymbol,
      currencies,
      formatCurrency,
      convertAmount,
      changeCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};