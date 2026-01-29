import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByText('ChatFlow © 2026 - Comunicação Inteligente em Tempo Real')
  ).toBeVisible();
});
