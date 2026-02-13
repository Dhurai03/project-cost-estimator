import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector = () => {
  const { currency, currencies, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const selectedCurrency = currencies.find(c => c.code === currency);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1E252E] border border-[#2A313C] 
                 rounded-md text-sm text-white hover:bg-[#2A313C] transition-all duration-200"
      >
        <span className="text-lg">{selectedCurrency?.symbol}</span>
        <span className="font-medium">{selectedCurrency?.code}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-64 bg-[#151A22] border border-[#2A313C] 
                        rounded-lg shadow-xl z-50 py-2">
            <div className="px-4 py-2 border-b border-[#2A313C]">
              <h3 className="text-xs font-medium text-gray-400">Select Currency</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    changeCurrency(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 
                           text-sm hover:bg-[#1E252E] transition-all duration-200
                           ${currency === curr.code ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{curr.symbol}</span>
                    <span className="font-medium">{curr.code}</span>
                    <span className="text-xs text-gray-500">{curr.name}</span>
                  </div>
                  {currency === curr.code && (
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;