# DK Seed Bank

**A practical, local-first seed collection and garden management web application from DK Softworks.**

[Open DK Seed Bank](https://dereksparks1982.github.io/seedrepo/) · [Source code](https://github.com/dereksparks1982/seedrepo)

## What the app does

DK Seed Bank combines a searchable seed catalog with real-world gardening records. It is a gardening database, **not a game**: there is no interactive property map or simulated planting mechanic.

### Seed catalog and identification

- Add, edit, categorize and archive seed varieties; track packets, bags and saved seed lots separately.
- Search by seed, variety, plant category, growing role, quantity, source, growing conditions and pepper heat.
- Open independent planting guides with sowing depth, spacing, germination, soil temperature, light, timing and harvest guidance.
- Associate plant images, user photographs and seed-packet photos with records; flag uncertain botanical identifications.
- Show clear safety cautions for plants with toxicity, handling or food-safety risks.

### Garden management

- **Growing Planner:** last frost date, growing region, indoor starts and outdoor sowing windows.
- **Planting Journal:** actual sowings, dates, quantities, medium, locations, sprouting, survival, growth status and notes.
- **Garden Workbench:** seed-lot details, storage, germination tests, viability checks, beds and containers, crop families and rotation, succession planting, harvesting, saved seeds and printable labels.
- **Watering Manager:** species/crop guidance, soil-moisture check reminders, rainfall and watering records, amounts, notes and edits. It starts collapsed. A check due date is **not** an instruction to water without checking the soil.
- **Recipe Guide:** compare potential produce against recipes while distinguishing seed ownership from actual ready-to-use food.
- **Medieval Monastery Garden:** an educational filter for historic European crop types, later introductions and uncertain records; explains the *herbularius*, *hortus* and orchard.

### Languages and appearance

Choose **English** or **Русский** from the top-right selector. The English version uses a green theme and green DK sprout emblem. The Russian version uses a DK Red theme and red DK sprout emblem, with the Russian product title **ДК Банк семян**. Interface language is saved locally. Scientific and original seed identifiers are preserved in the stored data.

**DK Red** is the official shade `#9D1F32`. Reusable palette, accessibility guidelines and usage instructions for other DK apps are in [docs/DK-RED.md](docs/DK-RED.md). The visible website header does not advertise the shade or its HEX code.

## Data, privacy and backups

DK Seed Bank is a static GitHub Pages application without an account service or real-time cloud sync. Personal workbench records, planting journal, watering history, photos and customizations are kept in this browser's site storage.

- Back up regularly using **Export backup (with photos)** or the Workbench backup control.
- Restore from a compatible JSON backup. Review confirmation prompts carefully because imports can replace existing local records.
- Do not clear site data without backing up your records. Storage is device- and browser-specific.
- The project does not automatically send your gardening records to a remote account.

## Repository layout

| Path | Role |
| --- | --- |
| `index.html`, `docs/index.html` | Website entry points, maintained as mirrors with appropriate asset paths |
| `assets/seedbank-cards.js` | Planting guides, seed cards and Planting Journal |
| `assets/seedbank-workbench.js` | Inventory editing, garden planning, growing records and backups |
| `assets/seedbank-watering.js` | Watering guidance and moisture-check records |
| `assets/seedbank-recipes.js` | Recipe ingredient checklist |
| `assets/seedbank-monastery.js` | Historical gardening reference and category filter |
| `assets/seedbank-i18n.js`, `assets/seedbank-i18n.css` | Russian translation and locale-specific appearance |
| `assets/seedbank-variety-images.js` | Referenced example images and photo associations |
| `docs/DK-RED.md` | DK Softworks brand color standard |

## Running locally

Open this repository with a static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Visit `http://localhost:8000/`. No backend, API key or JavaScript build process is required.

## Maintenance rules

- Preserve existing journal and storage keys, import formats and original variety identities.
- Update this README when features are added or changed.
- Keep `index.html` and `docs/index.html` synchronized aside from their asset prefixes.
- Verify functionality in both languages, including dynamically generated labels and form output.
- Avoid automatic GitHub Actions runs for documentation-only changes.

## Safety

Planting and watering advice is general. Actual care depends on species, packet instructions, local weather, soil and setup. Some medicinal and ornamental plants are poisonous. Historical uses do not establish safety or suitability for consumption.
