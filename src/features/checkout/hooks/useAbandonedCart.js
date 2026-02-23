import { useEffect } from 'react';
import { abandonedCartService } from '@checkout/services/abandonedCartService';
import { createLogger } from '@core/utils/Logger';

const logger = createLogger('useAbandonedCart');

/**
 * useAbandonedCart
 * Sincroniza el carrito con Firestore (para recuperación de abandono)
 * usando debounce de 2 segundos para evitar escrituras excesivas.
 */
export const useAbandonedCart = ({ user, cart, email, finalTotal }) => {
    useEffect(() => {
        if (!email || cart.length === 0 || !user) return;

        const saveCart = async () => {
            try {
                await abandonedCartService.saveAbandonedCart(
                    user.uid,
                    cart,
                    email,
                    finalTotal
                );
            } catch (error) {
                logger.warn('Error guardando carrito abandonado', error);
            }
        };

        const timeoutId = setTimeout(saveCart, 2000);
        return () => clearTimeout(timeoutId);
    }, [email, cart, user, finalTotal]);
};
