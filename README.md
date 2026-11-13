# DK Chef Companion

**DK Chef Companion** is a local-first seed collection and gardening recordkeeping app by **DK Softworks**, available in English and Russian. It works in a web browser and as a portable Linux desktop application.

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

The calendar includes optional planting-stage check-ins, not invented ripening dates. Germination percentages and frost-based planting estimates remain in their original sections. The standalone **Food Preservation** tab contains a bilingual reference covering freezing, drying, refrigerator pickles, fermentation, water-bath canning and pressure canning, with safety notes and reference to the [National Center for Home Food Preservation](https://nchfp.uga.edu/). It does not invent untested processing times or change any existing recipe or pantry checklist.

The seed-saving reference cites [University of Georgia Cooperative Extension](https://extension.uga.edu/publications/detail.html?number=C1242) and [Iowa State Extension](https://yardandgarden.extension.iastate.edu/how-to/how-harvest-and-store-seeds). Species-specific isolation distances, viability, stratification and food safety must still be checked against the crop and a tested source. All tracking is optional. Both web entry points and the offline shell include the new assets; desktop bundling copies the assets folder as usual.

Local checks: `node desktop/prepare.cjs && node --test desktop/test/*.test.cjs`. The desktop and real Google Drive/iPhone flows still require device-specific verification; source checks do not certify live synchronization.

### Food Preservation and recipe navigation

Food Preservation is a standalone main tab directly **under Recipe Guide**, before Monastic Garden and Seed Suppliers. Its safety references remain bilingual. Recipe Guide opens with all inner recipe sections closed. Clicking Meals & Kitchen, Spice Blends, Historical or My Recipes reveals the chosen section; clicking the same section closes it again. Reopening the main Recipe Guide resets visibility without deleting saved recipes, selections, custom recipes or ingredient checkboxes. The collapsed Recipe Guide heading no longer carries a descriptive subtitle. Both web entries and the offline shell are included.

### One visible caution per plant card (November 2026)

A seed card retains its short caution preview while **Planting guide & details** is closed. When that same card's guide is opened, the short preview is hidden and the complete species-specific caution, including who is at risk and source links, is displayed in its place. Closing the guide restores the preview. The rule applies independently to every caution-tagged plant, including newly added or edited entries, in English and Russian. The Caution purpose/filter chip remains visible as a category label. Other plant guidance, photos, watering, seed records and saved data are unchanged. The offline cache and both web entry points are updated.

Other warning generation was checked: inventory re-rendering replaces existing caution blocks rather than stacking them; the workbench does not add its own safety block when the plant has a detailed caution; the Russian safety copy is language-specific rather than a separate additional warning. An automated regression test protects the one-visible-warning rule.

### Watering button navigation

**Watering** on a Planting Journal entry opens any closed parent Garden Planner accordion as well as the Watering Manager, selects the recorded planting, and scrolls to the expanded manager after layout. The Garden Planner shortcut and seed-card watering shortcut use the same path. If a seed card has no linked planting, the manager still opens with explanatory feedback. Opening a manager does not modify watering history.

### Individual seed-packet archiving

Within **Garden Planner → Inventory editor and seed lots**, individual seed packets and bulk lots can be recorded separately, then marked empty without deleting their variety or history. **Packet archive and history** keeps the packet label, original seed count if known, dates, supplier and status changes, and allows accidental empty marks to be restored. Already-counted packets in the original seed catalog can also be marked empty individually; that variety's recorded packet count decreases by one and can be restored one at a time. Legacy lots without a status remain active. Archived lots are excluded from available seed counts and age alerts. All archive information reuses existing workbench lots and overrides, so standard JSON backup and cloud data merging require no new collection or permissions. The original botanical cards, recipes and seed list are preserved. No new main navigation tab is added.

### Packet-to-planting provenance and counted inventory

Planting Journal entries can now optionally link a specific existing seed packet by its stable lot ID. The packet selector follows the exact seed variety and also permits an archived packet to be selected for historical backfilling. Old journal records remain unlinked until the user chooses a source. Each active and archived packet shows its associated sowings, recorded germination and survival results, and harvests explicitly linked to those plantings; packet history has a shortcut to open each planting. Variety-wide germination tests are not misrepresented as results of a particular packet.

Inventory displays variety-card packet counts separately from individually tracked packet records because they may describe the same physical packets. Counted seed quantities are shown for tracked lots; zero or missing counts mean **unknown**, not zero seeds. Only planting records explicitly linked to a lot affect that lot’s estimated remaining count, with min/max sowing quantities preserved as a range. Unassigned journal sowings are reported separately and never silently deducted from another packet. Archived lots are excluded from active stock but retain their planting histories. No original catalog entries, personal records, optional recordkeeping behavior, or Google settings are removed.

### Register packets already on the original seed cards

**Garden Planner → Inventory editor and seed lots → Record a packet or seed lot** now has an optional **This packet is already included in the variety card count** checkbox. Selecting it registers a physical packet already counted on the selected variety card, assigning a stable lot ID for linking in Planting Journal and preserving its supplier, label, date, seed count and planting history. It does **not** increment the card's packet quantity. Registration is limited to the card's remaining unregistered packets, so users cannot register four existing packets against a three-packet card. New independent lots and loose batches remain separate.

A registered catalog packet can be marked empty and restored through the existing reversible archive, adjusting the card's packet count one at a time while keeping linked plantings and their results. Recorded seed counts are in **seeds**, not packet units. A packet with unknown seed quantity remains unknown until entered; neither a packet's existence nor an unlinked sowing fabricates a seed count. Packets attached to journal plantings cannot be permanently removed from their source list, preventing accidental loss of the lot record; archiving preserves the link. The packet selector refreshes when records change. Existing seed cards, backups, sync format, journal records, and optional tracking are retained. No new main tab or user data is published.

### Edit and correct an individual seed packet

The Garden Planner's inventory list and archived-packet list each now have an **Edit packet** control. It opens a form for the packet's label, packed year, date obtained, supplier, storage place, and counted seeds. Clearing the seed-count field explicitly means **unknown**, not zero. Invalid or out-of-range counts, packed years, and impossible dates are rejected. Seed-count changes are recorded in a compact **Seed-count corrections** history. Saving updates the existing lot record and its `updatedAt` rather than deleting or replacing the stable ID; linked journal plantings, harvests, archive status, and original catalog ownership are preserved, and cross-device reconciliation can use the updated record timestamp. If browser storage refuses the save, the old record is restored in memory. Registered catalog packets remain protected from permanent removal so the original card quantity cannot become inconsistent. No new main navigation or cloud account settings are needed.

### Open packet histories directly from seed cards

Every original or user-added seed card now includes a **📦 Packets & history** expandable panel, collapsed by default and independent of **Planting guide & details**. Expanding it shows that variety's separately recorded seed packets and loose lots, including active or empty status, the original known seed count (or explicitly unknown), calculated remaining seed estimates only when grounded in a recorded packet, suppliers, storage locations, counted-seed corrections, and individual linked planting/germination/harvest records. It does not treat variety-level packet counts as a count of individual seeds. The new **Manage packets for this variety** button opens the existing Garden Planner and its Inventory editor with that variety selected and scrolls to its lot list (or the registration form if nothing is tracked). **Edit packet** also works directly from the card, expanding the nested Garden Planner before focusing the existing edit form. No new main tab, storage key, duplicates, or changes to the original botanical collection are introduced. The card's open state remains local to the current page and no history opens unless requested. Records remain unchanged until the user performs an explicit action.

### Homemade spaghetti sauce and Hollandaise (November 2026)

**Recipe Guide → Meals & Kitchen** now has two additional bilingual measured recipes: **Homemade spaghetti sauce**, a slow-simmered tomato, onion, garlic, basil and oregano sauce with optional beef, and **Classic Hollandaise sauce**, an egg-yolk and lemon emulsion seasoned with salt, white pepper and optional cayenne. Hollandaise instructions explain how to clarify butter by separating the milk solids, **or** to use ordinary melted unsalted butter without clarification. It also includes temperature/texture tips, a separated-sauce rescue, and a pasteurized-egg caution. Spaghetti sauce is explicitly not a shelf-stable canning formula. Recipes, quantities, preparation steps and ingredients are localized to Russian and added without altering existing recipes, custom recipes or saved ingredient checkboxes.
