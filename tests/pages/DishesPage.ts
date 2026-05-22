import { Page, Locator } from '@playwright/test';

export class DishesPage {
  readonly page: Page;
  readonly createDishBtn: Locator;
  readonly searchInput: Locator;
  readonly filtersBtn: Locator;
  readonly resetAllFiltersBtn: Locator;
  readonly sortSelect: Locator;
  readonly dishCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createDishBtn = page.locator('button:has-text("Создать новое блюдо")');
    this.searchInput = page.getByPlaceholder('Поиск блюд...');
    this.filtersBtn = page.locator('button:has-text("Фильтры")');
    this.resetAllFiltersBtn = page.locator('text=Сбросить все');
    this.sortSelect = page.locator('select');
    this.dishCards = page.locator('div.group h3');
  }

  async navigate() {
    await this.page.goto('/dishes');
  }

  async clickCreateDish() {
    await this.createDishBtn.click();
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

  async clickDish(name: string) {
    await this.dishCards.filter({ hasText: name }).first().click();
  }

  async getFirstDishCardText(): Promise<string> {
    return this.dishCards.nth(0).innerText();
  }
}
