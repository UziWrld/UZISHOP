/**
 * Formats a number as Colombian Pesos (COP)
 * Example: 50000 -> "$ 50.000"
 */
export const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('COP', '$').trim();
};
