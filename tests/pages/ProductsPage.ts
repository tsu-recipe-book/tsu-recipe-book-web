import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly createProductBtn: Locator;
  readonly searchInput: Locator;
  readonly filtersBtn: Locator;
  readonly resetAllFiltersBtn: Locator;
  readonly sortSelect: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createProductBtn = page.locator('button:has-text("Создать новый продукт")');
    this.searchInput = page.getByPlaceholder('Поиск продуктов...');
    this.filtersBtn = page.locator('button:has-text("Фильтры")');
    this.resetAllFiltersBtn = page.locator('text=Сбросить все');
    this.sortSelect = page.locator('select');
    this.productCards = page.locator('div.group h3');
  }

  async navigate() {
    await this.page.goto('/products');
  }

  async clickCreateProduct() {
    await this.createProductBtn.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async toggleFilters() {
    await this.filtersBtn.click();
  }

  async clickFilter(name: string) {
    await this.page.locator(`button:has-text("${name}")`).click();
  }

  async resetFilters() {
    await this.resetAllFiltersBtn.click();
  }

  async selectSort(optionText: string) {
    await this.sortSelect.selectOption({ label: optionText });
  }

  async clickProduct(name: string) {
    await this.page.click(`text=${name}`);
  }

  async getFirstProductCardText(): Promise<string> {
    return this.productCards.nth(0).innerText();
  }
}
