const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

async function startGame(page) {
  await page.goto(FILE_URL);
  await page.click('.difficulty-card:first-child'); // Fácil
  await page.waitForSelector('.sudoku-grid', { state: 'visible' });
  await page.waitForTimeout(200);
}

// Retorna a primeira célula não-fixa do grid
async function primeiracelulalivre(page) {
  const cells = page.locator('.cell:not(.fixed)');
  const count = await cells.count();
  for (let i = 0; i < count; i++) {
    const box = await cells.nth(i).boundingBox();
    if (box && box.width > 0) {
      return cells.nth(i);
    }
  }
  return cells.first();
}

test.describe('Prevenção de zoom indevido no puzzle', () => {

  test('touch-action deve ser manipulation no elemento html', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('html').evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('touch-action deve ser manipulation no body', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('touch-action deve ser manipulation no .sudoku-grid', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('.sudoku-grid').evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('touch-action deve ser manipulation nas células (.cell)', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('.cell').first().evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('touch-action deve ser manipulation nos botões do teclado numérico', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('.number-pad button').first().evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('touch-action deve ser manipulation no container do teclado numérico (.number-pad)', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('.number-pad').evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('touch-action deve ser manipulation nos botões de modo (.mode-toggle)', async ({ page }) => {
    await startGame(page);
    const touchAction = await page.locator('.mode-toggle').evaluate(el =>
      window.getComputedStyle(el).touchAction
    );
    expect(touchAction).toBe('manipulation');
  });

  test('o tamanho do grid não deve mudar ao ativar modo anotação e clicar um número', async ({ page }) => {
    await startGame(page);

    const gridAntes = await page.locator('.sudoku-grid').boundingBox();
    expect(gridAntes).not.toBeNull();

    // Seleciona uma célula livre
    const celula = await primeiracelulalivre(page);
    await celula.click();
    await page.waitForTimeout(50);

    // Ativa modo anotação
    await page.click('#note-mode-btn');
    await page.waitForTimeout(50);

    // Clica no número 1 no teclado numérico
    await page.locator('.number-pad button').first().click();
    await page.waitForTimeout(100);

    const gridDepois = await page.locator('.sudoku-grid').boundingBox();
    expect(gridDepois).not.toBeNull();

    // O grid não deve ter mudado de posição nem tamanho (tolerância de 2px)
    expect(Math.abs(gridDepois.width - gridAntes.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.height - gridAntes.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.x - gridAntes.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.y - gridAntes.y)).toBeLessThanOrEqual(2);
  });

  test('o tamanho do grid não deve mudar ao clicar múltiplos números em modo anotação', async ({ page }) => {
    await startGame(page);

    const gridAntes = await page.locator('.sudoku-grid').boundingBox();
    expect(gridAntes).not.toBeNull();

    // Seleciona uma célula livre
    const celula = await primeiracelulalivre(page);
    await celula.click();

    // Ativa modo anotação
    await page.click('#note-mode-btn');

    // Clica em vários números rapidamente
    const botoesNumericos = page.locator('.number-pad button');
    await botoesNumericos.nth(0).click();
    await botoesNumericos.nth(1).click();
    await botoesNumericos.nth(2).click();
    await page.waitForTimeout(150);

    const gridDepois = await page.locator('.sudoku-grid').boundingBox();
    expect(gridDepois).not.toBeNull();

    expect(Math.abs(gridDepois.width - gridAntes.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.height - gridAntes.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.x - gridAntes.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.y - gridAntes.y)).toBeLessThanOrEqual(2);
  });

  test('o tamanho do grid não deve mudar ao alternar entre modos normal e anotação', async ({ page }) => {
    await startGame(page);

    const gridAntes = await page.locator('.sudoku-grid').boundingBox();
    expect(gridAntes).not.toBeNull();

    // Alterna entre modos várias vezes
    await page.click('#note-mode-btn');
    await page.click('#normal-mode-btn');
    await page.click('#note-mode-btn');
    await page.waitForTimeout(150);

    const gridDepois = await page.locator('.sudoku-grid').boundingBox();
    expect(gridDepois).not.toBeNull();

    expect(Math.abs(gridDepois.width - gridAntes.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridDepois.height - gridAntes.height)).toBeLessThanOrEqual(2);
  });

  test('o scale da página deve permanecer 1 após interações com o puzzle', async ({ page }) => {
    await startGame(page);

    // Obtém o scale atual do viewport via meta viewport ou visual viewport
    const scaleAntes = await page.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1);

    const celula = await page.locator('.cell:not(.fixed)').first();
    await celula.click();
    await page.click('#note-mode-btn');
    await page.locator('.number-pad button').nth(2).click();
    await page.locator('.number-pad button').nth(4).click();
    await page.waitForTimeout(150);

    const scaleDepois = await page.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1);

    // O scale deve permanecer o mesmo (sem zoom automático)
    expect(scaleDepois).toBeCloseTo(scaleAntes, 2);
  });

});
