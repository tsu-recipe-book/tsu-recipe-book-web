import { Page, Locator } from '@playwright/test';

export class ProductFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly compositionInput: Locator;
  readonly categorySelect: Locator;
  readonly statusSelect: Locator;
  readonly caloriesInput: Locator;
  readonly proteinsInput: Locator;
  readonly fatsInput: Locator;
  readonly carbsInput: Locator;
  readonly addPhotoLabel: Locator;
  readonly photoFileInput: Locator;
  readonly firstPhotoCard: Locator;
  readonly deleteFirstPhotoBtn: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder('напр. Куриная грудка');
    this.compositionInput = page.getByPlaceholder('напр. Мука, сахар, яйца...');
    this.categorySelect = page.locator('div:has(> label:has-text("Категория")) select');
    this.statusSelect = page.locator('div:has(> label:has-text("Статус")) select');
    this.caloriesInput = page.locator('div:has(> label:has-text("Калории")) input');
    this.proteinsInput = page.locator('div:has(> label:has-text("Белки")) input');
    this.fatsInput = page.locator('div:has(> label:has-text("Жиры")) input');
    this.carbsInput = page.locator('div:has(> label:has-text("Углеводы")) input');
    this.addPhotoLabel = page.locator('label:has-text("Добавить")');
    this.photoFileInput = this.addPhotoLabel.locator('input[type="file"]');
    this.firstPhotoCard = page.locator('div.relative.aspect-square').first();
    this.deleteFirstPhotoBtn = this.firstPhotoCard.locator('button.bg-red-500');
    this.errorAlert = page.locator('div.bg-red-50');
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillComposition(composition: string) {
    await this.compositionInput.fill(composition);
  }

  async selectCategory(categoryLabel: string) {
    await this.categorySelect.selectOption({ label: categoryLabel });
  }

  async selectCookingStatus(statusLabel: string) {
    await this.statusSelect.selectOption({ label: statusLabel });
  }

  async fillNutrition(calories: string, proteins: string, fats: string, carbs: string) {
    await this.caloriesInput.fill(calories);
    await this.proteinsInput.fill(proteins);
    await this.fatsInput.fill(fats);
    await this.carbsInput.fill(carbs);
  }

  async clickFlag(flagName: string) {
    await this.page.click(`button:has-text("${flagName}")`);
  }

  async uploadPhotos(files: { name: string; mimeType: string; buffer: Buffer }[]) {
    await this.photoFileInput.setInputFiles(files);
  }

  async deleteFirstPhoto() {
    await this.firstPhotoCard.hover();
    await this.deleteFirstPhotoBtn.click();
  }

  async submitCreate() {
    await this.page.click('button:has-text("Создать продукт")');
  }

  async submitUpdate() {
    await this.page.click('button:has-text("Обновить продукт")');
  }

  async isNameRequired(): Promise<boolean> {
    return this.nameInput.evaluate(el => (el as HTMLInputElement).required);
  }
}
