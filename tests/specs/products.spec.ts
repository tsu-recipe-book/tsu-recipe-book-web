import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('Product Management', () => {

  const cleanOldProducts = async (request: APIRequestContext) => {
    const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/products');
    if (!res.ok()) return;

    const products = await res.json();
    const namesToClean = [
      'Аб', 'Абв', 'Тест БЖУ Гран', 'Диетический Тофу',
      'До изменения', 'После изменения', 'Ааа Веган Продукт', 'Яяя Мясной Продукт'
    ];

    const productsToDelete = products.filter((p: any) => namesToClean.includes(p.name));

    await Promise.all(productsToDelete.map((p: any) =>
      request.delete(`https://tsu-recipe.orexi4.ru/api/v1/products/${p.id}`)
    ));
  };

  test.beforeAll(async ({ request }) => {
    await cleanOldProducts(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanOldProducts(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('[1.1] Product name length validation (BVA: 0, 1, 2, 3 chars)', async ({ page }) => {
    await page.click('button:has-text("Создать новый продукт")');
    await expect(page).toHaveURL('/products/new');

    const nameInput = page.getByPlaceholder('напр. Куриная грудка');
    const calInput = page.locator('div:has(> label:has-text("Калории")) input');
    const protInput = page.locator('div:has(> label:has-text("Белки")) input');
    const fatInput = page.locator('div:has(> label:has-text("Жиры")) input');
    const carbInput = page.locator('div:has(> label:has-text("Углеводы")) input');

    await nameInput.fill('');
    await calInput.fill('100');
    await protInput.fill('10');
    await fatInput.fill('5');
    await carbInput.fill('2');

    const isRequired = await nameInput.evaluate(el => (el as HTMLInputElement).required);
    expect(isRequired).toBe(true);

    await nameInput.fill('А');
    await page.click('button:has-text("Создать продукт")');

    const errorAlert = page.locator('div.bg-red-50');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Название должно быть не менее 2 символов');

    await nameInput.fill('Аб');
    await page.click('button:has-text("Создать продукт")');
    await expect(page).toHaveURL('/products');

    await page.click('button:has-text("Создать новый продукт")');
    await nameInput.fill('Абв');
    await calInput.fill('100');
    await protInput.fill('10');
    await fatInput.fill('5');
    await carbInput.fill('2');
    await page.click('button:has-text("Создать продукт")');
    await expect(page).toHaveURL('/products');

    await page.click(`text=Аб`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/products');

    await page.click(`text=Абв`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/products');
  });

  test('[1.2] PFC sum validation (BVA: 99.9g, 100.0g, 100.1g, 200.0g)', async ({ page }) => {
    await page.click('button:has-text("Создать новый продукт")');

    const testName = 'Тест БЖУ Гран';
    await page.getByPlaceholder('напр. Куриная грудка').fill(testName);

    const calInput = page.locator('div:has(> label:has-text("Калории")) input');
    const protInput = page.locator('div:has(> label:has-text("Белки")) input');
    const fatInput = page.locator('div:has(> label:has-text("Жиры")) input');
    const carbInput = page.locator('div:has(> label:has-text("Углеводы")) input');

    await calInput.fill('150');
    await protInput.fill('30');
    await fatInput.fill('30');

    const errorAlert = page.locator('div.bg-red-50');

    await carbInput.fill('140');
    await page.click('button:has-text("Создать продукт")');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Сумма белков, жиров и углеводов не может превышать 100г');

    await carbInput.fill('40.1');
    await page.click('button:has-text("Создать продукт")');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Сумма белков, жиров и углеводов не может превышать 100г');

    await carbInput.fill('40.0');
    await page.click('button:has-text("Создать продукт")');
    await expect(page).toHaveURL('/products');

    await page.click(`text=${testName}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/products');

    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(testName);
    await calInput.fill('150');
    await protInput.fill('30');
    await fatInput.fill('30');
    await carbInput.fill('39.9');
    await page.click('button:has-text("Создать продукт")');
    await expect(page).toHaveURL('/products');

    await page.click(`text=${testName}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/products');
  });

  test('[1.3] Product photos limit validation (BVA: 4 vs 5 photos)', async ({ page }) => {
    await page.click('button:has-text("Создать новый продукт")');

    const addButton = page.locator('label:has-text("Добавить")');
    const photoInput = addButton.locator('input[type="file"]');

    const files = Array.from({ length: 5 }, (_, i) => ({
      name: `photo_${i}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    }));

    await photoInput.setInputFiles(files.slice(0, 4));
    await expect(addButton).toBeVisible();

    await photoInput.setInputFiles([files[4]]);
    await expect(addButton).not.toBeVisible();

    const photoGroup = page.locator('div.relative.aspect-square').first();
    await photoGroup.hover();
    await photoGroup.locator('button.bg-red-500').click();

    await expect(addButton).toBeVisible();
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
    test(`[1.4] Create product with all fields: ${data.name}`, async ({ page }) => {
      await page.click('button:has-text("Создать новый продукт")');

      await page.getByPlaceholder('напр. Куриная грудка').fill(data.name);
      await page.getByPlaceholder('напр. Мука, сахар, яйца...').fill(data.composition);

      await page.locator('div:has(> label:has-text("Категория")) select').selectOption({ label: data.category });
      await page.locator('div:has(> label:has-text("Статус")) select').selectOption({ label: data.cookingRequired });

      await page.locator('div:has(> label:has-text("Калории")) input').fill(data.calories);
      await page.locator('div:has(> label:has-text("Белки")) input').fill(data.proteins);
      await page.locator('div:has(> label:has-text("Жиры")) input').fill(data.fats);
      await page.locator('div:has(> label:has-text("Углеводы")) input').fill(data.carbs);

      for (const flag of data.flags) {
        await page.click(`button:has-text("${flag}")`);
      }

      await page.click('button:has-text("Создать продукт")');

      await expect(page).toHaveURL('/products');
      await expect(page.locator(`text=${data.name}`)).toBeVisible();

      await page.click(`text=${data.name}`);
      await expect(page.locator('h1')).toHaveText(data.name);
      await expect(page.locator('text=Дата создания:')).toBeVisible();
      await expect(page.locator(`text=${data.composition}`)).toBeVisible();
      await expect(page.locator(`text=${data.calories}`)).toBeVisible();
      await expect(page.locator(`text=${data.proteins}`)).toBeVisible();
      await expect(page.locator(`text=${data.fats}`)).toBeVisible();
      await expect(page.locator(`text=${data.carbs}`)).toBeVisible();

      for (const flag of data.flags) {
        await expect(page.locator(`span:has-text("${flag}")`)).toBeVisible();
      }

      await page.evaluate(() => window.scrollTo(0, 0));
      page.once('dialog', dialog => dialog.accept());
      await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());

      await expect(page).toHaveURL('/products');
    });
  }

  test('[1.5] Edit existing product', async ({ page }) => {
    const nameBefore = 'До изменения';
    const nameAfter = 'После изменения';

    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(nameBefore);
    await page.locator('div:has(> label:has-text("Калории")) input').fill('50');
    await page.locator('div:has(> label:has-text("Белки")) input').fill('5');
    await page.locator('div:has(> label:has-text("Жиры")) input').fill('2');
    await page.locator('div:has(> label:has-text("Углеводы")) input').fill('1');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    await expect(page.locator(`text=${nameBefore}`)).toBeVisible();
    await page.click(`text=${nameBefore}`);
    await page.click('button:has-text("Редактировать")');

    await page.getByPlaceholder('напр. Куриная грудка').fill(nameAfter);
    await page.locator('div:has(> label:has-text("Калории")) input').fill('99');
    await page.locator('div:has(> label:has-text("Белки")) input').fill('9');
    await page.locator('div:has(> label:has-text("Жиры")) input').fill('3');
    await page.locator('div:has(> label:has-text("Углеводы")) input').fill('5');

    await page.click('button:has-text("Обновить продукт")');

    await expect(page.locator('h1')).toHaveText(nameAfter);
    await expect(page.locator('text=Дата редактирования:')).toBeVisible();

    await expect(page.locator('.bg-orange-50 .text-2xl')).toHaveText('99');
    await expect(page.locator('.bg-blue-50 .text-2xl')).toHaveText('9');
    await expect(page.locator('.bg-amber-50 .text-2xl')).toHaveText('3');
    await expect(page.locator('.bg-green-50 .text-2xl')).toHaveText('5');

    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());

    await expect(page).toHaveURL('/products');
  });

  test('[1.6] Search, filter, and sort products', async ({ page }) => {
    const prodA = 'Ааа Веган Продукт';
    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(prodA);
    await page.locator('div:has(> label:has-text("Категория")) select').selectOption({ label: 'Овощи' });
    await page.locator('div:has(> label:has-text("Статус")) select').selectOption({ label: 'Готов к употреблению' });
    await page.locator('div:has(> label:has-text("Калории")) input').fill('10');
    await page.locator('div:has(> label:has-text("Белки")) input').fill('1');
    await page.locator('div:has(> label:has-text("Жиры")) input').fill('0');
    await page.locator('div:has(> label:has-text("Углеводы")) input').fill('1');
    await page.click('button:has-text("Веган")');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    const prodB = 'Яяя Мясной Продукт';
    await page.click('button:has-text("Создать новый продукт")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(prodB);
    await page.locator('div:has(> label:has-text("Категория")) select').selectOption({ label: 'Мясо' });
    await page.locator('div:has(> label:has-text("Статус")) select').selectOption({ label: 'Требует приготовления' });
    await page.locator('div:has(> label:has-text("Калории")) input').fill('500');
    await page.locator('div:has(> label:has-text("Белки")) input').fill('25');
    await page.locator('div:has(> label:has-text("Жиры")) input').fill('40');
    await page.locator('div:has(> label:has-text("Углеводы")) input').fill('0');
    await page.click('button:has-text("Создать продукт")');
    await page.waitForURL('**/products');

    await page.getByPlaceholder('Поиск продуктов...').fill(prodA);
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`).first()).not.toBeVisible();

    await page.getByPlaceholder('Поиск продуктов...').fill('');
    await page.click('button:has-text("Фильтры")');

    await page.locator('button:has-text("Мясо")').click();
    await expect(page.locator(`text=${prodB}`)).toBeVisible();
    await expect(page.locator(`text=${prodA}`).first()).not.toBeVisible();
    await page.locator('button:has-text("Мясо")').click();

    await page.locator('button:has-text("Готов к употреблению")').click();
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`).first()).not.toBeVisible();
    await page.locator('button:has-text("Готов к употреблению")').click();

    await page.locator('button:has-text("Веган")').click();
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`).first()).not.toBeVisible();

    await page.click('text=Сбросить все');
    await page.click('button:has-text("Фильтры")');

    await page.getByPlaceholder('Поиск продуктов...').fill('Продукт');

    await page.locator('select').selectOption({ label: 'По белкам (убыв.)' });
    const cards = page.locator('div.group h3');
    await expect.poll(async () => await cards.nth(0).innerText()).toContain(prodB);

    await page.locator('select').selectOption({ label: 'По калорийности (возр.)' });
    await expect.poll(async () => await cards.nth(0).innerText()).toContain(prodA);

    await page.getByPlaceholder('Поиск продуктов...').fill('');

    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await page.click(`text=${prodA}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/products');

    await expect(page.locator(`text=${prodB}`)).toBeVisible();
    await page.click(`text=${prodB}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/products');
  });
});
