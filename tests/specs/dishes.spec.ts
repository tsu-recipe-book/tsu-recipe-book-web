import { test, expect, APIRequestContext } from '@playwright/test';
import { DishesPage } from '../pages/DishesPage';
import { DishFormPage } from '../pages/DishFormPage';
import { DishDetailsPage } from '../pages/DishDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

test.describe('Dish Management', () => {
  let dishesPage: DishesPage;
  let dishFormPage: DishFormPage;
  let dishDetailsPage: DishDetailsPage;

  const prodAName = 'Ингредиент А';
  const prodBName = 'Ингредиент Б';
  const veganProdName = 'Веганский Продукт';
  const dishName = 'Тестовое Блюдо';

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
      'А', 'Аб', 'Абв', 'Яблоко'
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
    expect(resA.ok).toBeTruthy();

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
    expect(resB.ok).toBeTruthy();

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
    expect(resVegan.ok).toBeTruthy();
  });

  test.beforeEach(async ({ page }) => {
    dishesPage = new DishesPage(page);
    dishFormPage = new DishFormPage(page);
    dishDetailsPage = new DishDetailsPage(page);
    await dishesPage.navigate();
  });

  test('[2.1] Dish name length validation (BVA: 0 chars)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await expect(page).toHaveURL('/dishes/new');

    await dishFormPage.fillName('');
    const isRequired = await dishFormPage.isNameRequired();
    expect(isRequired).toBe(true);
  });

  test('[2.1] Dish name length validation (BVA: 1 char)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName('А');

    await dishFormPage.addIngredient(prodAName);

    await dishFormPage.submit();
    await expect(page).toHaveURL('/dishes/new');

    await expect(dishFormPage.errorAlert).toBeVisible();
    await expect(dishFormPage.errorAlert).toContainText('Название должно быть не менее 2 символов');
  });

  test('[2.1] Dish name length validation (BVA: 2 chars)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName('Аб');

    await dishFormPage.addIngredient(prodAName);

    await dishFormPage.submit();
    await page.waitForURL('**/dishes');
    await expect(dishesPage.dishCards.filter({ hasText: 'Аб' })).toBeVisible();

    await dishesPage.clickDish('Аб');
    await dishDetailsPage.deleteDish();
  });

  test('[2.1] Dish name length validation (BVA: 3 chars)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName('Абв');

    await dishFormPage.addIngredient(prodAName);

    await dishFormPage.submit();
    await page.waitForURL('**/dishes');
    await expect(dishesPage.dishCards.filter({ hasText: 'Абв' })).toBeVisible();

    await dishesPage.clickDish('Абв');
    await dishDetailsPage.deleteDish();
  });

  test('[2.2] Dish photos limit validation (BVA: 4 vs 5 photos)', async ({ page }) => {
    await dishesPage.clickCreateDish();

    const files = Array.from({ length: 5 }, (_, i) => ({
      name: `photo_${i}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    }));

    await dishFormPage.uploadPhotos(files.slice(0, 4));
    await expect(dishFormPage.addPhotoLabel).toBeVisible();

    await dishFormPage.uploadPhotos([files[4]]);
    await expect(dishFormPage.addPhotoLabel).not.toBeVisible();

    await dishFormPage.deleteFirstPhoto();
    await expect(dishFormPage.addPhotoLabel).toBeVisible();
  });

  test('[2.3] Automatic PFC calculation based on ingredients — 2 ingredients, expected values', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await expect(page).toHaveURL('/dishes/new');

    await dishFormPage.fillName(dishName);

    await dishFormPage.addIngredient(prodAName);
    await dishFormPage.addIngredient(prodBName);

    await dishFormPage.fillIngredientWeight(prodAName, '150');
    await dishFormPage.fillIngredientWeight(prodBName, '50');

    await expect.poll(async () => {
      const val = await dishFormPage.getNutritionPlaceholder('Калории');
      return Number(val);
    }).toBeCloseTo(250.0, 1);

    await expect.poll(async () => {
      const val = await dishFormPage.getNutritionPlaceholder('Белки');
      return Number(val);
    }).toBeCloseTo(17.5, 1);

    await expect.poll(async () => {
      const val = await dishFormPage.getNutritionPlaceholder('Жиры');
      return Number(val);
    }).toBeCloseTo(12.5, 1);

    await expect.poll(async () => {
      const val = await dishFormPage.getNutritionPlaceholder('Углеводы');
      return Number(val);
    }).toBeCloseTo(13.0, 1);

    await expect.poll(async () => {
      const val = await dishFormPage.getNutritionPlaceholder('Вес порции');
      return Number(val);
    }).toBeCloseTo(200.0, 1);

    await dishFormPage.submit();

    await page.waitForURL('**/dishes');
    await expect(page.locator(`text=${dishName}`)).toBeVisible();
  });

  test('[2.4] Automatic category determination by macro with DB save verification (Суп)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName('Борщ домашний !суп');

    const nameVal = await dishFormPage.nameInput.inputValue();
    expect(nameVal.trim()).toBe('Борщ домашний');
    await expect(dishFormPage.getCategoryButton('Суп')).toHaveClass(/bg-indigo-600/);

    await dishFormPage.addIngredient(veganProdName);
    await dishFormPage.fillIngredientWeight(veganProdName, '100');

    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    await dishesPage.clickDish('Борщ домашний');
    await expect(dishDetailsPage.getCategoryLocator('Суп').first()).toBeVisible();

    await dishDetailsPage.deleteDish();
  });

  test('[2.4] Automatic category determination by macro with DB save verification (Перекус)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName('Яблоко !перекус');

    const nameVal = await dishFormPage.nameInput.inputValue();
    expect(nameVal.trim()).toBe('Яблоко');
    await expect(dishFormPage.getCategoryButton('Закуска')).toHaveClass(/bg-indigo-600/);

    await dishFormPage.addIngredient(veganProdName);
    await dishFormPage.fillIngredientWeight(veganProdName, '100');

    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    await dishesPage.clickDish('Яблоко');
    await expect(dishDetailsPage.getCategoryLocator('Закуска')).toBeVisible();

    await dishDetailsPage.deleteDish();
  });

  test('[2.5] Multiple macros handling — only the first macro applies', async ({ page }) => {
    await dishesPage.clickCreateDish();

    await dishFormPage.fillName('Вкусный Тортик !десерт !суп');

    const nameVal = await dishFormPage.nameInput.inputValue();
    expect(nameVal.trim()).toBe('Вкусный Тортик  !суп');

    await expect(dishFormPage.getCategoryButton('Десерт')).toHaveClass(/bg-indigo-600/);
    await expect(dishFormPage.getCategoryButton('Суп')).not.toHaveClass(/bg-indigo-600/);
  });

  test('[2.6] Category priority — form field overrides macro', async ({ page }) => {
    await dishesPage.clickCreateDish();

    await dishFormPage.fillName('Странное Блюдо !суп');

    await expect(dishFormPage.getCategoryButton('Суп')).toHaveClass(/bg-indigo-600/);

    await dishFormPage.selectCategory('Салат');

    await dishFormPage.addIngredient(veganProdName);
    await dishFormPage.fillIngredientWeight(veganProdName, '100');

    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    await dishesPage.clickDish('Странное Блюдо');
    await expect(dishDetailsPage.getCategoryLocator('Салат')).toBeVisible();

    await dishDetailsPage.deleteDish();
    await expect(page).toHaveURL('/dishes');
  });

  test('[2.7] Manage dietary flags of a dish based on ingredient composition', async ({ page }) => {
    await dishesPage.clickCreateDish();

    await dishFormPage.addIngredient(veganProdName);

    const veganButton = dishFormPage.getFlagButton('Веган');
    const sugarFreeButton = dishFormPage.getFlagButton('Без сахара');
    const glutenFreeButton = dishFormPage.getFlagButton('Без глютена');

    await expect(veganButton).not.toHaveClass(/opacity-50/);
    await expect(sugarFreeButton).not.toHaveClass(/opacity-50/);
    await expect(glutenFreeButton).toHaveClass(/opacity-50/);

    await dishFormPage.clickFlag('Веган');
    await expect(veganButton).toHaveClass(/bg-emerald-500/);

    await dishFormPage.addIngredient(prodAName);

    await expect(veganButton).toHaveClass(/opacity-50/);
    await expect(veganButton).not.toHaveClass(/bg-emerald-500/);
  });

  test('[2.8] Prevent deletion of a product used in a dish (DB constraint)', async ({ page }) => {
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName('Блюдо с ингредиентом');
    await dishFormPage.addIngredient(prodAName);
    await dishFormPage.fillIngredientWeight(prodAName, '100');
    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    await page.goto('/products');

    const localProductsPage = new ProductsPage(page);
    const localProductDetailsPage = new ProductDetailsPage(page);

    await localProductsPage.clickProduct(prodAName);

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

    await localProductDetailsPage.deleteBtn.click({ force: true });

    await expect.poll(() => dialogQueue.length).toBe(0);

    expect(dialogMessages[0]).toContain('Вы уверены');
    expect(dialogMessages[1]).toContain('Не удалось удалить продукт');

    await expect(page).toHaveURL(new RegExp(`/products/`));
    await expect(localProductDetailsPage.title).toHaveText(prodAName);
  });

  test('[2.9] Search, filter, and sort dishes', async ({ page }) => {
    const dishA = 'Ааа Веган Салат';
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName(dishA);
    await dishFormPage.selectCategory('Салат');
    await dishFormPage.addIngredient(veganProdName);
    await dishFormPage.fillIngredientWeight(veganProdName, '100');
    await dishFormPage.clickFlag('Веган');
    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    const dishB = 'Яяя Мясной Суп';
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName(dishB);
    await dishFormPage.selectCategory('Суп');
    await dishFormPage.addIngredient(prodBName);
    await dishFormPage.fillIngredientWeight(prodBName, '200');
    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    await dishesPage.search(dishA);
    await expect(page.locator(`text=${dishA}`)).toBeVisible();
    await expect(page.locator(`text=${dishB}`)).not.toBeVisible();

    await dishesPage.search('');
    await dishesPage.toggleFilters();

    await dishesPage.clickFilter('Суп');
    await expect(page.locator(`text=${dishB}`)).toBeVisible();
    await expect(page.locator(`text=${dishA}`)).not.toBeVisible();

    await dishesPage.resetFilters();

    await dishesPage.clickFilter('Салат');
    await dishesPage.clickFilter('Веган');
    await expect(page.locator(`text=${dishA}`)).toBeVisible();
    await expect(page.locator(`text=${dishB}`)).not.toBeVisible();

    await dishesPage.resetFilters();
    await dishesPage.toggleFilters();

    await dishesPage.selectSort('По названию (А-Я)');
    await expect.poll(async () => await dishesPage.getFirstDishCardText()).toContain(dishA);

    await dishesPage.selectSort('По названию (Я-А)');
    await expect.poll(async () => await dishesPage.getFirstDishCardText()).toContain(dishB);

    await dishesPage.search('');

    await expect(page.locator(`text=${dishA}`)).toBeVisible();
    await dishesPage.clickDish(dishA);
    await dishDetailsPage.deleteDish();
    await expect(page).toHaveURL('/dishes');

    await expect(page.locator(`text=${dishB}`)).toBeVisible();
    await dishesPage.clickDish(dishB);
    await dishDetailsPage.deleteDish();
    await expect(page).toHaveURL('/dishes');
  });

  test('[2.10] Edit and delete a dish (Full CRUD flow & Details verification)', async ({ page }) => {
    const localDishName = 'Блюдо для Редактирования';
    await dishesPage.clickCreateDish();
    await dishFormPage.fillName(localDishName);

    await dishFormPage.addIngredient(veganProdName);
    await dishFormPage.fillIngredientWeight(veganProdName, '100');

    await dishFormPage.submit();
    await page.waitForURL('**/dishes');

    await dishesPage.clickDish(localDishName);

    await expect(dishDetailsPage.title).toHaveText(localDishName);
    await expect(dishDetailsPage.createdAtText).toBeVisible();
    await expect(dishDetailsPage.getIngredientLocator(veganProdName)).toBeVisible();
    await expect(dishDetailsPage.getIngredientWeightLocator('100г')).toBeVisible();

    await dishDetailsPage.clickEdit();

    const newDishName = 'Рецепт Изменен';
    await dishFormPage.fillName(newDishName);

    await dishFormPage.submit();

    await expect(dishDetailsPage.title).toHaveText(newDishName);
    await expect(dishDetailsPage.updatedAtText).toBeVisible();

    await dishDetailsPage.deleteDish();

    await expect(page).toHaveURL('/dishes');
    await expect(page.locator(`text=${newDishName}`)).not.toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);
  });
});