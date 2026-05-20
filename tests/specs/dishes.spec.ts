import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('Dish Management', () => {

  const prodAName = 'Ингредиент А';
  const prodBName = 'Ингредиент Б';
  const veganProdName = 'Веганский Продукт';
  const dishName = 'Тестовое Блюдо';

  let prodAId: string;
  let prodBId: string;
  let veganProdId: string;

  const cleanOldProducts = async (request: APIRequestContext) => {
    const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/products');
    if (!res.ok()) return;

    const products = await res.json();
    const namesToClean = [prodAName, prodBName, veganProdName];
    const productsToDelete = products.filter((p: any) => namesToClean.includes(p.name));

    await Promise.all(productsToDelete.map((p: any) =>
      request.delete(`https://tsu-recipe.orexi4.ru/api/v1/products/${p.id}`)
    ));
  };

  const cleanOldDishes = async (request: APIRequestContext) => {
    const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/dishes');
    if (!res.ok()) return;

    const dishes = await res.json();
    const namesToClean = [
      dishName, 'Борщ домашний', 'Вкусный Тортик', 'Странное Блюдо', 'Рецепт Изменен',
      'Блюдо для Редактирования', 'Блюдо с ингредиентом', 'Ааа Веган Салат', 'Яяя Мясной Суп',
      'А', 'Аб', 'Абв'
    ];
    const dishesToDelete = dishes.filter((d: any) => namesToClean.includes(d.name));

    await Promise.all(dishesToDelete.map((d: any) =>
      request.delete(`https://tsu-recipe.orexi4.ru/api/v1/dishes/${d.id}`)
    ));
  };

  test.beforeAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);

    const formA = new FormData();
    formA.append('name', prodAName);
    formA.append('calories', '100');
    formA.append('proteins', '10');
    formA.append('fats', '5');
    formA.append('carbohydrates', '2');
    formA.append('category', 'VEGETABLES');
    formA.append('cookingRequired', 'READY_TO_EAT');
    formA.append('composition', 'Тестовый ингредиент А');

    const resA = await fetch('https://tsu-recipe.orexi4.ru/api/v1/products', { method: 'POST', body: formA });
    const dataA = await resA.json() as any;
    prodAId = dataA.id;

    const formB = new FormData();
    formB.append('name', prodBName);
    formB.append('calories', '200');
    formB.append('proteins', '5');
    formB.append('fats', '10');
    formB.append('carbohydrates', '20');
    formB.append('category', 'VEGETABLES');
    formB.append('cookingRequired', 'READY_TO_EAT');
    formB.append('composition', 'Тестовый ингредиент Б');

    const resB = await fetch('https://tsu-recipe.orexi4.ru/api/v1/products', { method: 'POST', body: formB });
    const dataB = await resB.json() as any;
    prodBId = dataB.id;

    const formData = new FormData();
    formData.append('name', veganProdName);
    formData.append('calories', '50');
    formData.append('proteins', '1');
    formData.append('fats', '0');
    formData.append('carbohydrates', '10');
    formData.append('category', 'VEGETABLES');
    formData.append('cookingRequired', 'READY_TO_EAT');
    formData.append('composition', 'Тестовый веганский продукт');
    formData.append('flags', 'VEGAN');
    formData.append('flags', 'SUGAR_FREE');

    const resVegan = await fetch('https://tsu-recipe.orexi4.ru/api/v1/products', { method: 'POST', body: formData });
    const dataVegan = await resVegan.json() as any;
    veganProdId = dataVegan.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dishes');
  });

  test('[2.1] Dish name length validation (BVA: 0, 1, 2, 3 chars)', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');
    await expect(page).toHaveURL('/dishes/new');

    const nameInput = page.getByPlaceholder('напр. Куриная грудка');

    await nameInput.fill('');
    await page.getByPlaceholder('Поиск продуктов...').fill(prodAName);
    await page.click(`button:has-text("${prodAName}")`);

    const isRequired = await nameInput.evaluate(el => (el as HTMLInputElement).required);
    expect(isRequired).toBe(true);

    await nameInput.fill('А');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/dishes/new');

    await nameInput.fill('Аб');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');
    await expect(page.locator(`text=Аб`)).toBeVisible();

    await page.click('button:has-text("Создать новое блюдо")');
    await nameInput.fill('Абв');
    await page.getByPlaceholder('Поиск продуктов...').fill(prodBName);
    await page.click(`button:has-text("${prodBName}")`);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');
    await expect(page.locator(`text=Абв`)).toBeVisible();

    await page.click(`text=Аб`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/dishes');

    await page.click(`text=Абв`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/dishes');
  });

  test('[2.2] Dish photos limit validation (BVA: 4 vs 5 photos)', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');

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

  test('[2.3] Automatic PFC calculation based on ingredients — 2 ingredients, expected values', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');
    await expect(page).toHaveURL('/dishes/new');

    await page.getByPlaceholder('напр. Куриная грудка').fill(dishName);

    await page.getByPlaceholder('Поиск продуктов...').fill(prodAName);
    await page.click(`button:has-text("${prodAName}")`);

    await page.getByPlaceholder('Поиск продуктов...').fill(prodBName);
    await page.click(`button:has-text("${prodBName}")`);

    await page.locator(`div.group:has(div:has-text("${prodAName}")) input[type="number"]`).fill('150');
    await page.locator(`div.group:has(div:has-text("${prodBName}")) input[type="number"]`).fill('50');

    await expect.poll(async () => {
      const val = await page.locator('div:has(> label:has-text("Калории")) input').getAttribute('placeholder');
      return Number(val);
    }).toBeCloseTo(250.0, 1);

    await expect.poll(async () => {
      const val = await page.locator('div:has(> label:has-text("Белки")) input').getAttribute('placeholder');
      return Number(val);
    }).toBeCloseTo(17.5, 1);

    await expect.poll(async () => {
      const val = await page.locator('div:has(> label:has-text("Жиры")) input').getAttribute('placeholder');
      return Number(val);
    }).toBeCloseTo(12.5, 1);

    await expect.poll(async () => {
      const val = await page.locator('div:has(> label:has-text("Углеводы")) input').getAttribute('placeholder');
      return Number(val);
    }).toBeCloseTo(13.0, 1);

    await expect.poll(async () => {
      const val = await page.locator('div:has(> label:has-text("Вес порции")) input').getAttribute('placeholder');
      return Number(val);
    }).toBeCloseTo(200.0, 1);

    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dishes');
    await expect(page.locator(`text=${dishName}`)).toBeVisible();
  });

  test('[2.4] Automatic category determination by macro with DB save verification', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');

    const macroNameInput = 'Борщ домашний !суп';
    await page.getByPlaceholder('напр. Куриная грудка').fill(macroNameInput);

    const nameVal = await page.getByPlaceholder('напр. Куриная грудка').inputValue();
    expect(nameVal.trim()).toBe('Борщ домашний');

    const soupButton = page.locator('button:has-text("Суп")');
    await expect(soupButton).toHaveClass(/bg-indigo-600/);

    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);
    await page.locator(`div.group:has(div:has-text("${veganProdName}")) input[type="number"]`).fill('100');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.click('text=Борщ домашний');
    await expect(page.locator('span:has-text("Суп")')).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());

    await expect(page).toHaveURL('/dishes');
  });

  test('[2.5] Multiple macros handling — only the first macro applies', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');

    const multipleMacrosInput = 'Вкусный Тортик !десерт !суп';
    await page.getByPlaceholder('напр. Куриная грудка').fill(multipleMacrosInput);

    const nameVal = await page.getByPlaceholder('напр. Куриная грудка').inputValue();
    expect(nameVal.trim()).toBe('Вкусный Тортик  !суп');

    const dessertButton = page.locator('button:has-text("Десерт")');
    await expect(dessertButton).toHaveClass(/bg-indigo-600/);

    const soupButton = page.locator('button:has-text("Суп")');
    await expect(soupButton).not.toHaveClass(/bg-indigo-600/);
  });

  test('[2.6] Category priority — form field overrides macro', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');

    await page.getByPlaceholder('напр. Куриная грудка').fill('Странное Блюдо !суп');

    const soupButton = page.locator('button:has-text("Суп")');
    await expect(soupButton).toHaveClass(/bg-indigo-600/);

    await page.click('button:has-text("Салат")');

    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);
    await page.locator(`div.group:has(div:has-text("${veganProdName}")) input[type="number"]`).fill('100');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.click('text=Странное Блюдо');
    await expect(page.locator('span:has-text("Салат")')).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());

    await expect(page).toHaveURL('/dishes');
  });

  test('[2.7] Manage dietary flags of a dish based on ingredient composition', async ({ page }) => {
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

  test('[2.8] Prevent deletion of a product used in a dish (DB constraint)', async ({ page }) => {
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill('Блюдо с ингредиентом');
    await page.getByPlaceholder('Поиск продуктов...').fill(prodAName);
    await page.click(`button:has-text("${prodAName}")`);
    await page.locator(`div.group:has(div:has-text("${prodAName}")) input[type="number"]`).fill('100');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.goto('/products');
    await page.click(`text=${prodAName}`);

    const dialogMessages: string[] = [];
    const dialogQueue = [
      async (dialog: any) => {
        dialogMessages.push(dialog.message());
        await dialog.accept();
      },
      async (dialog: any) => {
        dialogMessages.push(dialog.message());
        await dialog.accept();
      }
    ];

    page.on('dialog', async dialog => {
      const action = dialogQueue.shift()!;
      await action(dialog);
    });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());

    await expect.poll(() => dialogQueue.length).toBe(0);

    expect(dialogMessages[0]).toContain('Вы уверены');
    expect(dialogMessages[1]).toContain('Не удалось удалить продукт');

    await expect(page).toHaveURL(new RegExp(`/products/`));
    await expect(page.locator('h1')).toHaveText(prodAName);
  });

  test('[2.9] Search, filter, and sort dishes', async ({ page }) => {
    const dishA = 'Ааа Веган Салат';
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(dishA);
    await page.click('button:has-text("Салат")');
    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);
    await page.locator(`div.group:has(div:has-text("${veganProdName}")) input[type="number"]`).fill('100');
    await page.click('button:has-text("Веган")');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    const dishB = 'Яяя Мясной Суп';
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(dishB);
    await page.click('button:has-text("Суп")');
    await page.getByPlaceholder('Поиск продуктов...').fill(prodBName);
    await page.click(`button:has-text("${prodBName}")`);
    await page.locator(`div.group:has(div:has-text("${prodBName}")) input[type="number"]`).fill('200');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.getByPlaceholder('Поиск блюд...').fill(dishA);
    await expect(page.locator(`text=${dishA}`)).toBeVisible();
    await expect(page.locator(`text=${dishB}`)).not.toBeVisible();

    await page.getByPlaceholder('Поиск блюд...').fill('');
    await page.click('button:has-text("Фильтры")');

    await page.locator('button:has-text("Суп")').click();
    await expect(page.locator(`text=${dishB}`)).toBeVisible();
    await expect(page.locator(`text=${dishA}`)).not.toBeVisible();

    await page.click('text=Сбросить все');

    await page.locator('button:has-text("Салат")').click();
    await page.locator('button:has-text("Веган")').click();
    await expect(page.locator(`text=${dishA}`)).toBeVisible();
    await expect(page.locator(`text=${dishB}`)).not.toBeVisible();

    await page.click('text=Сбросить все');
    await page.click('button:has-text("Фильтры")');

    await page.locator('select').selectOption({ label: 'По названию (А-Я)' });
    const cards = page.locator('div.group h3');
    await expect.poll(async () => await cards.nth(0).innerText()).toContain(dishA);

    await page.locator('select').selectOption({ label: 'По названию (Я-А)' });
    await expect.poll(async () => await cards.nth(0).innerText()).toContain(dishB);

    await page.getByPlaceholder('Поиск блюд...').fill('');

    await expect(page.locator(`text=${dishA}`)).toBeVisible();
    await page.click(`text=${dishA}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/dishes');

    await expect(page.locator(`text=${dishB}`)).toBeVisible();
    await page.click(`text=${dishB}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());
    await expect(page).toHaveURL('/dishes');
  });

  test('[2.10] Edit and delete a dish (Full CRUD flow & Details verification)', async ({ page }) => {
    const localDishName = 'Блюдо для Редактирования';
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(localDishName);

    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);
    await page.locator(`div.group:has(div:has-text("${veganProdName}")) input[type="number"]`).fill('100');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.click(`text=${localDishName}`);

    await expect(page.locator('h1')).toHaveText(localDishName);
    await expect(page.locator('text=Дата создания:')).toBeVisible();
    await expect(page.locator(`text=${veganProdName}`)).toBeVisible();
    await expect(page.locator('text=100г')).toBeVisible();

    await page.click('button:has-text("Редактировать")');

    const newDishName = 'Рецепт Изменен';
    await page.getByPlaceholder('напр. Куриная грудка').fill(newDishName);

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('h1')).toHaveText(newDishName);
    await expect(page.locator('text=Дата редактирования:')).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 0));
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Удалить")').evaluate(b => (b as HTMLButtonElement).click());

    await expect(page).toHaveURL('/dishes');
    await expect(page.locator(`text=${newDishName}`)).not.toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);
  });
});