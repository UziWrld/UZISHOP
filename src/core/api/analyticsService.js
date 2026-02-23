import { db } from "@core/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createLogger } from "@core/utils/Logger";

const logger = createLogger('analyticsService');
const ORDERS_COLLECTION = "orders";

export const analyticsService = {
    /**
     * Obtener ingresos totales en un rango de fechas
     * @param {Date} startDate - Fecha inicial
     * @param {Date} endDate - Fecha final
     * @returns {number} - Total de ingresos
     */
    getTotalRevenue: async (startDate = null, endDate = null) => {
        try {
            let q = collection(db, ORDERS_COLLECTION);

            // Si hay fechas, filtrar
            if (startDate && endDate) {
                q = query(
                    collection(db, ORDERS_COLLECTION),
                    where("createdAt", ">=", startDate),
                    where("createdAt", "<=", endDate)
                );
            }

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => doc.data());

            // Sumar solo pedidos que no estén cancelados
            const revenue = orders
                .filter(order => order.status !== 'cancelado')
                .reduce((sum, order) => sum + (order.total || 0), 0);

            return revenue;
        } catch (error) {
            logger.error('Analytics error', error);
            return 0;
        }
    },

    /**
     * Obtener productos más vendidos
     * @param {number} limit - Número de productos a retornar
     * @returns {Array} - Lista de productos con cantidad vendida
     */
    getTopSellingProducts: async (limit = 10) => {
        try {
            const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
            const orders = snapshot.docs.map(doc => doc.data());

            // Contar productos vendidos
            const productSales = {};

            orders
                .filter(order => order.status !== 'cancelado')
                .forEach(order => {
                    order.items?.forEach(item => {
                        const key = item.id || item.name;
                        if (!productSales[key]) {
                            productSales[key] = {
                                id: item.id,
                                name: item.name,
                                image: item.image,
                                totalQuantity: 0,
                                totalRevenue: 0
                            };
                        }
                        productSales[key].totalQuantity += item.quantity;
                        productSales[key].totalRevenue += (item.price * item.quantity);
                    });
                });

            // Convertir a array y ordenar
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.totalQuantity - a.totalQuantity)
                .slice(0, limit);

            return topProducts;
        } catch (error) {
            logger.error('Error getting top selling products', error);
            return [];
        }
    },

    /**
     * Obtener ventas agrupadas por fecha
     * @param {Date} startDate - Fecha inicial
     * @param {Date} endDate - Fecha final
     * @returns {Array} - Ventas por día
     */
    getSalesByDate: async (startDate, endDate) => {
        try {
            const q = query(
                collection(db, ORDERS_COLLECTION),
                where("createdAt", ">=", startDate),
                where("createdAt", "<=", endDate)
            );

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));

            // Agrupar por fecha
            const salesByDate = {};

            orders
                .filter(order => order.status !== 'cancelado')
                .forEach(order => {
                    const date = order.createdAt?.toDate
                        ? order.createdAt.toDate().toISOString().split('T')[0]
                        : new Date(order.createdAt).toISOString().split('T')[0];

                    if (!salesByDate[date]) {
                        salesByDate[date] = {
                            date,
                            revenue: 0,
                            orders: 0
                        };
                    }

                    salesByDate[date].revenue += order.total;
                    salesByDate[date].orders += 1;
                });

            // Convertir a array y ordenar por fecha
            return Object.values(salesByDate).sort((a, b) =>
                new Date(a.date) - new Date(b.date)
            );
        } catch (error) {
            logger.error('Error getting sales by date', error);
            return [];
        }
    },

    /**
     * Obtener estadísticas de pedidos por estado
     * @returns {Object} - Conteo de pedidos por estado
     */
    getOrderStats: async () => {
        try {
            const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
            const orders = snapshot.docs.map(doc => doc.data());

            const stats = {
                total: orders.length,
                enPreparacion: 0,
                enviado: 0,
                entregado: 0,
                cancelado: 0
            };

            orders.forEach(order => {
                switch (order.status) {
                    case 'en preparacion':
                        stats.enPreparacion++;
                        break;
                    case 'enviado':
                        stats.enviado++;
                        break;
                    case 'entregado':
                        stats.entregado++;
                        break;
                    case 'cancelado':
                        stats.cancelado++;
                        break;
                }
            });

            return stats;
        } catch (error) {
            logger.error('Error getting order stats', error);
            return {
                total: 0,
                enPreparacion: 0,
                enviado: 0,
                entregado: 0,
                cancelado: 0
            };
        }
    },

    /**
     * Obtener métricas generales del negocio
     * @returns {Object} - Métricas clave
     */
    getBusinessMetrics: async () => {
        try {
            const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
            const orders = snapshot.docs.map(doc => doc.data());

            const validOrders = orders.filter(o => o.status !== 'cancelado');

            // Calcular métricas
            const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const averageOrderValue = validOrders.length > 0
                ? totalRevenue / validOrders.length
                : 0;

            // Ventas de hoy
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = validOrders.filter(order => {
                const orderDate = order.createdAt?.toDate
                    ? order.createdAt.toDate()
                    : new Date(order.createdAt);
                return orderDate >= today;
            });
            const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

            // Ventas del mes
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthOrders = validOrders.filter(order => {
                const orderDate = order.createdAt?.toDate
                    ? order.createdAt.toDate()
                    : new Date(order.createdAt);
                return orderDate >= firstDayOfMonth;
            });
            const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);

            return {
                totalRevenue,
                totalOrders: validOrders.length,
                averageOrderValue,
                todayRevenue,
                todayOrders: todayOrders.length,
                monthRevenue,
                monthOrders: monthOrders.length
            };
        } catch (error) {
            logger.error('Error getting business metrics', error);
            return {
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                todayRevenue: 0,
                todayOrders: 0,
                monthRevenue: 0,
                monthOrders: 0
            };
        }
    },

    /**
     * Obtener estadísticas de rendimiento de productos (Vistas, Ventas, Menos Interés)
     */
    getProductPerformanceStats: async (limit = 5) => {
        try {
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 1. Más Vistos (Sort by views DESC)
            const mostViewed = [...products]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, limit);

            // 2. Más Vendidos (Sort by soldCount DESC)
            const mostSold = [...products]
                .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
                .slice(0, limit);

            // 3. Menos Interés (Sort by views + soldCount ASC)
            // Weighting: low views AND low sales
            const leastInterest = [...products]
                .sort((a, b) => ((a.views || 0) + (a.soldCount || 0) * 5) - ((b.views || 0) + (b.soldCount || 0) * 5))
                .slice(0, limit);

            return {
                mostViewed,
                mostSold,
                leastInterest
            };
        } catch (error) {
            logger.error('Error getting product performance stats', error);
            return { mostViewed: [], mostSold: [], leastInterest: [] };
        }
    }
};
