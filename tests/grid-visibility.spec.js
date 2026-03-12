const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

// Inicia um jogo e aguarda o grid estar visível
async function startGame(page) {
  await page.goto(FILE_URL);
  await page.click('.difficulty-card:first-child'); // Fácil
  await page.waitForSelector('.sudoku-grid', { state: 'visible' });
  // Pequena espera para CSS aplicar
  await page.waitForTimeout(200);
}

test.describe('Visibilidade do puzzle - todas as linhas e colunas', () => {

  test('todos os 81 células devem existir no DOM', async ({ page }) => {
    await startGame(page);
    const cells = page.locator('.cell');
    await expect(cells).toHaveCount(81);
  });

  test('nenhuma célula deve estar fora do limite direito da viewport', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const cells = page.locator('.cell');
    const count = await cells.count();

    for (let i = 0; i < count; i++) {
      const box = await cells.nth(i).boundingBox();
      expect(box).not.toBeNull();

      const cellRight = box.x + box.width;
      expect(cellRight).toBeLessThanOrEqual(viewport.width + 1); // tolerância de 1px
    }
  });

  test('nenhuma célula deve estar fora do limite esquerdo da viewport', async ({ page }) => {
    await startGame(page);
    const cells = page.locator('.cell');
    const count = await cells.count();

    for (let i = 0; i < count; i++) {
      const box = await cells.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(-1); // tolerância de 1px
    }
  });

  test('a última coluna (coluna 9) deve ser inteiramente visível', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();

    // Células da coluna 9: índices 8, 17, 26, 35, 44, 53, 62, 71, 80
    const lastColIndices = [8, 17, 26, 35, 44, 53, 62, 71, 80];
    const cells = page.locator('.cell');

    for (const idx of lastColIndices) {
      const box = await cells.nth(idx).boundingBox();
      expect(box).not.toBeNull();

      const cellRight = box.x + box.width;
      expect(cellRight).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.x).toBeGreaterThanOrEqual(-1);
      // A célula deve ter tamanho positivo
      expect(box.width).toBeGreaterThan(10);
      expect(box.height).toBeGreaterThan(10);
    }
  });

  test('a primeira coluna (coluna 1) deve ser inteiramente visível', async ({ page }) => {
    await startGame(page);

    // Células da coluna 1: índices 0, 9, 18, 27, 36, 45, 54, 63, 72
    const firstColIndices = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    const cells = page.locator('.cell');

    for (const idx of firstColIndices) {
      const box = await cells.nth(idx).boundingBox();
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.width).toBeGreaterThan(10);
    }
  });

  test('o grid deve ser quadrado (largura = altura)', async ({ page }) => {
    await startGame(page);
    const grid = page.locator('.sudoku-grid');
    const box = await grid.boundingBox();
    expect(box).not.toBeNull();

    // O grid deve ser aproximadamente quadrado (tolerância de 2px por bordas)
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(2);
  });

  test('o grid deve ter tamanho mínimo jogável (≥ 180px)', async ({ page }) => {
    await startGame(page);
    const grid = page.locator('.sudoku-grid');
    const box = await grid.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(180);
    expect(box.height).toBeGreaterThanOrEqual(180);
  });

  test('o grid não deve ultrapassar a viewport horizontalmente', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const grid = page.locator('.sudoku-grid');
    const box = await grid.boundingBox();
    expect(box).not.toBeNull();

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  });

  test('todas as 9 linhas devem ter células com posições y distintas e visíveis', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const cells = page.locator('.cell');
    const rowYPositions = new Set();

    // Verificar a primeira célula de cada linha (índices 0, 9, 18, ..., 72)
    for (let row = 0; row < 9; row++) {
      const idx = row * 9;
      const box = await cells.nth(idx).boundingBox();
      expect(box).not.toBeNull();

      // A célula deve ser visível verticalmente
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(box.height).toBeGreaterThan(10);

      rowYPositions.add(Math.round(box.y));
    }

    // 9 linhas distintas => 9 posições y diferentes
    expect(rowYPositions.size).toBe(9);
  });

  test('todas as 9 colunas devem ter posições x distintas e visíveis', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const cells = page.locator('.cell');
    const colXPositions = new Set();

    // Verificar a primeira célula de cada coluna (índices 0, 1, 2, ..., 8 — linha 1)
    for (let col = 0; col < 9; col++) {
      const box = await cells.nth(col).boundingBox();
      expect(box).not.toBeNull();

      // A célula deve ser visível horizontalmente
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.width).toBeGreaterThan(10);

      colXPositions.add(Math.round(box.x));
    }

    // 9 colunas distintas => 9 posições x diferentes
    expect(colXPositions.size).toBe(9);
  });

});
