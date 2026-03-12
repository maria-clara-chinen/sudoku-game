const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

async function startGame(page) {
  await page.goto(FILE_URL);
  await page.click('.difficulty-card:first-child'); // Fácil
  await page.waitForSelector('.sudoku-grid', { state: 'visible' });
  await page.waitForTimeout(200);
}

// Encontra a primeira célula editável (não fixa) no grid
async function findEditableCell(page) {
  const cells = page.locator('.cell:not(.fixed)');
  const count = await cells.count();
  for (let i = 0; i < count; i++) {
    const box = await cells.nth(i).boundingBox();
    if (box) return cells.nth(i);
  }
  return null;
}

test.describe('Estabilidade do puzzle no modo de anotação', () => {

  test('o grid não deve mudar de tamanho ao entrar no modo anotação', async ({ page }) => {
    await startGame(page);
    const grid = page.locator('.sudoku-grid');

    const boxBefore = await grid.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Entra no modo de anotação
    await page.click('#note-mode-btn');
    await page.waitForTimeout(100);

    const boxAfter = await grid.boundingBox();
    expect(boxAfter).not.toBeNull();

    expect(Math.abs(boxAfter.width - boxBefore.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.height - boxBefore.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.y - boxBefore.y)).toBeLessThanOrEqual(1);
  });

  test('o grid não deve mudar de tamanho ao clicar em números no modo anotação', async ({ page }) => {
    await startGame(page);
    const grid = page.locator('.sudoku-grid');

    // Registra dimensões iniciais
    const boxBefore = await grid.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Entra no modo de anotação
    await page.click('#note-mode-btn');

    // Seleciona uma célula editável
    const editableCell = await findEditableCell(page);
    expect(editableCell).not.toBeNull();
    await editableCell.click();
    await page.waitForTimeout(50);

    // Clica em vários números no teclado numérico
    const numberButtons = page.locator('.number-pad button');
    await numberButtons.nth(0).click(); // 1
    await page.waitForTimeout(50);
    await numberButtons.nth(1).click(); // 2
    await page.waitForTimeout(50);
    await numberButtons.nth(2).click(); // 3
    await page.waitForTimeout(50);

    const boxAfter = await grid.boundingBox();
    expect(boxAfter).not.toBeNull();

    // O grid não deve ter se movido nem redimensionado
    expect(Math.abs(boxAfter.width - boxBefore.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.height - boxBefore.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.y - boxBefore.y)).toBeLessThanOrEqual(1);
  });

  test('o grid não deve mudar de posição ao alternar entre modos normal e anotação várias vezes', async ({ page }) => {
    await startGame(page);
    const grid = page.locator('.sudoku-grid');

    const boxBefore = await grid.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Alterna entre modos várias vezes
    for (let i = 0; i < 4; i++) {
      await page.click('#note-mode-btn');
      await page.waitForTimeout(50);
      await page.click('#normal-mode-btn');
      await page.waitForTimeout(50);
    }

    const boxAfter = await grid.boundingBox();
    expect(boxAfter).not.toBeNull();

    expect(Math.abs(boxAfter.width - boxBefore.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.height - boxBefore.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.y - boxBefore.y)).toBeLessThanOrEqual(1);
  });

  test('botões do teclado numérico devem ter touch-action: manipulation', async ({ page }) => {
    await startGame(page);

    const touchAction = await page.evaluate(() => {
      const btn = document.querySelector('.number-pad button');
      return window.getComputedStyle(btn).touchAction;
    });

    expect(touchAction).toBe('manipulation');
  });

  test('o grid deve ter touch-action: manipulation', async ({ page }) => {
    await startGame(page);

    const touchAction = await page.evaluate(() => {
      const grid = document.querySelector('.sudoku-grid');
      return window.getComputedStyle(grid).touchAction;
    });

    expect(touchAction).toBe('manipulation');
  });

  test('células do grid devem ter touch-action: manipulation', async ({ page }) => {
    await startGame(page);

    const touchAction = await page.evaluate(() => {
      const cell = document.querySelector('.cell');
      return window.getComputedStyle(cell).touchAction;
    });

    expect(touchAction).toBe('manipulation');
  });

  test('o grid não deve mudar ao inserir anotações rapidamente em sequência', async ({ page }) => {
    await startGame(page);
    const grid = page.locator('.sudoku-grid');

    const boxBefore = await grid.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Entra no modo de anotação
    await page.click('#note-mode-btn');

    // Seleciona uma célula editável e insere vários números rapidamente
    const editableCell = await findEditableCell(page);
    expect(editableCell).not.toBeNull();
    await editableCell.click();

    const numberButtons = page.locator('.number-pad button');
    // Clica em todos os 9 números sem pausa significativa
    for (let i = 0; i < 9; i++) {
      await numberButtons.nth(i).click();
    }

    await page.waitForTimeout(100);

    const boxAfter = await grid.boundingBox();
    expect(boxAfter).not.toBeNull();

    expect(Math.abs(boxAfter.width - boxBefore.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.height - boxBefore.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.x - boxBefore.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter.y - boxBefore.y)).toBeLessThanOrEqual(1);
  });

});
