import { test, expect } from '@playwright/test'

test.describe('Halaman baru - auth redirect', () => {
  test('penerima redirect ke login jika belum auth', async ({ page }) => {
    await page.goto('/penerima')
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })

  test('sekolah redirect ke login jika belum auth', async ({ page }) => {
    await page.goto('/sekolah')
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })

  test('sppg redirect ke login jika belum auth', async ({ page }) => {
    await page.goto('/sppg')
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })

  test('users redirect ke login jika belum auth', async ({ page }) => {
    await page.goto('/users')
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })
})

test.describe('Login page', () => {
  test('menampilkan halaman login dengan form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('login gagal dengan kredensial salah', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    await emailInput.fill('salah@test.com')
    await passwordInput.fill('SalahPassword')
    const submitBtn = page.locator('button[type="submit"], button:has-text("Masuk"), button:has-text("Login")').first()
    await submitBtn.click()
    // Tetap di halaman login atau muncul pesan error
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('login')
  })
})