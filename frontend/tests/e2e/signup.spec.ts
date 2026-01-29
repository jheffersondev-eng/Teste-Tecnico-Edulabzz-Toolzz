import { test, expect } from '@playwright/test';

test('signup page loads', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('locale', 'pt');
  });

  await page.goto('/signup');

  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible();
  await expect(page.getByText('Comece sua jornada de conversas com IA')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
});
