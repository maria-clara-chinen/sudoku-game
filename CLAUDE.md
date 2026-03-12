# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Repository Overview

A single-file Portuguese-language (pt-BR) Sudoku web game built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — the entire application lives in `index.html`.

## File Structure

```
sudoku-game/
├── index.html              # Entire application (HTML + CSS + JS, ~923 lines)
├── package.json            # npm config — only dev deps for testing
├── playwright.config.js    # E2E test configuration (3 viewports)
├── tests/
│   ├── centering.spec.js   # Validates number pad / button horizontal centering
│   └── grid-visibility.spec.js  # Validates grid dimensions and visibility
└── .gitignore              # Ignores node_modules/, test-results/, playwright-report/
```

## Architecture

The app is a two-screen SPA managed entirely inside `index.html`:

- **Start screen** — difficulty selection (Easy / Medium / Hard)
- **Game screen** — active gameplay

Screen transitions use `.screen` / `.screen.active` CSS classes toggled by `showScreen(screenId)`. The `<body>` gets `.game-active` during gameplay to switch layout mode.

### Global State Variables (JavaScript)

| Variable | Type | Purpose |
|----------|------|---------|
| `currentGrid` | `number[][]` | Player's current board state (0 = empty) |
| `solutionGrid` | `number[][]` | Fully solved puzzle |
| `initialGrid` | `number[][]` | Original clues — **never mutated during play** |
| `notesGrid` | `number[][][]` | Pencil marks per cell (arrays of candidate numbers) |
| `selectedCell` | `{row, col} \| null` | Currently focused cell |
| `inputMode` | `'normal' \| 'note'` | Active input mode |
| `highlightedNumber` | `number \| null` | Number whose matching cells are highlighted |

### Key Functions

| Function | Location | Description |
|----------|----------|-------------|
| `generateSudoku()` | ~line 590 | Backtracking algorithm, returns solved 9×9 grid |
| `createPuzzle(grid, difficulty)` | ~line 639 | Removes cells based on difficulty level |
| `isValid(grid, row, col, num)` | ~line 583 | Validates placement (row/col/block) |
| `renderGrid()` | ~line 662 | Renders the full 9×9 grid DOM |
| `selectCell(row, col)` | ~line 717 | Handles cell selection and highlighting |
| `selectNumber(num)` | ~line 750 | Handles number pad input (normal + note modes) |
| `checkSolution()` | ~line 797 | Validates board; marks errors/correct cells |
| `toggleDarkMode()` | ~line 572 | Toggles theme and persists to `localStorage` |
| `showScreen(screenId)` | ~line 568 | Navigates between screens |

### Difficulty Settings

| Level | Cells Removed | Clues Remaining |
|-------|--------------|-----------------|
| Easy | 35 | 46 |
| Medium | 45 | 36 |
| Hard | 55 | 26 |

## CSS Architecture

- **CSS Custom Properties** drive the entire theming system (~30 variables for light/dark mode).
- **CSS Grid** is used for the 9×9 sudoku board and the 5-column number pad.
- **Flexbox** handles screen centering and control bar layout.
- **Mobile-first** responsive design with a `@media (max-width: 520px)` breakpoint.
- Grid size uses `min()` to respect both viewport width and height:
  ```css
  width: min(calc(100vw - 48px), min(450px, calc(100dvh - 320px)));
  ```
- Cells use `aspect-ratio: 1` to stay square at all sizes.

### Cell State Classes

| Class | Meaning |
|-------|---------|
| `.fixed` | Pre-filled clue cell (read-only) |
| `.selected` | Currently selected cell |
| `.highlighted` | Shares the same number as selected cell |
| `.error` | Incorrect value (post-check) |
| `.correct` | Correct value (post-check) |

## Development Workflow

### Running Tests

```bash
npm test
# or
npx playwright test
```

Tests run across three viewport profiles defined in `playwright.config.js`:
- **desktop** — 1280×720
- **mobile** — 390×844
- **small-mobile** — 320×568

### Installing Dependencies

```bash
npm install
```

Only installs Playwright and jsdom (dev deps). The game itself has zero runtime dependencies.

### Running the App Locally

Open `index.html` directly in a browser — no server required. Playwright tests use `file://` URL via `page.goto()` with an absolute path.

## Testing Conventions

- All tests are **Playwright E2E** — they render the actual HTML in a headless browser.
- Tests focus on **layout and rendering** correctness, not game logic.
- A shared helper `startGame(page)` clicks a difficulty button to transition to the game screen before assertions.
- Pixel-level tolerances are **1–3px** for centering/alignment checks.
- `toBeLessThan` / `toBeGreaterThan` assertions are preferred over exact equality for layout values to accommodate sub-pixel rendering.

## Conventions

### Naming

- **CSS classes**: kebab-case (`.sudoku-grid`, `.difficulty-card`, `.mode-toggle`)
- **JavaScript functions/variables**: camelCase (`generateSudoku`, `selectCell`, `renderGrid`)
- **HTML data attributes**: `data-row`, `data-col` (zero-indexed) on cell elements

### Language

All UI text and code comments are in **Portuguese (pt-BR)**.

### Code Style

- 4-space indentation throughout.
- No linter or formatter is configured — maintain the existing style manually.
- Functions have Portuguese doc comments explaining their purpose.

## Important Constraints

- **Do not introduce a build step** — the project intentionally has no bundler, transpiler, or framework.
- **Do not add runtime npm dependencies** — keep the game self-contained.
- **Do not modify `initialGrid`** during gameplay; it holds the immutable puzzle clues.
- **Preserve dark mode persistence** — `localStorage` key `darkMode` stores `'true'` or `'false'`.
- When modifying layout, run the full test suite and ensure all three viewport profiles pass.
- Keyboard shortcuts must continue to work: `1–9` for input, `Backspace`/`Delete`/`0` for clear, `N` to toggle note mode.
