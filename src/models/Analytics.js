/**
 * Analytics Model
 * Encapsulates business metrics and provides formatting logic.
 */
export class Analytics {
    constructor(data = {}) {
        this.totalRevenue = Number(data.totalRevenue) || 0;
        this.totalOrders = Number(data.totalOrders) || 0;
        this.averageOrderValue = Number(data.averageOrderValue) || 0;
        this.todayRevenue = Number(data.todayRevenue) || 0;
        this.todayOrders = Number(data.todayOrders) || 0;
        this.monthRevenue = Number(data.monthRevenue) || 0;
        this.monthOrders = Number(data.monthOrders) || 0;
    }

    /**
     * Format currency values to COP
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    }

    getFormattedTotalRevenue() { return this.formatCurrency(this.totalRevenue); }
    getFormattedTodayRevenue() { return this.formatCurrency(this.todayRevenue); }
    getFormattedMonthRevenue() { return this.formatCurrency(this.monthRevenue); }
    getFormattedAvgOrder() { return this.formatCurrency(this.averageOrderValue); }

    /**
     * Factory method
     */
    static fromRaw(data) {
        return new Analytics(data);
    }
}
