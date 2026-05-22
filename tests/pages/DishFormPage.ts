import { Page, Locator } from '@playwright/test';

export class DishFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly productSearchInput: Locator;
  readonly addPhotoLabel: Locator;
  readonly photoFileInput: Locator;
  readonly firstPhotoCard: Locator;
  readonly deleteFirstPhotoBtn: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder('напр. Куриная грудка');
    this.productSearchInput = page.getByPlaceholder('Поиск продуктов...');
    this.addPhotoLabel = page.locator('label:has-text("Добавить")');
    this.photoFileInput = this.addPhotoLabel.locator('input[type="file"]');
    this.firstPhotoCard = page.locator('div.relative.aspect-square').first();
    this.deleteFirstPhotoBtn = this.firstPhotoCard.locator('button.bg-red-500');
    this.submitBtn = page.locator('button[type="submit"]');
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async blurName() {
    await this.nameInput.blur();
  }

  async searchProduct(name: string) {
    await this.productSearchInput.fill(name);
  }

  async addIngredient(name: string) {
    await this.searchProduct(name);
    await this.page.click(`button:has-text("${name}")`);
  }

  async fillIngredientWeight(productName: string, weight: string) {
    const weightInput = this.page.locator(`div.group:has(div:has-text("${productName}")) input[type="number"]`);
    await weightInput.fill(weight);
  }

  async getNutritionPlaceholder(fieldLabel: 'Калории' | 'Белки' | 'Жиры' | 'Углеводы' | 'Вес порции'): Promise<string | null> {
    return this.page.locator(`div:has(> label:has-text("${fieldLabel}")) input`).getAttribute('placeholder');
  }

  async getNutritionValue(fieldLabel: 'Калории' | 'Белки' | 'Жиры' | 'Углеводы' | 'Вес порции'): Promise<string> {
    return this.page.locator(`div:has(> label:has-text("${fieldLabel}")) input`).inputValue();
  }

  getCategoryButton(categoryName: string): Locator {
    return this.page.locator(`button:has-text("${categoryName}")`);
  }

  async selectCategory(categoryName: string) {
    await this.getCategoryButton(categoryName).click();
  }

  getFlagButton(flagName: string): Locator {
    return this.page.locator(`button:has-text("${flagName}")`);
  }

  async clickFlag(flagName: string) {
    await this.getFlagButton(flagName).click();
  }

  async uploadPhotos(files: { name: string; mimeType: string; buffer: Buffer }[]) {
    await this.photoFileInput.setInputFiles(files);
  }

  async deleteFirstPhoto() {
    await this.firstPhotoCard.hover();
    await this.deleteFirstPhotoBtn.click();
  }

  async submit() {
    await this.submitBtn.click();
  }

  async isNameRequired(): Promise<boolean> {
    return this.nameInput.evaluate(el => (el as HTMLInputElement).required);
  }
}
