# DK Seed Bank

**DK Seed Bank** is a local-first seed collection and gardening recordkeeping app by **DK Softworks**, available in English and Russian. It works in a web browser and as a portable Linux desktop application.

**Web app:** https://dereksparks1982.github.io/seedrepo/

**Linux portable release:** https://github.com/dereksparks1982/seedrepo/releases/download/v0.9.9-linux-portable/DK-Seed-Bank-0.9.9-Linux-x86_64.tar.gz

## Features

- **Garden Planner:** growing conditions, planting calendar, seed inventory and lots, germination checks, garden beds, harvest records, saved seeds, and optional growth history.
- **Planting Journal:** dated plantings, photos, notes, measurements, watering observations, and growth charts. Tracking and reminders remain optional.
- **Sync & Backup:** full JSON backups with verification, restore controls, local/offline storage tools, and opt-in Google Drive synchronization.
- **Recipe Guide:** personal ingredient checklists and culinary references, separate from the actual seed inventory.
- **Monastic Garden:** a standalone historical reference section below Food Preservation, following Recipe Guide. Garden Planner remains near the top.
- **Seed Suppliers:** a standalone section directly below Monastic Garden, with website links to established seed suppliers plus user-added favorite links. No shopping checkout or global seed-variety catalog is built into the app.

## Your data and Google Drive

Records and uploaded photos are stored locally. On the web, connecting Google Drive is **optional** and always uses the account that the individual user authorizes. Private per-device sync snapshots are stored in that account's Google Drive `appDataFolder`. The visible **DK Seed Bank** folder is a separate, readable copy of photographs and a full JSON backup.

The app checks for an existing app-accessible DK Seed Bank folder before offering to create one. It reuses a matching folder's **Drive file ID**, rather than relying solely on its name. If the check fails or multiple matching folders exist, new-folder creation is blocked until the user resolves the ambiguity. Google `drive.file` permission cannot discover arbitrary folders that were not created or opened through the app.

The app preserves change times and deletion markers for locally edited garden records, watering history, and uploaded plant/packet photos. The verified merged snapshot is uploaded before remote records are applied locally. Full backup files can be downloaded and inspected independently. **Keep a separate backup until you have verified recovery on another device.**

On the web, automatic synchronization operates while the app is open and authorized. Google may request reconnection when the access token expires or the browser session closes. The OAuth app may be limited to approved test users until Google publishing and verification are completed. The portable Linux edition has separate desktop OAuth registration requirements.

Detailed setup, permissions, and troubleshooting: [Google Drive Sync](docs/GOOGLE_DRIVE_SYNC.md).

## Development and checks

To prepare the desktop bundle and run local Node regression tests:

```sh
node desktop/prepare.cjs
node --test desktop/test/*.test.cjs
```

Packaging the Linux release requires the desktop dependencies and a supported Linux build environment. The project does not automatically start a build or GitHub Actions workflow for every change.

The web edition includes an offline application shell and optional offline reference-photo caching. Uploaded photos are stored locally; browser storage can still be cleared by the operating system. Full JSON backups remain the portable recovery method.

## Limitations

Two-way cross-device sync, iPhone browser behavior, Google account authorization, offline recovery, and portable Linux packaging require checks in their actual environments. Source and simulated tests do not establish that every live Google account or device is working.

This README intentionally contains **no personal seed packet lists or collection statistics**. Never commit private garden photographs, personal Google Drive content, access tokens, passwords, or other users' account data to this repository.

### Recovery safety: browser quota / interrupted imports

Google Drive sync now prepares changed local JSON records **before** its atomic IndexedDB photograph transaction. If browser quota blocks a JSON write or the photograph transaction fails, the app attempts to restore the previous JSON records and reports any rollback failure. A verified Google Drive recovery snapshot remains available. A sudden power or browser failure between different browser storage systems is not fully atomic; keep independent backups.

**Botanical category icons:** every seed-category heading shows a small representative plant or crop pictogram to the left of its unchanged category name. The icons are decorative and do not identify a specific cultivar, require photo downloads, or alter any inventory record. Mobile sizes are adjusted separately. The former Medieval Monastery Garden heading has been renamed **Monastic Garden** in both English and Russian; its position and interior historical reference remain unchanged.

**Recipe Guide additions:** four measured home-cooking recipes (Salisbury steak, chicken tikka masala, classic meatloaf, and ratatouille) plus a dedicated **Spice Blends** category with seven multi-ingredient mixtures. Original absinthe, pesto, salsa, dill-pickle, user-created recipes, and saved on-hand marks are untouched. New recipes contain measured amounts, ordered preparation steps, and Russian-language fields. True allspice is a single botanical spice and is not listed as a one-ingredient recipe; the guide provides an allspice-style substitute blend.

**One folder reference across devices:** when a visible folder is created, discovered, or explicitly selected, the web app saves its unique Drive folder ID in a tiny, private JSON reference in the authorized account's Google Drive app-data space. A second device checks that reference before searching names. If the folder reference exists but access is denied, the app blocks duplicate creation and asks the user to reconnect the original folder. The pointer contains only a folder ID, not collection data, photos, or credentials. Google authorization and real-device sync still need live verification.

## Seed-saving, harvest and preservation tools (November 2026)

The existing **Garden Planner** contains a bilingual crop-group **Seed Saving Guide** covering mature seed collection, cleaning, drying, open-pollinated versus F1 seed, isolation and crop-specific storage caveats. The saved-seed form now records optional batch names, parent-seed type, isolation method, cleaning method and an optional link to the actual **Planting Journal** entry. Harvest records can also link to their planting. Existing harvest and seed records remain readable, and the same workbench backup/sync records are reused with no new account or storage key. Saved seed rows now appear alongside other seed lots in inventory counts without double counting.

The calendar includes optional planting-stage check-ins, not invented ripening dates. Germination percentages and frost-based planting estimates remain in their original sections. The **Recipe Guide** adds a collapsible bilingual **Food Preservation Guide** covering freezing, drying, refrigerator pickles, fermentation, water-bath canning and pressure canning, with safety notes and reference to the [National Center for Home Food Preservation](https://nchfp.uga.edu/). It does not invent untested processing times or change any existing recipe or pantry checklist.

The seed-saving reference cites [University of Georgia Cooperative Extension](https://extension.uga.edu/publications/detail.html?number=C1242) and [Iowa State Extension](https://yardandgarden.extension.iastate.edu/how-to/how-harvest-and-store-seeds). Species-specific isolation distances, viability, stratification and food safety must still be checked against the crop and a tested source. All tracking is optional. Both web entry points and the offline shell include the new assets; desktop bundling copies the assets folder as usual.

Local checks: `node desktop/prepare.cjs && node --test desktop/test/*.test.cjs`. The desktop and real Google Drive/iPhone flows still require device-specific verification; source checks do not certify live synchronization.

### Food Preservation and recipe navigation

Food Preservation is a standalone main tab directly **under Recipe Guide**, before Monastic Garden and Seed Suppliers. Its safety references remain bilingual. Recipe Guide opens with all inner recipe sections closed. Clicking Meals & Kitchen, Spice Blends, Historical or My Recipes reveals the chosen section; clicking the same section closes it again. Reopening the main Recipe Guide resets visibility without deleting saved recipes, selections, custom recipes or ingredient checkboxes. The collapsed Recipe Guide heading no longer carries a descriptive subtitle. Both web entries and the offline shell are included.

### One visible caution per plant card (November 2026)

A seed card retains its short caution preview while **Planting guide & details** is closed. When that same card's guide is opened, the short preview is hidden and the complete species-specific caution, including who is at risk and source links, is displayed in its place. Closing the guide restores the preview. The rule applies independently to every caution-tagged plant, including newly added or edited entries, in English and Russian. The Caution purpose/filter chip remains visible as a category label. Other plant guidance, photos, watering, seed records and saved data are unchanged. The offline cache and both web entry points are updated.

Other warning generation was checked: inventory re-rendering replaces existing caution blocks rather than stacking them; the workbench does not add its own safety block when the plant has a detailed caution; the Russian safety copy is language-specific rather than a separate additional warning. An automated regression test protects the one-visible-warning rule.

### Watering button navigation

**Watering** on a Planting Journal entry opens any closed parent Garden Planner accordion as well as the Watering Manager, selects the recorded planting, and scrolls to the expanded manager after layout. The Garden Planner shortcut and seed-card watering shortcut use the same path. If a seed card has no linked planting, the manager still opens with explanatory feedback. Opening a manager does not modify watering history.
