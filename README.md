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

- **Harvest allocation:** divide each recorded harvest among fresh use, preservation, Pantry and Root Cellar, see the unallocated balance, and explicitly post linked storage quantities without double counting.
- **Pantry & Root Cellar:** one collapsible section and one shared inventory, with Pantry and Root Cellar as selectable storage locations. Keep ordinary staples, packaged foods, harvested produce and suitable preserves with optional amounts, package counts, dates, brands, barcodes and storage notes. Duplicate scans increase an existing matching package count. Record a harvest into storage without automatically reducing the original harvest record.
- **Barcode food identification:** Quagga2-powered live grocery-barcode scanning for UPC/EAN products, with a desktop camera picker and manual entry everywhere. Decoding works offline; identifying the product uses Open Food Facts online. Confirm the recognized food and its generic ingredient before saving.
- **Recipe Guide:** measured, step-by-step bilingual recipes. The **On hand** checkbox is shared across recipes and linked to real Pantry/Root Cellar items, not seed ownership. Old per-recipe availability marks are migrated once into the shared kitchen inventory, retaining saved personal recipes.
- **Home cooking and bread:** includes Salisbury steak, chicken tikka masala, meatloaf, ratatouille, spaghetti sauce and Hollandaise, plus **Bread & Baking** with naan, garlic naan, pita, chapati, sandwich bread, focaccia, dinner rolls, buttermilk biscuits, cornbread and sourdough. Existing pesto, salsa, refrigerator dill pickles and spice recipes remain.
- **Spice Blends:** multi-ingredient mixes such as curry powder, Chinese five-spice, garam masala, Italian seasoning and other blends. Individual spices are ingredients, not one-ingredient blend recipes.
- **Food Preservation:** a separate reference for drying, freezing, refrigeration, fermentation, pickling and safe canning practices. This is guidance, not a collection of invented or untested canning processing times.
- **Monastic Garden:** historical growing and food-plant knowledge presented as a separate reference section.
- **Seed Suppliers:** collapsible links section at the very bottom of the main page, immediately above the footer and after all other sections. Includes established supplier websites and user-added favorites. This is a directory, not a shopping or checkout system. Favorite supplier data remains under the existing storage key and Google Drive backup/sync schema.

### Keeping records yours

- **Local-first and offline-capable:** the application keeps working with local records and an offline app shell.
- **Sync & Backup:** downloadable full backups, recovery tools and optional Google Drive synchronization using **each user's own authorized Google account**.
- **Optional detail:** you can keep very simple records or track plants and provisions carefully. DK Chef Companion should never require daily measurements, watering logs or rigid routines just to be useful.

## Where the project is going

The **combined Pantry & Root Cellar inventory**, shared recipe ingredients, basic harvest-to-storage entry and bread recipes are now included. The next iterations can improve inventory detail without turning it into mandatory bookkeeping.

| Future improvement | Scope |
| --- | --- |
| **More storage detail** | Condition checks, storage environment and optional reminders for perishable foods. |
| **Precise recipe stock math** | Conservative quantity comparison and optional serving/batch scaling are implemented. Future work can add explicitly confirmed consumption. Opening recipes never deducts stock. |
| **Harvest allocation ledger** | Implemented: divide a harvest into fresh use, preservation, Pantry and Root Cellar, track remaining quantity, and explicitly post linked food stock without duplicate entries. |

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

### Pantry & Root Cellar and barcode identification

One combined **Pantry & Root Cellar** panel contains food inventory, with a storage-area selector on each manual entry. It has no camera, scan button, barcode field, or duplicate scanning UI. Medicines and household supplies retain their own sections. The sole Product Scanner at the top identifies products and adds them to the appropriate inventory after user confirmation.

The same data structure (`recipeGuide.provisions`) stores records for all four locations without changing stable IDs, original barcodes, existing recipe links, backup layout, or Google Drive synchronization. Existing harvest-to-cellar entry links are preserved. Stock quantities can reach zero (then the item is unavailable), and optional low-stock thresholds, expiry alerts, search, and +1/−1 package controls help manage actual supplies. None of these features is mandatory. Pantry and Root Cellar foods alone can count toward recipes; medicine and household items never do. Re-scanning the same UPC adds packages to the existing entry rather than creating duplicates.

### Single top-of-page scanner, confirmation ding, and collapsed seeds (2026-11-13)

DK Chef Companion now has **one** Product Scanner, located at the top of the main page. The combined Pantry & Root Cellar, Medicine Cabinet and Household Supplies each contain an inventory editor, **not a duplicate scanner**. The scanner uses the locally bundled MIT-licensed Quagga2 `LiveStream` API, with a front-facing camera preference on desktop/Surface Pro and the rear camera preference on iPhone. Scanning and product identification are separate: a valid barcode triggers one brief Web Audio ding (when permitted by the browser and device sound settings) and immediately displays its number and searching status. The user may mute future dings using a persistent local control. No image capture or barcode photo button exists.

Product lookup searches Open Food Facts, Open Products Facts, Open Beauty Facts and Open Pet Food Facts concurrently, returning the first reported match, and then uses the rate-limited UPCitemdb free endpoint as fallback. Unknown codes, CORS failures, offline requests and rate limits have visible statuses **at the scanner**, not hidden inside a collapsed inventory form. Successful matches show the name, brand, size and data source. The user may edit the name and select where to store the item, then explicitly add it. An unknown product can still be named and saved against its scanned code. An empty name cannot be saved. General merchandise is never implicitly a recipe ingredient, and the software does not assume a medicine is safe or suitable from a barcode match alone.

Existing Pantry/Root Cellar records remain in place; Medicine Cabinet and Household Supplies are extra locations within the **same** `recipeGuide.provisions` data structure and existing Google Drive sync/backups. Backup validation now accepts all four locations. Only food in Pantry/Root Cellar qualifies for recipe on-hand matching. **No Google Drive client IDs, storage keys, folder permissions, or existing personal seed records were changed.**

The seed collection stats, filters, category links and all 319 seed cards were placed in a collapsible Seed Collection & Catalog section, initially closed. Garden Planner and Planting Journal remain separate accessible sections. Both English and Russian labels are provided.

**Verification:** static/source tests and mocked scanner/database integrations cover one scanner, persistence, lookup status, sound-once behavior, front/rear camera preferences and seed preservation. Actual camera/audio operation and third-party API responses must still be verified on the user's devices. A successful deployment alone does not prove them.

### Quagga2 direct live-camera integration (2026-11-13)

The locally bundled, MIT-licensed **Quagga2 browser library** now runs the live scanner through its own APIs: `Quagga.init()` with `type: "LiveStream"`, `Quagga.start()`, `Quagga.onDetected()`, `Quagga.onProcessed()`, `Quagga.stop()`, and `Quagga.CameraAccess.enumerateVideoDevices()`. The earlier custom frame-by-frame image conversion and calls to `decodeSingle()` have been removed. Camera capture and recognition are delegated to Quagga2 itself.

The scan button opens the live webcam; the user points at a UPC-A, UPC-E, EAN-8 or EAN-13 barcode, and a valid detection automatically fills its number for a broader food and general-product lookup. On a Surface Pro/Linux desktop, the front-facing camera is explicitly preferred using a labeled Front device when available and otherwise facingMode: user. iPhone continues to prefer the rear-facing camera. A device selector is available when the browser reports multiple cameras. Recognition runs locally, including offline when cached; identification of the product by Open Food Facts requires internet and user confirmation before any inventory change. There is no photo-taking or barcode-image workflow.

The app keeps the Quagga2 live camera stream open after a recognized barcode, pausing barcode detection until the user presses **Scan next item**. This avoids requesting camera access again for every product. It stops only on explicit stop, page exit, camera switch or genuine disconnection; unrelated subpanel toggle events and stock rerendering must not shut down the camera. No Pantry, Root Cellar, recipe, or Google Drive storage keys were changed. Regression tests verify calls to Quagga2's actual public API, stopped-vs-running behavior, scanner UI and stale-cache prevention. **Real hardware verification is still required; mocked tests do not establish success on an iPhone or Linux PC.**

### Scanned product identification (2026-11-13)

Barcode recognition and product identification are separate operations. The MIT-licensed Quagga2 library handles the live camera; a successful scan passes the UPC/EAN to the official Open Food Facts and Open Products Facts v2 lookup endpoints. A general-product fallback queries UPCitemdb's publicly documented trial API so non-food purchases, including OTC medicines such as Pepcid, have a chance of being identified. The trial endpoint requires no API key but is limited to 100 requests per day plus burst limits. No source can guarantee a match for every barcode, and browser CORS/network issues may prevent third-party access.

Product matches display a name, brand, available package size and source under the top-of-page Product Scanner and populate its editable save-to-inventory form. Users review before saving; the scanner never adds stock automatically. If external providers have no match, are unavailable, or are rate-limited, the barcode stays in the field and the user sees the specific outcome. General products are not silently mapped to recipe ingredients. Only the barcode is sent to lookup providers; personal inventory and Google Drive credentials remain private. English and Russian UI both support these messages.

The Surface Pro front camera is preferred using Quagga2's built-in camera list (front-labeled device) and facingMode: user as a fallback. A briefly disconnected stream is retried once using Quagga2's own live scanner; the app avoids infinite camera-restart loops. The existing camera selector supports explicit device changes. Tests cover labeled front camera selection and product database fallback; physical camera behavior and live external API access still require verification.

### Camera continuity, Surface Pro fallback and inventory improvements (2026-11-13)

The iPhone scanner no longer calls Quagga2 `stop()` after a successful read. The original `LiveStream` stays running through product lookup and inventory saving. `Quagga.onDetected()` is temporarily gated after one valid code; **Scan next item** re-arms detection on the existing stream rather than requesting `getUserMedia()` again. A short debounce prevents accidentally recognizing the same item immediately. Stopping the camera, switching devices, leaving the page, or a genuine camera failure still releases the hardware. Browser privacy rules are not bypassed; an operating system/browser may still require permission when a new session begins.

The Surface Pro Firefox case is confirmed to be **NotReadableError with site camera permission already granted**, not a permission-denied error. The Quagga2 integration first requests the selected/front-facing camera, then retries a smaller 640×480 stream and a camera-default profile after a recoverable capture error, releasing each failed attempt via Quagga2's own `stop()`. It lists available cameras even when capture fails, shows capture attempts and active camera name, and permits selecting a specific front/rear device. No homemade frame decoder or independent `getUserMedia` request was added. **If Firefox/Linux's driver cannot provide a working stream with any profile, web code cannot repair that hardware/OS failure.** This remains unverified on the actual Surface Pro.

All saved UPCs stay on existing records; the combined inventory forms deliberately hide barcode fields and retain those identifiers on edits. Low-stock thresholds, zero-stock state, expiry warnings and quantity adjustments are in the existing `recipeGuide.provisions` data. The backup validator accepts optional integer thresholds and zero stock, retaining previous records and Drive sync formats. Garden, recipe, supplier and seed collection data remain untouched. Tests exercise one scanner, multi-item continuity, a mocked Surface NotReadableError fallback, duplicates, product lookup, inventory quantities and backup validation. The iPhone root-beer lookup was confirmed by the user before this release; no other physical-device result is claimed.

### Verified medicine identifiers and better general-product categories (2026-11-13)

The **one top-of-page Quagga2 scanner** still reads UPC/EAN numbers locally and sends them to the unchanged Open Food Facts, Open Products Facts, Open Beauty Facts, Open Pet Food Facts and UPCitemdb lookup flow. The code now uses UPCitemdb's own product-category information when available, with narrow, explicit name hints for products such as root beer, canned peas and Pepcid. This prevents identified beverages from automatically defaulting to Household Supplies simply because a general UPC database returned them.

The new `assets/dk-chef-medicine-lookup.js` integrates the public **openFDA NDC Directory**. It searches for an exact **annotated UPC**, not a number guessed from a drug's NDC; it normalizes a zero-prefixed EAN-13 to UPC-A solely for the UPC search. The returned `openfda.upc` identifiers must explicitly contain that UPC before an item can be marked as an FDA directory match. Zero matches, ambiguous identities, unsupported barcodes, service errors, and rate limits have distinct messages. The NDC directory is **labeler-submitted data and listing is NOT FDA approval**. A verified directory record can provide brand, generic name, ingredients/strength, dosage form, and NDC. When it includes a validated SPL Set ID, the scanner offers a direct, official National Library of Medicine **DailyMed** label link (no scraped drug descriptions, improvised medicine names, or counterfeit "verified" labels). An FDA request is a separate lookup and may not be supported by all browsers or all products.

For recognized medicine products, FDA exact-UPC verification is displayed separately from any general retail lookup, and the existing product details remain visible immediately. For an otherwise unknown UPC, openFDA is a final, exact-match fallback after retail databases. Successful FDA details can be saved as an optional `medicineInfo` subrecord in the existing Medicine Cabinet inventory, with bounded and strictly validated fields; the same optional information survives local backups and Google Drive merges. A verified DailyMed URL is shown in the medicine inventory only when present and validated. No data is uploaded to FDA/DailyMed except the UPC query. Products, medications, quantities and food records are **never** added to inventory without user confirmation.

No changes to Google Drive OAuth credentials, folder IDs, personal seeds, backups or storage keys. The iPhone root-beer lookup, Quagga2 live stream, ding, Scan next item, Surface front-camera preference and combined Pantry & Root Cellar are intentionally preserved. Regression tests use mocked public API responses; real-device and live provider verification remains distinct.

### Cook from Pantry: inventory-aware recipe finder (2026-11-13)

The **Recipe Guide** now contains a dedicated **Cook from Pantry** category in English and Russian. It evaluates the existing meals, bread recipes, multi-ingredient spice blends and user-created recipes against the saved Pantry & Root Cellar food inventory. Historical botanical checklists (including absinthe) are deliberately excluded from cooking suggestions. Results are ranked by the number of missing ingredients and show an honest `on hand / required` count. Filters show **All recipes**, **All listed ingredients on hand**, and **Missing 1–2**. Each result includes a direct button to open the full measured recipe without disturbing a custom recipe or replacing the recipe catalog.

The matching engine is a small new read-only module, `assets/dk-chef-recipe-match.js`. It respects the *explicit ingredient identity* from the inventory, exact food names and a conservative set of common culinary synonyms. Recipe-approved `A or B` alternatives can count if either ingredient is genuinely in stock; optional substitution ideas are displayed separately and **never automatically count as available**. The matcher never infers ready-to-eat food from seeds, never counts medicine/household items, never treats items marked unavailable or with zero packages as present, and never guesses adequacy from package counts. It is an ingredient-name guide, not a guarantee of quantity, freshness, safety or suitability. Stock is **not deducted** when viewing recipes or clicking into them.

The new category requires no new storage keys, permissions, network calls, APIs or user accounts. It derives every result from existing `recipeGuide.provisions` records, so changes to shared Pantry & Root Cellar inventory and optional Google Drive imports are reflected whenever the guide renders. Previous manual on-hand checkboxes and existing recipes remain. Recipe matching is updated to respect zero quantities. The seed catalog remains minimized, Seed Suppliers remains last, and the single Quagga2 scanner stays unchanged. The English and Russian Recipe Guide headings for available/missing ingredient metrics are more consistent.

**Third-party notice:** `assets/vendor/quagga2.min.js` is the browser bundle from [ericblade/quagga2](https://github.com/ericblade/quagga2) (`docs/examples/dist/quagga.min.js`), distributed under the **MIT license** with copyright notice retained in `assets/vendor/quagga2-LICENSE.txt`. The previous `html5-qrcode` files remain in the repository for historical provenance but are no longer loaded or cached by the app. No changes were made to persistent Google Drive identifiers, folder authorizations or existing personal food records.

### Quantity-aware recipes (2026-11-13)

The **Cook from Pantry** finder now distinguishes matched ingredient names from quantities that are **enough**, **short**, or **unverified**. Individual recipes also show measured comparisons. A name-only match does **not** guarantee enough food is available to cook the dish.

For Pantry & Root Cellar food, **Total amount on hand** means the usable total across all packages (e.g. `500 g`). If no total is entered, **Package size (each)** (e.g. `250 g`) is multiplied by the stored package count. The engine compares compatible mass (g, kg, oz, lb), volume (mL, L, tsp, tbsp, cups, fl oz, pints, quarts) and identical counted units (eggs, cloves, cans, leaves, pieces). Incompatible units, ranges, vague quantities and package counts alone remain unverified. No guessed conversions between mass and volume. Best-by dates do not automatically determine food safety.

Viewing, opening, or ranking recipes **never consumes stock**. Existing inventories, seeds, the one Product Scanner, Google Drive account authorizations, storage keys, sync rules and backup format remain unchanged. No required data migration.


### Optional recipe portions and batch yields (2026-11-13)

In the **Recipe Guide**, straightforward yields such as **Serves 4**, **Makes 8 naan**, or **Makes 12 rolls** now offer an optional numeric **Plan quantity** control. The app recalculates reliably measured ingredient amounts and checks the scaled quantities against Pantry & Root Cellar stock. It also remembers the chosen yield for the current browsing session when you return to **Cook from Pantry**. **Original amount** restores the recipe's starting yield.

This feature is intentionally conservative. Recipes without a clear numeric yield (for example, **Serves 4–6**, approximate jar yields, historical checklists and user-created recipes without yields) are not automatically resized. Ingredients with imprecise amounts such as **1 medium onion** stay in the original form with a visible **adjust manually** notice. The original quantity is shown alongside every scaled ingredient for context. Oven temperature, baking tin sizes, cooking times, food safety instructions, and preparation directions are **not** automatically modified. A cook should review these details when changing batch sizes.

Portion selections are transient and **not persisted**. Recipe content and user-added recipes remain unchanged, and the controls **never consume pantry stock**. English and Russian presentation, the existing single barcode scanner, the combined Pantry & Root Cellar, local backups, Google Drive sync, and all previous records remain compatible. No new account authorization, schema version, required field, or personal inventory disclosure was introduced.

**Testing:** Focused portion, fraction, fallback, localized-render, read-only stock and regression coverage lives in `desktop/test/chef-portions.test.cjs`. Existing application tests are run using `node --test desktop/test/*.test.cjs`; GitHub Actions are not triggered for each source change.

### Harvest allocation and linked storage (2026-11-13)

**Garden Planner → Harvest records** now includes an optional allocation ledger for each harvest. You can assign quantities to **Fresh use**, **For preservation**, **Pantry** and **Root Cellar**, all in the original harvest unit (lb, oz, kg, g, count or bunches). It shows the **unassigned balance** and rejects negative quantities, excessive allocations, or fractional values for counted harvests. Original harvest records remain immutable history of what was picked; allocations are stored as optional fields on those records, so old backups and the existing Google Drive workbench merge continue to work.

**Saving an allocation never increases food stock**. After saving, explicitly choose **Post to inventory** for the Pantry or Root Cellar. Each harvest/location pair uses a stable linked item ID in `recipeGuide.provisions`, so reposting the same amount is idempotent; a later confirmed post updates that amount rather than adding another package. Setting a posted allocation to zero and confirming removes only its linked food item. Older manually copied harvest entries block posting until reconciled, and manually edited linked stock is protected against silent overwrites. The original pantry inventory can still be edited independently; when manual edits conflict, reconcile them before reposting. All user accounts, data keys, backup format, existing seed records, and Drive folder settings remain unchanged.

The allocation ledger is **bookkeeping**, not a food-safety recommendation. Quantities assigned to preservation do not certify that they were safely processed; follow tested methods. Because allocation changes and inventory posting are separate explicit steps, always review linked stock after changing a plan. Restoring backups or merging devices may yield an older posted stock amount until you choose to synchronize it from the current harvest allocation.
