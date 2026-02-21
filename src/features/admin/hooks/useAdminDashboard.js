import { useState, useEffect } from 'react';
import { analyticsService } from '@api/analyticsService';
import { orderService } from '@checkout/services/orderService';
import { Analytics } from '@api/Analytics';
import { Order } from '@checkout/models/Order';

/**
 * useAdminDashboard Hook (Controller)
 * Manages the data and state for the Admin Dashboard.
 */
export const useAdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Metrics
            const rawMetrics = await analyticsService.getBusinessMetrics();
            setMetrics(Analytics.fromRaw(rawMetrics));

            // 2. Fetch Recent Orders (Mocking or using orderService if available)
            // For now, we take them from the same orders collection
            const allOrders = await orderService.getAllOrders();
            const orderInstances = allOrders.map(o => new Order(o));
            setRecentOrders(orderInstances.slice(0, 10)); // Take last 10

        } catch (err) {
            console.error("Dashboard controller error:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            await refreshData(); // Refresh metrics and list
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    return {
        metrics,
        recentOrders,
        loading,
        error,
        refreshData,
        updateOrderStatus
    };
};
