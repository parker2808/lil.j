# Lessons

- 2026-10-31 — Apps Script `setup` crashed on Parker's real Sheet (`setFrozenRows(1).setHiddenGridlines`): `Sheet.setFrozenRows` and `Sheet.hideColumns` return void, but the fake Sheet returned `this`, so tests passed. Rule: fakes for Google APIs must mirror the documented return type of every method (void → `undefined`); check each chained call against the Apps Script reference before shipping.
- 2026-10-31 — Upgrade guide told Parker to run `setup` before redeploying. The live web app runs the deployed version, so old code could write old-layout rows into the migrated tab. Rule: when a script changes the data layout, deploy the new version first (it must migrate on its own), then run setup.
