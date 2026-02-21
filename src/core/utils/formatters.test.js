import { describe, it, expect } from 'vitest';
import { formatCOP } from './formatters';

describe('Utility Formatters', () => {
    describe('formatCOP', () => {
        it('should format numbers to COP currency string', () => {
            const result = formatCOP(15000);
            // Validar que contenga el signo $ y los números con puntos, ignorando tipos de espacios
            expect(result).toMatch(/\$\s?15\.000/);
        });

        it('should handle zero correctly', () => {
            const result = formatCOP(0);
            expect(result).toMatch(/\$\s?0/);
        });

        it('should handle decimal values by rounding', () => {
            const result = formatCOP(1500.5);
            expect(result).toMatch(/\$\s?1\.501/);
        });
    });
});
