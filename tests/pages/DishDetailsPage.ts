import { Page, Locator } from '@playwright/test';

export class DishDetailsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly createdAtText: Locator;
  readonly updatedAtText: Locator;
  readonly editBtn: Locator;
  readonly deleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.createdAtText = page.locator('text=Дата создания:');
    this.updatedAtText = page.locator('text=Дата редактирования:');
    this.editBtn = page.locator('button:has-text("Редактировать")');
    this.deleteBtn = page.locator('button:has-text("Удалить")');
  }

  async clickEdit() {
    await this.editBtn.click();
  }

  async deleteDish() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    this.page.once('dialog', dialog => dialog.accept());
    await this.deleteBtn.click({ force: true });
  }

  async deleteDishWithManualDialog(dialogAction: (dialog: any) => Promise<void>) {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    this.page.once('dialog', dialogAction);
    await this.deleteBtn.click({ force: true });
  }

  getIngredientLocator(productName: string): Locator {
    return this.page.locator(`text=${productName}`);
  }

  getIngredientWeightLocator(weightText: string): Locator {
    return this.page.locator(`text=${weightText}`);
  }

  getCategoryLocator(categoryName: string): Locator {
    return this.page.locator(`span:has-text("${categoryName}")`);
  }
}
