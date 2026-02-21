import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
    test('should redirect to login when unauthenticated', async ({ page }) => {
        // Escenario: El usuario intenta entrar a checkout sin sesión
        await page.goto('/checkout');

        // Esperamos que PrivateRoute redirija a /login
        await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

        // Validar que el componente de login esté presente (un locator genérico de la página de auth)
        const loginTitle = page.locator('text=INICIAR SESIÓN');
        await expect(loginTitle).toBeVisible({ timeout: 10000 });
    });
});
