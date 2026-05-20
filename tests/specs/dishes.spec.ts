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
    try {
      const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/products');
      if (res.ok()) {
        const products = await res.json();
        for (const p of products) {
          if ([prodAName, prodBName, veganProdName].includes(p.name)) {
            await request.delete(`https://tsu-recipe.orexi4.ru/api/v1/products/${p.id}`);
          }
        }
      }
    } catch (e) {
      console.error('Failed to pre-clean products:', e);
    }
  };

  const cleanOldDishes = async (request: APIRequestContext) => {
    try {
      const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/dishes');
      if (res.ok()) {
        const dishes = await res.json();
        for (const d of dishes) {
          if ([dishName, 'Борщ домашний', 'Вкусный Тортик', 'Странное Блюдо', 'Рецепт Изменен', 'Блюдо для Редактирования'].includes(d.name)) {
            await request.delete(`https://tsu-recipe.orexi4.ru/api/v1/dishes/${d.id}`);
          }
        }
      }
    } catch (e) {
      console.error('Failed to pre-clean dishes:', e);
    }
  };

  test.beforeAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);

    const resA = await request.post('https://tsu-recipe.orexi4.ru/api/v1/products', {
      multipart: {
        name: prodAName,
        calories: '100',
        proteins: '10',
        fats: '5',
        carbohydrates: '2',
        category: 'VEGETABLES',
        cookingRequired: 'READY_TO_EAT',
        composition: 'Тестовый ингредиент А'
      }
    });
    const dataA = await resA.json();
    prodAId = dataA.id;

    const resB = await request.post('https://tsu-recipe.orexi4.ru/api/v1/products', {
      multipart: {
        name: prodBName,
        calories: '200',
        proteins: '5',
        fats: '10',
        carbohydrates: '20',
        category: 'VEGETABLES',
        cookingRequired: 'READY_TO_EAT',
        composition: 'Тестовый ингредиент Б'
      }
    });
    const dataB = await resB.json();
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

    const resVegan = await fetch('https://tsu-recipe.orexi4.ru/api/v1/products', {
      method: 'POST',
      body: formData
    });
    const dataVegan = await resVegan.json() as any;
    veganProdId = dataVegan.id;
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

    await page.locator(`div.group:has(div:has-text("${prodAName}")) input[type="number"]`).fill('150');
    await page.locator(`div.group:has(div:has-text("${prodBName}")) input[type="number"]`).fill('50');

    await page.waitForTimeout(1000);

    const calPlaceholder = await page.locator('div:has(> label:has-text("Калории")) input').getAttribute('placeholder');
    expect(Number(calPlaceholder)).toBeCloseTo(250.0, 1);

    const protPlaceholder = await page.locator('div:has(> label:has-text("Белки")) input').getAttribute('placeholder');
    expect(Number(protPlaceholder)).toBeCloseTo(17.5, 1);

    const fatPlaceholder = await page.locator('div:has(> label:has-text("Жиры")) input').getAttribute('placeholder');
    expect(Number(fatPlaceholder)).toBeCloseTo(12.5, 1);

    const carbPlaceholder = await page.locator('div:has(> label:has-text("Углеводы")) input').getAttribute('placeholder');
    expect(Number(carbPlaceholder)).toBeCloseTo(13.0, 1);

    const portionPlaceholder = await page.locator('div:has(> label:has-text("Вес порции")) input').getAttribute('placeholder');
    expect(Number(portionPlaceholder)).toBeCloseTo(200.0, 1);

    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dishes');
    await expect(page.locator(`text=${dishName}`)).toBeVisible();
  });

  test('Automatic category determination by macro with DB save verification', async ({ page }) => {
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

    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/dishes');
  });

  test('Multiple macros handling (only the first macro applies)', async ({ page }) => {
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

  test('Category priority: form field overrides macro', async ({ page }) => {
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

    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Удалить")');
    await expect(page).toHaveURL('/dishes');
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
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill('Блюдо с ингредиентом');
    await page.getByPlaceholder('Поиск продуктов...').fill(prodAName);
    await page.click(`button:has-text("${prodAName}")`);
    await page.locator(`div.group:has(div:has-text("${prodAName}")) input[type="number"]`).fill('100');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dishes');

    await page.goto('/products');
    await page.click(`text=${prodAName}`);

    let dialogCount = 0;
    page.on('dialog', async dialog => {
      dialogCount++;
      if (dialogCount === 1) {
        expect(dialog.message()).toContain('Вы уверены');
        await dialog.accept();
      } else if (dialogCount === 2) {
        expect(dialog.message()).toContain('Не удалось удалить продукт');
        await dialog.accept();
      }
    });

    await page.click('button:has-text("Удалить")');

    await expect(page).toHaveURL(new RegExp(`/products/`));
    await expect(page.locator('h1')).toHaveText(prodAName);
  });

  test('Edit and delete a dish', async ({ page }) => {
    const localDishName = 'Блюдо для Редактирования';
    await page.click('button:has-text("Создать новое блюдо")');
    await page.getByPlaceholder('напр. Куриная грудка').fill(localDishName);

    await page.getByPlaceholder('Поиск продуктов...').fill(veganProdName);
    await page.click(`button:has-text("${veganProdName}")`);
    await page.locator(`div.group:has(div:has-text("${veganProdName}")) input[type="number"]`).fill('100');

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

  test.afterAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);
  });
});
