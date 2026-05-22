import { test, expect, APIRequestContext } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

test.describe('Product Management', () => {
  let productsPage: ProductsPage;
  let productFormPage: ProductFormPage;
  let productDetailsPage: ProductDetailsPage;

  const cleanOldDishes = async (request: APIRequestContext) => {
    const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/dishes');
    if (!res.ok()) return;

    const dishes = await res.json();
    const namesToClean = [
      'Тестовое Блюдо', 'Борщ домашний', 'Вкусный Тортик', 'Странное Блюдо', 'Рецепт Изменен',
      'Блюдо для Редактирования', 'Блюдо с ингредиентом', 'Ааа Веган Салат', 'Яяя Мясной Суп',
      'А', 'Аб', 'Абв', 'Яблоко'
    ];
    const cleanSet = new Set(namesToClean.map(n => n.trim().toLowerCase()));
    const dishesToDelete = dishes.filter((d: any) => d.name && cleanSet.has(d.name.trim().toLowerCase()));

    await Promise.all(dishesToDelete.map((d: any) =>
      request.delete(`https://tsu-recipe.orexi4.ru/api/v1/dishes/${d.id}`)
    ));
  };

  const cleanOldProducts = async (request: APIRequestContext) => {
    const res = await request.get('https://tsu-recipe.orexi4.ru/api/v1/products');
    if (!res.ok()) return;

    const products = await res.json();
    const namesToClean = [
      'Аб', 'Абв', 'Тест БЖУ Гран', 'Диетический Тофу', 'Овсянка',
      'До изменения', 'После изменения', 'Ааа Веган Продукт', 'Яяя Мясной Продукт',
      'Ингредиент А', 'Ингредиент Б', 'Веганский Продукт'
    ];
    const cleanSet = new Set(namesToClean.map(n => n.trim().toLowerCase()));
    const productsToDelete = products.filter((p: any) => p.name && cleanSet.has(p.name.trim().toLowerCase()));

    await Promise.all(productsToDelete.map((p: any) =>
      request.delete(`https://tsu-recipe.orexi4.ru/api/v1/products/${p.id}`)
    ));
  };

  test.beforeAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanOldDishes(request);
    await cleanOldProducts(request);
  });

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    productFormPage = new ProductFormPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    await productsPage.navigate();
  });

  test('[1.1] Product name length validation (BVA: 0, 1, 2, 3 chars)', async ({ page }) => {
    await productsPage.clickCreateProduct();
    await expect(page).toHaveURL('/products/new');

    await productFormPage.fillName('');
    await productFormPage.fillNutrition('100', '10', '5', '2');

    const isRequired = await productFormPage.isNameRequired();
    expect(isRequired).toBe(true);

    await productFormPage.fillName('А');
    await productFormPage.submitCreate();

    await expect(productFormPage.errorAlert).toBeVisible();
    await expect(productFormPage.errorAlert).toContainText('Название должно быть не менее 2 символов');

    await productFormPage.fillName('Аб');
    await productFormPage.fillNutrition('100', '10', '5', '2');
    await productFormPage.submitCreate();
    await expect(page).toHaveURL('/products');

    await productsPage.clickCreateProduct();
    await productFormPage.fillName('Абв');
    await productFormPage.fillNutrition('100', '10', '5', '2');
    await productFormPage.submitCreate();
    await expect(page).toHaveURL('/products');

    await productsPage.clickProduct('Аб');
    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');

    await productsPage.clickProduct('Абв');
    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');
  });

  test('[1.2] PFC sum validation (BVA: 99.9g, 100.0g, 100.1g, 200.0g)', async ({ page }) => {
    await productsPage.clickCreateProduct();

    const testName = 'Тест БЖУ Гран';
    await productFormPage.fillName(testName);

    await productFormPage.caloriesInput.fill('150');
    await productFormPage.proteinsInput.fill('30');
    await productFormPage.fatsInput.fill('30');

    await productFormPage.carbsInput.fill('140');
    await productFormPage.submitCreate();
    await expect(productFormPage.errorAlert).toBeVisible();
    await expect(productFormPage.errorAlert).toContainText('Сумма белков, жиров и углеводов не может превышать 100г');

    await productFormPage.carbsInput.fill('40.1');
    await productFormPage.submitCreate();
    await expect(productFormPage.errorAlert).toBeVisible();
    await expect(productFormPage.errorAlert).toContainText('Сумма белков, жиров и углеводов не может превышать 100г');

    await productFormPage.carbsInput.fill('40.0');
    await productFormPage.submitCreate();
    await expect(page).toHaveURL('/products');

    await productsPage.clickProduct(testName);
    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');

    await productsPage.clickCreateProduct();
    await productFormPage.fillName(testName);
    await productFormPage.caloriesInput.fill('150');
    await productFormPage.proteinsInput.fill('30');
    await productFormPage.fatsInput.fill('30');
    await productFormPage.carbsInput.fill('39.9');
    await productFormPage.submitCreate();
    await expect(page).toHaveURL('/products');

    await productsPage.clickProduct(testName);
    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');
  });

  test('[1.3] Product photos limit validation (BVA: 4 vs 5 photos)', async ({ page }) => {
    await productsPage.clickCreateProduct();

    const files = Array.from({ length: 5 }, (_, i) => ({
      name: `photo_${i}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    }));

    await productFormPage.uploadPhotos(files.slice(0, 4));
    await expect(productFormPage.addPhotoLabel).toBeVisible();

    await productFormPage.uploadPhotos([files[4]]);
    await expect(productFormPage.addPhotoLabel).not.toBeVisible();

    await productFormPage.deleteFirstPhoto();
    await expect(productFormPage.addPhotoLabel).toBeVisible();
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
    },
    {
      name: 'Овсянка',
      composition: 'Овес цельнозерновой',
      category: 'Крупы',
      cookingRequired: 'Требует приготовления',
      calories: '389',
      proteins: '16.9',
      fats: '6.9',
      carbs: '66.3',
      flags: ['Веган', 'Без сахара']
    }
  ];

  test('[1.4] Create product with all fields: Овощи (готовые)', async ({ page }) => {
    const data = testData[0];
    await productsPage.clickCreateProduct();

    await productFormPage.fillName(data.name);
    await productFormPage.fillComposition(data.composition);

    await productFormPage.selectCategory(data.category);
    await productFormPage.selectCookingStatus(data.cookingRequired);

    await productFormPage.fillNutrition(data.calories, data.proteins, data.fats, data.carbs);

    for (const flag of data.flags) {
      await productFormPage.clickFlag(flag);
    }

    await productFormPage.submitCreate();

    await expect(page).toHaveURL('/products');
    await expect(page.locator(`text=${data.name}`)).toBeVisible();

    await productsPage.clickProduct(data.name);
    await expect(productDetailsPage.title).toHaveText(data.name);
    await expect(productDetailsPage.createdAtText).toBeVisible();
    await expect(productDetailsPage.getCompositionLocator(data.composition)).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.calories}"`).first()).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.proteins}"`).first()).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.fats}"`).first()).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.carbs}"`).first()).toBeVisible();

    for (const flag of data.flags) {
      await expect(productDetailsPage.getFlagLocator(flag)).toBeVisible();
    }

    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');
  });

  test('[1.4] Create product with all fields: Крупы (сырые)', async ({ page }) => {
    const data = testData[1];
    await productsPage.clickCreateProduct();

    await productFormPage.fillName(data.name);
    await productFormPage.fillComposition(data.composition);

    await productFormPage.selectCategory(data.category);
    await productFormPage.selectCookingStatus(data.cookingRequired);

    await productFormPage.fillNutrition(data.calories, data.proteins, data.fats, data.carbs);

    for (const flag of data.flags) {
      await productFormPage.clickFlag(flag);
    }

    await productFormPage.submitCreate();

    await expect(page).toHaveURL('/products');
    await expect(page.locator(`text=${data.name}`)).toBeVisible();

    await productsPage.clickProduct(data.name);
    await expect(productDetailsPage.title).toHaveText(data.name);
    await expect(productDetailsPage.createdAtText).toBeVisible();
    await expect(productDetailsPage.getCompositionLocator(data.composition)).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.calories}"`).first()).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.proteins}"`).first()).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.fats}"`).first()).toBeVisible();
    await expect(productDetailsPage.page.locator(`text="${data.carbs}"`).first()).toBeVisible();

    for (const flag of data.flags) {
      await expect(productDetailsPage.getFlagLocator(flag)).toBeVisible();
    }

    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');
  });

  test('[1.5] Edit existing product', async ({ page }) => {
    const nameBefore = 'До изменения';
    const nameAfter = 'После изменения';

    await productsPage.clickCreateProduct();
    await productFormPage.fillName(nameBefore);
    await productFormPage.fillNutrition('50', '5', '2', '1');
    await productFormPage.submitCreate();
    await page.waitForURL('**/products');

    await expect(page.locator(`text=${nameBefore}`)).toBeVisible();
    await productsPage.clickProduct(nameBefore);
    await productDetailsPage.clickEdit();

    await productFormPage.fillName(nameAfter);
    await productFormPage.fillNutrition('99', '9', '3', '5');
    await productFormPage.submitUpdate();

    await expect(productDetailsPage.title).toHaveText(nameAfter);
    await expect(productDetailsPage.updatedAtText).toBeVisible();

    await expect(productDetailsPage.caloriesVal).toHaveText('99');
    await expect(productDetailsPage.proteinsVal).toHaveText('9');
    await expect(productDetailsPage.fatsVal).toHaveText('3');
    await expect(productDetailsPage.carbsVal).toHaveText('5');

    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');
  });

  test('[1.6] Search, filter, and sort products', async ({ page }) => {
    const prodA = 'Ааа Веган Продукт';
    await productsPage.clickCreateProduct();
    await productFormPage.fillName(prodA);
    await productFormPage.selectCategory('Овощи');
    await productFormPage.selectCookingStatus('Готов к употреблению');
    await productFormPage.fillNutrition('10', '1', '0', '1');
    await productFormPage.clickFlag('Веган');
    await productFormPage.submitCreate();
    await page.waitForURL('**/products');

    const prodB = 'Яяя Мясной Продукт';
    await productsPage.clickCreateProduct();
    await productFormPage.fillName(prodB);
    await productFormPage.selectCategory('Мясо');
    await productFormPage.selectCookingStatus('Требует приготовления');
    await productFormPage.fillNutrition('500', '25', '40', '0');
    await productFormPage.submitCreate();
    await page.waitForURL('**/products');

    await productsPage.search(prodA);
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`).first()).not.toBeVisible();

    await productsPage.search('');
    await productsPage.toggleFilters();

    await productsPage.clickFilter('Мясо');
    await expect(page.locator(`text=${prodB}`)).toBeVisible();
    await expect(page.locator(`text=${prodA}`).first()).not.toBeVisible();
    await productsPage.clickFilter('Мясо');

    await productsPage.clickFilter('Готов к употреблению');
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`).first()).not.toBeVisible();
    await productsPage.clickFilter('Готов к употреблению');

    await productsPage.clickFilter('Веган');
    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await expect(page.locator(`text=${prodB}`).first()).not.toBeVisible();

    await productsPage.resetFilters();
    await productsPage.toggleFilters();

    await productsPage.search('Продукт');

    await productsPage.selectSort('По белкам (убыв.)');
    await expect.poll(async () => await productsPage.getFirstProductCardText()).toContain(prodB);

    await productsPage.selectSort('По калорийности (возр.)');
    await expect.poll(async () => await productsPage.getFirstProductCardText()).toContain(prodA);

    await productsPage.search('');

    await expect(page.locator(`text=${prodA}`)).toBeVisible();
    await productsPage.clickProduct(prodA);
    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');

    await expect(page.locator(`text=${prodB}`)).toBeVisible();
    await productsPage.clickProduct(prodB);
    await productDetailsPage.deleteProduct();
    await expect(page).toHaveURL('/products');
  });
});
