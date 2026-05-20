import { test, expect } from '@playwright/test';

test.describe('Dish Management', () => {

  const prodAName = 'Ингредиент А';
  const prodBName = 'Ингредиент Б';
  const veganProdName = 'Веганский Продукт';
  const dishName = 'Тестовое Блюдо';

  test.beforeAll(async ({ playwright }) => {
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({ locale: 'ru-RU' });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/products/new');

    await page.getByPlaceholder('напр. Куриная грудка').fill(prodAName);
    await page.locator('input[type="number"]').nth(0).fill('100');
    await page.locator('input[type="number"]').nth(1).fill('10');
    await page.locator('input[type="number"]').nth(2).fill('5');
    await page.locator('input[type="number"]').nth(3).fill('2');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    await page.goto('http://localhost:5173/products/new');
    await page.getByPlaceholder('напр. Куриная грудка').fill(prodBName);
    await page.locator('input[type="number"]').nth(0).fill('200');
    await page.locator('input[type="number"]').nth(1).fill('5');
    await page.locator('input[type="number"]').nth(2).fill('10');
    await page.locator('input[type="number"]').nth(3).fill('20');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    await page.goto('http://localhost:5173/products/new');
    await page.getByPlaceholder('напр. Куриная грудка').fill(veganProdName);
    await page.locator('input[type="number"]').nth(0).fill('50');
    await page.locator('input[type="number"]').nth(1).fill('1');
    await page.locator('input[type="number"]').nth(2).fill('0');
    await page.locator('input[type="number"]').nth(3).fill('10');
    await page.click('button:has-text("Веган")');
    await page.click('button:has-text("Без сахара")');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    await browser.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dishes');
  });

  test('Automatic PFC calculation based on ingredients', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');
    await expect(page).toHaveURL('/dishes/new');

    await page.getByPlaceholder('напр. Куриная грудка').fill(dishName);

    await page.getByPlaceholder('Поиск продуктов...').fill(prodAName);
    await page.click(`button:has-text("${prodAName}")`);

    await page.getByPlaceholder('Поиск продуктов...').fill(prodBName);
    await page.click(`button:has-text("${prodBName}")`);

    await page.locator('input[type="number"]').nth(0).fill('150');
    await page.locator('input[type="number"]').nth(1).fill('50');

    await page.waitForTimeout(1000);

    const calPlaceholder = await page.locator('label:has-text("Калории") + input').getAttribute('placeholder');
    expect(Number(calPlaceholder)).toBeCloseTo(250.0, 1);

    const protPlaceholder = await page.locator('label:has-text("Белки") + input').getAttribute('placeholder');
    expect(Number(protPlaceholder)).toBeCloseTo(17.5, 1);

    const fatPlaceholder = await page.locator('label:has-text("Жиры") + input').getAttribute('placeholder');
    expect(Number(fatPlaceholder)).toBeCloseTo(12.5, 1);

    const carbPlaceholder = await page.locator('label:has-text("Углеводы") + input').getAttribute('placeholder');
    expect(Number(carbPlaceholder)).toBeCloseTo(13.0, 1);

    const portionPlaceholder = await page.locator('label:has-text("Вес порции") + input').getAttribute('placeholder');
    expect(Number(portionPlaceholder)).toBeCloseTo(200.0, 1);

    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dishes');
    await expect(page.locator(`text=${dishName}`)).toBeVisible();
  });

  test('Automatic category determination by macro', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');

    const macroNameInput = 'Супер Супец !суп';
    await page.getByPlaceholder('напр. Куриная грудка').fill(macroNameInput);

    const nameVal = await page.getByPlaceholder('напр. Куриная грудка').inputValue();
    expect(nameVal.trim()).toBe('Супер Супец');

    const soupButton = page.locator('button:has-text("Суп")');
    await expect(soupButton).toHaveClass(/bg-indigo-600/);
  });

  test('Manage dietary flags of a dish', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');

    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);

    const veganButton = page.locator('button:has-text("Веган")');
    const sugarFreeButton = page.locator('button:has-text("Без сахара")');
    const glutenFreeButton = page.locator('button:has-text("Без глютена")');

    await expect(veganButton).not.toHaveClass(/opacity-50/);
    await expect(sugarFreeButton).not.toHaveClass(/opacity-50/);
    await expect(glutenFreeButton).toHaveClass(/opacity-50/);

    await veganButton.click();
    await expect(veganButton).toHaveClass(/bg-emerald-500/);

    await page.getByPlaceholder('Поиск продуктов...').fill(prodAName);
    await page.click(`button:has-text("${prodAName}")`);

    await expect(veganButton).toHaveClass(/opacity-50/);
    await expect(veganButton).not.toHaveClass(/bg-emerald-500/);
  });

  test('Prevent deletion of a product used in a dish', async ({ page }) => {
    await page.goto('/products');
    await page.click(`text=${prodAName}`);

    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Не удалось удалить продукт');
      await dialog.accept();
    });

    await expect(page).toHaveURL(new RegExp(`/products/`));
    await expect(page.locator('h1')).toHaveText(prodAName);
  });

  test('Edit and delete a dish', async ({ page }) => {
    const localDishName = 'Блюдо для Редактирования';
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(localDishName);

    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);
    await page.locator('input[type="number"]').nth(0).fill('100');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.click(`text=${localDishName}`);
    await page.click('button:has-text("Редактировать")');

    const newDishName = 'Рецепт Изменен';
    await page.getByPlaceholder('напр. Куриная грудка').fill(newDishName);

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1')).toHaveText(newDishName);

    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');

    await expect(page).toHaveURL('/dishes');
    await expect(page.locator(`text=${newDishName}`)).not.toBeVisible();
  });

  test.afterAll(async ({ playwright }) => {
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext({ locale: 'ru-RU' });
    const page = await context.newPage();
    page.on('dialog', dialog => dialog.accept());

    try {
      await page.goto('http://localhost:5173/dishes');
      await page.click(`text=${dishName}`, { timeout: 3000 });
      await page.click('button:has-text("Удалить")');
      await page.waitForURL('**/dishes');
    } catch (e) {
      console.log(`Failed to clean up dish ${dishName}, maybe already deleted:`, e);
    }

    const toDelete = [prodAName, prodBName, veganProdName];
    for (const name of toDelete) {
      try {
        await page.goto('http://localhost:5173/products');
        await page.click(`text=${name}`, { timeout: 3000 });
        await page.click('button:has-text("Удалить")');
        await page.waitForURL('**/products');
      } catch (e) {
        console.log(`Failed to clean up product ${name}, maybe already deleted:`, e);
      }
    }

    await browser.close();
  });
});
