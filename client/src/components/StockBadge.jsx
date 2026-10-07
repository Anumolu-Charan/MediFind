import React from 'react';

export function StockBadge({ status, quantity, isRecentUpdate = false }) {
  const normStatus = (status || '').toLowerCase();
  const isInStock = normStatus === 'in stock';
  const isLowStock = normStatus === 'low stock';
  const isOutOfStock = normStatus === 'out of stock';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
        isRecentUpdate ? 'ring-2 ring-emerald-500 scale-105' : ''
      } ${
        isInStock
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : isLowStock
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isInStock
            ? 'bg-emerald-500 animate-pulse'
            : isLowStock
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />
      <span>
        {status}
        {quantity !== undefined && quantity !== null && ` (${quantity})`}
      </span>
    </span>
  );
}
