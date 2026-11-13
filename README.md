# DK Chef Companion

**From Seed to Table.**

**DK Chef Companion** is a local-first garden, pantry, food-storage and cooking companion created by **DK Softworks**. Its purpose is to connect the whole journey of food: selecting seeds, growing and harvesting crops, keeping household provisions, preserving what is grown, and preparing meals.

This project began as **DK Seed Bank**, but the vision has grown well beyond a seed catalog. The goal is a practical household reference and recordkeeping tool that brings traditional gardening, food preservation, and cooking together without making any of them compulsory.

**Web app:** https://dereksparks1982.github.io/dkchefcompanion/  
**Source repository:** https://github.com/dereksparks1982/dkchefcompanion  
**Publisher:** DK Softworks  
**Languages:** English and Russian  
**Platforms:** Web browser and portable Linux desktop application

## What DK Chef Companion does today

### Seeds, garden and growing

- **Seed collection:** browse varieties and growing information, organize packets, add or edit seed entries, and keep seed-packet photographs.
- **Packet records:** track individual packets or bulk lots, suppliers, storage locations, known seed counts, archived or empty packets, and their planting histories. Unknown counts stay unknown; variety-level packet totals are not mistaken for numbers of individual seeds.
- **Garden Planner:** plan sowing dates using your own frost-date and growing-environment information; organize garden beds, crop rotation and succession sowing; record germination tests, harvested crops and saved seeds.
- **Planting Journal:** optionally record planting dates, seed sources, observations, photographs, growth measurements and charts. The **Garden Watering Manager lives inside the Planting Journal**, so soil checks, watering history and each planting's watering shortcut stay with the actual plants, not the Garden Planner. Individual plantings can be linked to the packet used and to their harvests.

### Food, recipes and traditional knowledge

- **Pantry & Root Cellar:** two distinct storage sections backed by one shared food inventory. Keep ordinary staples, packaged foods, harvested produce and suitable preserves with optional amounts, package counts, dates, brands, barcodes and storage notes. Duplicate scans increase an existing matching package count. Record a harvest into storage without automatically reducing the original harvest record.
- **Barcode food identification:** Quagga2-powered live grocery-barcode scanning for UPC/EAN products, with a desktop camera picker and manual entry everywhere. Decoding works offline; identifying the product uses Open Food Facts online. Confirm the recognized food and its generic ingredient before saving.
- **Recipe Guide:** measured, step-by-step bilingual recipes. The **On hand** checkbox is shared across recipes and linked to real Pantry/Root Cellar items, not seed ownership. Old per-recipe availability marks are migrated once into the shared kitchen inventory, retaining saved personal recipes.
- **Home cooking and bread:** includes Salisbury steak, chicken tikka masala, meatloaf, ratatouille, spaghetti sauce and Hollandaise, plus **Bread & Baking** with naan, garlic naan, pita, chapati, sandwich bread, focaccia, dinner rolls, buttermilk biscuits, cornbread and sourdough. Existing pesto, salsa, refrigerator dill pickles and spice recipes remain.
- **Spice Blends:** multi-ingredient mixes such as curry powder, Chinese five-spice, garam masala, Italian seasoning and other blends. Individual spices are ingredients, not one-ingredient blend recipes.
- **Food Preservation:** a separate reference for drying, freezing, refrigeration, fermentation, pickling and safe canning practices. This is guidance, not a collection of invented or untested canning processing times.
- **Monastic Garden:** historical growing and food-plant knowledge presented as a separate reference section.
- **Seed Suppliers:** website links to established suppliers and user-added favorites. This is a directory, not a shopping or checkout system.

### Keeping records yours

- **Local-first and offline-capable:** the application keeps working with local records and an offline app shell.
- **Sync & Backup:** downloadable full backups, recovery tools and optional Google Drive synchronization using **each user's own authorized Google account**.
- **Optional detail:** you can keep very simple records or track plants and provisions carefully. DK Chef Companion should never require daily measurements, watering logs or rigid routines just to be useful.

## Where the project is going

The **Pantry, Root Cellar, shared recipe ingredients, basic harvest-to-storage entry and bread recipes are now included**. The next iterations can improve inventory detail without turning it into mandatory bookkeeping.

| Future improvement | Scope |
| --- | --- |
| **More storage detail** | Condition checks, storage environment and optional reminders for perishable foods. |
| **Precise recipe stock math** | Calculate recipe portions from verified quantities and units before optionally deducting food consumed. Reading a recipe never deducts stock. |
| **More detailed harvest allocations** | Account for a harvest divided among fresh use, preservation, Pantry and Root Cellar, rather than just copying its details. |

The goal remains: **know what you have, what you are growing, where your food is stored, and what you can make with it.**

## Principles

1. **From seed to table:** seeds, harvested produce, stored provisions and prepared food are related but distinct. A packet of garlic seeds is not a supply of garlic cloves.
2. **Traditional skills, practical tools:** gardening, home cooking, saving seed, preserving food and thoughtful storage belong in one coherent companion.
3. **Your records, your choice:** quantities, dates, pictures and reminders should be useful when you want them, never mandatory.
4. **No invented inventory:** don't double-count existing packets, assume unknown seed quantities are zero, or mark an ingredient available solely because you own its seeds.
5. **Privacy and portability:** personal collections belong to their owners. Do not put a personal seed collection, photos, tokens or private account data in the public repository or README.
6. **Useful, not bloated:** this is not a worldwide seed-variety marketplace, an automatic shopping platform or a forced daily-tracking app.

## Data, storage and safety

The app stores records locally and supports backups and optional synchronization. A user who chooses Google Drive authorizes **their own account**; the application does not grant access to the developer's Drive. The visible backup folder and some older code/storage identifiers may still use **DK Seed Bank** wording while the product identity is being updated. Those identifiers must not be renamed carelessly if doing so could strand existing data.

Back up valuable records regularly. Browser storage can be cleared independently of the app, and personal photos should be kept in recoverable backups.

Food-storage and food-preservation details must be appropriate to the actual ingredient and storage conditions. Use established, tested procedures for shelf-stable canning and other food-safety-critical preservation. A recipe for fresh spaghetti sauce is **not** automatically a safe home-canning recipe. Reference: [National Center for Home Food Preservation](https://nchfp.uga.edu/).

Google Drive setup and technical details: [Google Drive Sync](docs/GOOGLE_DRIVE_SYNC.md).

## Development

The application uses a static web frontend with local browser storage and a portable Electron-based Linux desktop edition. Shared food stock is stored inside the already-backed-up `recipeGuide.provisions` section, with item timestamps and deletion markers merged across devices. This does not rename Google Drive folders, OAuth settings, hidden sync filenames or the backup format.

Prepare the desktop bundle and run the local Node regression tests:

```sh
node desktop/prepare.cjs
node --test desktop/test/*.test.cjs
```

The desktop source is in [`desktop/`](desktop/). Published builds, when available, belong under [GitHub Releases](https://github.com/dereksparks1982/dkchefcompanion/releases). Older DK Seed Bank build names or release links should not be presented as new DK Chef Companion downloads.

The project should avoid unnecessary GitHub Actions use. App changes should preserve existing records and be documented and checked before acceptance.

---

**DK Chef Companion** · **DK Softworks**  
*From Seed to Table.*

### Watering belongs to Planting Journal

The existing **💧 Garden Watering Manager** is a single collapsible section **inside Planting Journal**, immediately before the planting entry cards. Garden Planner no longer contains the manager or its quick-access button. Watering shortcuts on a planting or a seed card open the Planting Journal and Watering Manager, selecting a matching recorded planting where possible. Existing records, preferences, edit/delete controls, the original local storage key (`dk-seedbank-watering-v1`), and backup/restore/synchronization compatibility are preserved. No migration or data removal is needed. Recordkeeping remains optional.

### DK Chef Companion identity and existing records

The application, browser title, install manifest and future Linux build names use **DK Chef Companion**. The English interface retains the green DK logo and the Russian interface retains the red DK logo. Existing browser storage keys, backup schema (`dk-seedbank-v1`), desktop user-data folder, Google Drive settings and permissions, and Google Drive folder/link identifiers deliberately remain unchanged so records, devices and authorized connections keep finding their old data. Some internal filenames and existing Drive folders may retain **DK Seed Bank** for compatibility. Do not delete or rename them merely for branding. New portable Linux releases use the **dkchefcompanion** repository; packaging and release publishing are manually triggered rather than running on every push.

### Pantry, Root Cellar and barcode identification

Food inventory is optional. Add items manually or enter an 8–14 digit UPC/EAN barcode; use **Scan with camera** on an HTTPS browser page (including Firefox and modern iPhone browsers), and point at the barcode for automatic recognition. No photos are required or offered. Internet lookup uses the [Open Food Facts](https://world.openfoodfacts.org/) community database (ODbL); identification can be incomplete or inaccurate. Only the code is sent for lookup; the user's food inventory is not published. Products can be associated with a generic recipe ingredient, so a branded olive-oil bottle can count as **olive oil** without turning every product name into a false ingredient match. The same item checked on hand in one recipe is reflected in the other recipes. Seed packets never count as harvested food. Editing amounts and expiry dates is optional; packages are not automatically consumed when reading recipes. Legacy checkbox selections migrate into the shared inventory without wiping personal recipes. Food stock and deletion history are included in full JSON backups and the existing optional per-account Google Drive synchronization, with Drive authorization and folder names unchanged.

### Quagga2 direct live-camera integration (2026-11-13)

The locally bundled, MIT-licensed **Quagga2 browser library** now runs the live scanner through its own APIs: `Quagga.init()` with `type: "LiveStream"`, `Quagga.start()`, `Quagga.onDetected()`, `Quagga.onProcessed()`, `Quagga.stop()`, and `Quagga.CameraAccess.enumerateVideoDevices()`. The earlier custom frame-by-frame image conversion and calls to `decodeSingle()` have been removed. Camera capture and recognition are delegated to Quagga2 itself.

The scan button opens the live webcam; the user points at a UPC-A, UPC-E, EAN-8 or EAN-13 barcode, and a valid detection automatically fills its number for the existing Open Food Facts lookup. A device selector is available when the browser reports multiple cameras. Recognition runs locally, including offline when cached; identification of the product by Open Food Facts requires internet and user confirmation before any inventory change. There is no photo-taking or barcode-image workflow.

The app stops the live camera only on explicit stop, section/page exit, camera switch or recognized barcode; unrelated subpanel toggle events and stock rerendering must not shut down the camera. No Pantry, Root Cellar, recipe, or Google Drive storage keys were changed. Regression tests verify calls to Quagga2's actual public API, stopped-vs-running behavior, scanner UI and stale-cache prevention. **Real hardware verification is still required; mocked tests do not establish success on an iPhone or Linux PC.**

**Third-party notice:** `assets/vendor/quagga2.min.js` is the browser bundle from [ericblade/quagga2](https://github.com/ericblade/quagga2) (`docs/examples/dist/quagga.min.js`), distributed under the **MIT license** with copyright notice retained in `assets/vendor/quagga2-LICENSE.txt`. The previous `html5-qrcode` files remain in the repository for historical provenance but are no longer loaded or cached by the app. No changes were made to persistent Google Drive identifiers, folder authorizations or existing personal food records.
