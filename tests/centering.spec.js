const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

async function startGame(page) {
  await page.goto(FILE_URL);
  await page.click('.difficulty-card:first-child'); // Fácil
  await page.waitForSelector('.sudoku-grid', { state: 'visible' });
  await page.waitForTimeout(200);
}

test.describe('Centralização horizontal dos botões abaixo do puzzle', () => {

  test('o bloco de números (.number-pad) deve estar centralizado horizontalmente na viewport', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const box = await page.locator('.number-pad').boundingBox();

    expect(box).not.toBeNull();

    const elementCenterX = box.x + box.width / 2;
    const viewportCenterX = viewport.width / 2;

    // O centro horizontal do bloco de números deve coincidir com o centro da viewport (tolerância de 3px)
    expect(Math.abs(elementCenterX - viewportCenterX)).toBeLessThanOrEqual(3);
  });

  test('os botões de modo (.mode-toggle) devem estar centralizados horizontalmente na viewport', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const box = await page.locator('.mode-toggle').boundingBox();

    expect(box).not.toBeNull();

    const elementCenterX = box.x + box.width / 2;
    const viewportCenterX = viewport.width / 2;

    // O centro horizontal do bloco de modos deve coincidir com o centro da viewport (tolerância de 3px)
    expect(Math.abs(elementCenterX - viewportCenterX)).toBeLessThanOrEqual(3);
  });

  test('.number-pad e .mode-toggle devem ter o mesmo centro horizontal entre si', async ({ page }) => {
    await startGame(page);
    const numberPadBox = await page.locator('.number-pad').boundingBox();
    const modeToggleBox = await page.locator('.mode-toggle').boundingBox();

    expect(numberPadBox).not.toBeNull();
    expect(modeToggleBox).not.toBeNull();

    const numberPadCenterX = numberPadBox.x + numberPadBox.width / 2;
    const modeToggleCenterX = modeToggleBox.x + modeToggleBox.width / 2;

    // Ambos os elementos devem compartilhar o mesmo eixo central horizontal (tolerância de 3px)
    expect(Math.abs(numberPadCenterX - modeToggleCenterX)).toBeLessThanOrEqual(3);
  });

  test('.number-pad deve ter margem horizontal simétrica em relação à viewport', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const box = await page.locator('.number-pad').boundingBox();

    expect(box).not.toBeNull();

    const marginLeft = box.x;
    const marginRight = viewport.width - (box.x + box.width);

    // As margens esquerda e direita devem ser iguais (tolerância de 3px)
    expect(Math.abs(marginLeft - marginRight)).toBeLessThanOrEqual(3);
  });

  test('.mode-toggle deve ter margem horizontal simétrica em relação à viewport', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();
    const box = await page.locator('.mode-toggle').boundingBox();

    expect(box).not.toBeNull();

    const marginLeft = box.x;
    const marginRight = viewport.width - (box.x + box.width);

    // As margens esquerda e direita devem ser iguais (tolerância de 3px)
    expect(Math.abs(marginLeft - marginRight)).toBeLessThanOrEqual(3);
  });

  test('os botões dentro de .mode-toggle devem estar centralizados horizontalmente', async ({ page }) => {
    await startGame(page);
    const viewport = page.viewportSize();

    const normalBtn = await page.locator('#normal-mode-btn').boundingBox();
    const noteBtn = await page.locator('#note-mode-btn').boundingBox();

    expect(normalBtn).not.toBeNull();
    expect(noteBtn).not.toBeNull();

    // O par de botões ocupa de normalBtn.x até (noteBtn.x + noteBtn.width)
    const groupLeft = normalBtn.x;
    const groupRight = noteBtn.x + noteBtn.width;
    const groupCenterX = (groupLeft + groupRight) / 2;
    const viewportCenterX = viewport.width / 2;

    // O grupo de botões de modo deve estar centrado na viewport (tolerância de 3px)
    expect(Math.abs(groupCenterX - viewportCenterX)).toBeLessThanOrEqual(3);
  });

});
