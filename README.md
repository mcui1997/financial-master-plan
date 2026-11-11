# The Financial Master Plan

A calm, complete money plan for regular people. It reads like a short book, and each chapter comes with simple tools that use your own numbers.

**Live site:** https://mcui1997.github.io/financial-master-plan/

## What's inside

- **Start:** one question ("where are you right now?") gives you a reading path for your life stage.
- **Learn:** 17 short chapters in plain words. Each starts with the short version and ends with a quick check. Tap any underlined money word for a definition.
- **Tools:** next-dollar order, mix builder, paycheck splitter, rebalance calculator, retirement planner with a stress test, crash simulator, plus small calculators for savings rate, emergency fund, inflation, compounding, and fees.
- **My Plan:** your inputs from every tool on one page, with a setup checklist and a yearly routine. Print it, or save and load a copy.

## The plan in one paragraph

Build a cushion, fill accounts in the right order, and pick a mix for your life stage. Assets are grouped by job: **Grow** (stocks, a small slice of Bitcoin), **Hedge** (gold, REITs), and **Protect** (bonds, cash). Buy a little every payday, rebalance once a year, and shift from Grow to Protect as retirement gets closer. A "classic" option (stocks and bonds only) is built in for comparison.

## Updating each year

Everything that changes over time lives in [`src/config.js`](src/config.js): contribution limits, example funds, return assumptions, and crash figures. Update it each January and the chapters, tools, and assumptions page all follow. Chapter text uses `{{limit:ira}}` and `{{year}}` placeholders, so limits are never typed by hand.

## Editing content

- Chapter text: `src/content/chapters/<id>.md`
- Chapter titles, short versions, quizzes, reading paths: `src/content/chapters.js`
- Glossary: `src/content/glossary.js`. Link a term in a chapter with `[[term]]` or `[[shown text|key]]`.
- Put a tool inside a chapter on its own line: `{{tool:rebalance}}`. Tool list: `src/tools/index.js`.
- The plan's math: `src/lib/model.js`.

Tests check the math and the content: every glossary link and tool placeholder must resolve, no sentence may run past 40 words, and no long dashes.

## Run it locally

```bash
npm install
npm run dev     # local preview
npm test        # math and content checks
npm run build   # production build into dist/
```

Pushing to `main` runs the tests, builds, and deploys to GitHub Pages.

## Privacy

No server, accounts, analytics, or ads. Inputs are saved only in the reader's browser (`localStorage`), and imported plan files are validated before use. A strict Content Security Policy blocks third-party scripts.

## Disclaimer

For education only. Not financial, tax, legal, or investment advice. Figures are estimates. Fund names are examples, not endorsements.
