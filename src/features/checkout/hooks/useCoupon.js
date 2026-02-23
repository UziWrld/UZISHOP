import { useState } from 'react';
import { couponService } from '@checkout/services/couponService';
import { Coupon } from '@checkout/models/Coupon';
import { createLogger } from '@core/utils/Logger';

const logger = createLogger('useCoupon');

/**
 * useCoupon
 * Encapsula todo el estado y la lógica de cupones en el flujo de checkout.
 */
export const useCoupon = (totalAmount, userId) => {
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const applyCoupon = async (code) => {
        try {
            const data = await couponService.validateCoupon(code, totalAmount, userId);
            const model = new Coupon(data);
            setCouponData(model);
            setDiscountAmount(model.calculateDiscount(totalAmount));
            logger.info(`Cupón aplicado: ${model.code}`);
            return { success: true, message: `Cupón ${model.code} aplicado` };
        } catch (error) {
            setCouponData(null);
            setDiscountAmount(0);
            logger.warn('Cupón inválido', error);
            return { success: false, message: error.message };
        }
    };

    const removeCoupon = () => {
        setCouponData(null);
        setCouponCode('');
        setDiscountAmount(0);
    };

    return {
        couponCode,
        setCouponCode,
        couponData,
        discountAmount,
        applyCoupon,
        removeCoupon
    };
};
