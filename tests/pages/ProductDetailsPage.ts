import { Page, Locator } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly createdAtText: Locator;
  readonly updatedAtText: Locator;
  readonly caloriesVal: Locator;
  readonly proteinsVal: Locator;
  readonly fatsVal: Locator;
  readonly carbsVal: Locator;
  readonly editBtn: Locator;
  readonly deleteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.createdAtText = page.locator('text=Дата создания:');
    this.updatedAtText = page.locator('text=Дата редактирования:');
    this.caloriesVal = page.locator('.bg-orange-50 .text-2xl');
    this.proteinsVal = page.locator('.bg-blue-50 .text-2xl');
    this.fatsVal = page.locator('.bg-amber-50 .text-2xl');
    this.carbsVal = page.locator('.bg-green-50 .text-2xl');
    this.editBtn = page.locator('button:has-text("Редактировать")');
    this.deleteBtn = page.locator('button:has-text("Удалить")');
  }

  async clickEdit() {
    await this.editBtn.click();
  }

  async deleteProduct() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    this.page.once('dialog', dialog => dialog.accept());
    await this.deleteBtn.click({ force: true });
  }

  async deleteProductWithManualDialog(dialogAction: (dialog: any) => Promise<void>) {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    this.page.once('dialog', dialogAction);
    await this.deleteBtn.click({ force: true });
  }

  getCompositionLocator(composition: string): Locator {
    return this.page.locator(`text=${composition}`);
  }

  getFlagLocator(flagName: string): Locator {
    return this.page.locator(`span:has-text("${flagName}")`);
  }
}
