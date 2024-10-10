// utils/formatCurrency.ts

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD', // Cambia a la moneda que prefieras, por ejemplo, 'EUR' para Euros
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  