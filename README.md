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

- **Recipe Guide:** measured, step-by-step recipes with ingredient checklists and English/Russian instructions, plus the ability to keep personal recipes.
- **Home cooking:** includes Salisbury steak, chicken tikka masala, meatloaf, ratatouille, homemade spaghetti sauce and Hollandaise, alongside earlier recipes such as pesto, salsa and refrigerator dill pickles.
- **Spice Blends:** multi-ingredient mixes such as curry powder, Chinese five-spice, garam masala, Italian seasoning and other blends. Individual spices are ingredients, not one-ingredient blend recipes.
- **Food Preservation:** a separate reference for drying, freezing, refrigeration, fermentation, pickling and safe canning practices. This is guidance, not a collection of invented or untested canning processing times.
- **Monastic Garden:** historical growing and food-plant knowledge presented as a separate reference section.
- **Seed Suppliers:** website links to established suppliers and user-added favorites. This is a directory, not a shopping or checkout system.

### Keeping records yours

- **Local-first and offline-capable:** the application keeps working with local records and an offline app shell.
- **Sync & Backup:** downloadable full backups, recovery tools and optional Google Drive synchronization using **each user's own authorized Google account**.
- **Optional detail:** you can keep very simple records or track plants and provisions carefully. DK Chef Companion should never require daily measurements, watering logs or rigid routines just to be useful.

## Where the project is going

The next stage turns the existing seed, garden and recipe tools into a connected **household provisioning system**. These features are **planned, not yet shipped**:

| Planned feature | What it will do |
| --- | --- |
| **Shared Pantry** | Track ingredients and household staples such as flour, oil, salt, rice, pasta, beans, spices and canned goods. Mark olive oil or salt as available **once**, and have every recipe recognize it. |
| **Root Cellar** | Keep a separate inventory of suitably stored produce and preserves, with optional quantities, locations, storage dates and condition notes. |
| **Garden-to-storage flow** | Record where harvested food goes: used fresh, preserved, moved to the pantry or put into suitable long-term storage. |
| **Connected recipe availability** | Compare what a dish needs against actual ingredients in the Pantry and Root Cellar. Seed ownership by itself never means edible ingredients are ready to use. |
| **Bread and flatbread recipes** | Expand the kitchen collection with naan and garlic naan for chicken tikka masala, plus pita, chapati, sandwich bread, sourdough, focaccia, rolls, cornbread and other traditional breads. |
| **Consistent Chef Companion identity** | Update remaining in-app titles, desktop packaging and older DK Seed Bank labels while protecting existing records and backup compatibility. |

**Current recipe checkboxes are still saved per recipe.** Shared ingredient availability across all recipes belongs to the planned Pantry, so the README does not present it as already implemented.

The overall goal is simple: **know what you have, what you are growing, where your food is stored, and what you can make with it.**

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

The application uses a static web frontend with local browser storage and a portable Electron-based Linux desktop edition.

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
