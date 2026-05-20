import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('Product name length validation (BVA: 1 char vs 2 chars)', async ({ page }) => {
    await page.click('button:has-text("Создать новый продукт")');
    await expect(page).toHaveURL('/products/new');

    await page.getByPlaceholder('напр. Куриная грудка').fill('А');
    await page.locator('input[type="number"]').nth(0).fill('100');
    await page.locator('input[type="number"]').nth(1).fill('10');
    await page.locator('input[type="number"]').nth(2).fill('5');
    await page.locator('input[type="number"]').nth(3).fill('2');

    await page.click('button:has-text("Создать продукт")');

    const errorAlert = page.locator('div.bg-red-50');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Название должно быть не менее 2 символов');

    await page.getByPlaceholder('напр. Куриная грудка').fill('Аб');
    await page.click('button:has-text("Создать продукт")');

    await expect(page).toHaveURL('/products');

    await page.click('text=Аб');
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/products');
  });

  test('PFC sum validation (BVA: 100.0g vs 100.1g)', async ({ page }) => {
    await page.click('button:has-text("Создать новый продукт")');

    const testName = 'Тест БЖУ';
    await page.getByPlaceholder('напр. Куриная грудка').fill(testName);
    await page.locator('input[type="number"]').nth(0).fill('150');

    await page.locator('input[type="number"]').nth(1).fill('40');
    await page.locator('input[type="number"]').nth(2).fill('30');
    await page.locator('input[type="number"]').nth(3).fill('30.1');

    await page.click('button:has-text("Создать продукт")');

    const errorAlert = page.locator('div.bg-red-50');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Сумма белков, жиров и углеводов не может превышать 100г');

    await page.locator('input[type="number"]').nth(3).fill('30');

    await page.click('button:has-text("Создать продукт")');
    await expect(page).toHaveURL('/products');

    await page.click(`text=${testName}`);
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/products');
  });

  const testData = [
    {
      name: 'Диетический Тофу',
      composition: 'Соевые бобы, вода, коагулянт',
      category: 'Овощи',
      cookingRequired: 'Готов к употреблению',
      calories: '73',
      proteins: '8.1',
      fats: '4.2',
      carbs: '0.6',
      flags: ['Веган', 'Без глютена', 'Без сахара']
    }
  ];

  for (const data of testData) {
    test(`Create product with all fields: ${data.name}`, async ({ page }) => {
      await page.click('button:has-text("Создать новый продукт")');

      await page.getByPlaceholder('напр. Куриная грудка').fill(data.name);
      await page.getByPlaceholder('напр. Мука, сахар, яйца...').fill(data.composition);

      await page.locator('select').nth(0).selectOption({ label: data.category });
      await page.locator('select').nth(1).selectOption({ label: data.cookingRequired });

      await page.locator('input[type="number"]').nth(0).fill(data.calories);
      await page.locator('input[type="number"]').nth(1).fill(data.proteins);
      await page.locator('input[type="number"]').nth(2).fill(data.fats);
      await page.locator('input[type="number"]').nth(3).fill(data.carbs);

      for (const flag of data.flags) {
        await page.click(`button:has-text("${flag}")`);
      }

      await page.click('button:has-text("Создать продукт")');

      await expect(page).toHaveURL('/products');
      await expect(page.locator(`text=${data.name}`)).toBeVisible();

      await page.click(`text=${data.name}`);
      await expect(page.locator('h1')).toHaveText(data.name);
      await expect(page.locator(`text=${data.composition}`)).toBeVisible();
      await expect(page.locator(`text=${data.calories}`)).toBeVisible();
      await expect(page.locator(`text=${data.proteins}`)).toBeVisible();
      await expect(page.locator(`text=${data.fats}`)).toBeVisible();
      await expect(page.locator(`text=${data.carbs}`)).toBeVisible();

      for (const flag of data.flags) {
        await expect(page.locator(`span:has-text("${flag}")`)).toBeVisible();
      }

      page.on('dialog', dialog => dialog.accept());
      await page.click('button:has-text("Удалить")');
      await expect(page).toHaveURL('/products');
    });
  }

  test('Edit existing product', async ({ page }) => {
    const nameBefore = 'До изменения';
    const nameAfter = 'После изменения';

    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(nameBefore);
    await page.locator('input[type="number"]').nth(0).fill('50');
    await page.locator('input[type="number"]').nth(1).fill('5');
    await page.locator('input[type="number"]').nth(2).fill('2');
    await page.locator('input[type="number"]').nth(3).fill('1');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    await expect(page.locator(`text=${nameBefore}`)).toBeVisible();
    await page.click(`text=${nameBefore}`);
    await page.click('button:has-text("Редактировать")');

    await page.getByPlaceholder('напр. Куриная грудка').fill(nameAfter);
    await page.locator('input[type="number"]').nth(0).fill('99');
    await page.locator('input[type="number"]').nth(1).fill('9');
    await page.locator('input[type="number"]').nth(2).fill('3');
    await page.locator('input[type="number"]').nth(3).fill('5');

    await page.click('button:has-text("Обновить продукт")');

    await expect(page.locator('h1')).toHaveText(nameAfter);
    await expect(page.locator('.bg-orange-50 .text-2xl')).toHaveText('99');
    await expect(page.locator('.bg-blue-50 .text-2xl')).toHaveText('9');
    await expect(page.locator('.bg-amber-50 .text-2xl')).toHaveText('3');
    await expect(page.locator('.bg-green-50 .text-2xl')).toHaveText('5');

    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/products');
  });

  test('Search, filter, and sort products', async ({ page }) => {
    const prodA = 'Ааа Веган Продукт';
    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(prodA);
    await page.locator('input[type="number"]').nth(0).fill('10');
    await page.locator('input[type="number"]').nth(1).fill('1');
    await page.locator('input[type="number"]').nth(2).fill('0');
    await page.locator('input[type="number"]').nth(3).fill('1');
    await page.click('button:has-text("Веган")');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    const prodB = 'Яяя Мясной Продукт';
    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(prodB);
    await page.locator('select').nth(0).selectOption({ label: 'Мясо' });
    await page.locator('input[type="number"]').nth(0).fill('500');
    await page.locator('input[type="number"]').nth(1).fill('25');
    await page.locator('input[type="number"]').nth(2).fill('40');
    await page.locator('input[type="number"]').nth(3).fill('0');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    // Search
    await page.getByPlaceholder('Поиск продуктов...').fill(prodA);
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`)).not.toBeVisible();

    // Filters
    await page.getByPlaceholder('Поиск продуктов...').fill('');
    await page.click('button:has-text("Фильтры")');

    await page.locator('button:has-text("Мясо")').click();
    await expect(page.locator(`text=${prodB}`)).toBeVisible();
    await expect(page.locator(`text=${prodA}`)).not.toBeVisible();

    await page.click('text=Сбросить все');

    await page.locator('button:has-text("Веган")').click();
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`)).not.toBeVisible();

    await page.click('text=Сбросить все');
    await page.click('button:has-text("Фильтры")');

    // Sorting
    await page.getByPlaceholder('Поиск продуктов...').fill('Продукт');

    await page.locator('select').selectOption({ label: 'По калорийности (возр.)' });
    const cards = page.locator('div.group h3');
    const firstCardText = await cards.nth(0).innerText();
    expect(firstCardText).toContain(prodA);

    await page.locator('select').selectOption({ label: 'По калорийности (убыв.)' });
    const firstCardTextDesc = await cards.nth(0).innerText();
    expect(firstCardTextDesc).toContain(prodB);

    await page.getByPlaceholder('Поиск продуктов...').fill('');

    // Cleanup
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await page.click(`text=${prodA}`);
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/products');

    await expect(page.locator(`text=${prodB}`)).toBeVisible();
    await page.click(`text=${prodB}`);
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/products');
  });
});
