# DK Seed Bank

**A practical seed-collection and garden management database by DK Softworks.**

- **Live app:** https://dereksparks1982.github.io/seedrepo/
- **Repository:** https://github.com/dereksparks1982/seedrepo
- **Default language:** English. Russian is available from the top-right language selector with its own DK Red theme.

## Complete recorded inventory

| Inventory type | Recorded total |
| --- | ---: |
| Distinct seed entries | **319** |
| Commercial seed packets | **412** |
| Separately recorded bags of beans and lentils | **7** |
| Harvested, saved or store-derived seed lots | **9** |
| Plant categories | **19** |

This includes the newly recorded **Blue Flax (1 commercial packet)**. Blue flax is not a verified botanical species designation on its own: it may refer to *Linum perenne* or *Linum lewisii*, neither automatically being the historic linen crop *Linum usitatissimum*.

### Inventory principles

- Default to **one commercial packet** per variety unless the user specified a different count, a bag or loose/saved seed.
- Keep seed **varieties**, **packets**, **bags** and **saved lots** as separate statistics.
- The two spoken names **Lemon Mint / Lemon Bergamot** share 3 packets in one entry, provisionally *Monarda citriodora*; **English / True Lavender** share 6 packets, provisionally *Lavandula angustifolia*. Verify packet botanical names.
- A common plant name is not proof of a scientific species or cultivar; uncertain labels remain explicitly marked.
- **Do not conflate owning seeds with harvested, safe-to-eat ingredients.**

## Main features

### Seed explorer
- 319 varieties grouped across 19 categories, with sorting by original catalog sections.
- Text search, category, purpose, packet source, quantity, heat/Scoville and growing-condition filters.
- Individual, independently opening **Planting guide & details** cards.
- Crop photos, per-variety photo improvements/fallbacks, user-provided packet and plant photos and URLs.
- Species/cultivar growing instructions, light, spacing, depth, soil temperature, harvest and growing conditions.
- Safety notes on **Caution**-tagged plants include specific hazards, precautions and who is most at risk.
- At the end of long categories, **Back to category top**; at the bottom of the page, **Back to page top**.

### Garden records and management
- **Growing Planner:** regional setup, last spring frost date, direct sowing or indoor starts.
- **Planting Journal:** dates, quantities, variety, location, stages, sprouting, survival, comments and photos.
- **Garden Workbench:** inventory editing and seed lots, garden beds/containers (records only, **no visual garden designer**), crop family/rotation, germination tests, stock viability, monthly calendar, succession, harvests, seed saving and labels.
- **Garden Watering Manager:** per-entry watering guides; linked watering, rainfall and soil-moisture observations; check intervals adjusted by plant stage or setup; water amounts and units, notes, edit/delete, and due-for-check dashboard. **Starts collapsed**. Scheduled checks do **not** mean water automatically without testing soil.
- **Recipe Guide:** compares possible grown ingredients against seed holdings and tracks ingredients actually on hand.
- **Monastery Garden:** evidence-based filter for historically documented European crop types, later/New World introductions and botanically/historically unverified entries; educational panel explains Saint Gall's herb garden (*herbularius*), kitchen garden (*hortus*), and orchards. This categorizes plant types, not modern packet cultivars.

### Bilingual interface and identity
- English ↔ Русский language selector in the **top-right**. The choice is remembered on this browser.
- English retains the traditional green theme.
- Russian uses official **DK Red**: `#9D1F32` (deep crimson), plus dark `#681422` and pale `#F8ECEF` supporting shades.
- Plant names and scientific names are kept identifiable across both languages. Stored records and exports preserve their underlying identifiers regardless of display language.

## Storage, backups and privacy

This is a static GitHub Pages web application; it has **no private backend or cloud sync**. Personal journal, watering data, inventory edits, growing preferences, photos, seed lots, and recipe checklists are stored locally by the browser in localStorage and/or IndexedDB. Clearing site data or using another browser may lose those records unless you have exported them.

Use **Export backup (with photos)** in the Planting Journal or the Workbench Backup panel. Export before browser upgrades, device changes or clearing site storage. Import your full JSON backup to restore supported records; check the records after import.

## Development layout

| File | Purpose |
| --- | --- |
| `index.html` | Root static GitHub Pages entry point and seed catalog |
| `docs/index.html` | Mirrored Pages entry point (different asset prefix only) |
| `assets/seedbank-cards.js`, `.css` | Individual seed guides, photos and Planting Journal |
| `assets/seedbank-workbench.js`, `.css` | Inventory, beds, crop records, viability and harvest tools |
| `assets/seedbank-watering.js`, `.css` | Watering guide profiles, observations and check schedule |
| `assets/seedbank-recipes.js`, `.css` | Recipe and ingredient checklists |
| `assets/seedbank-monastery.js` | Historical crop-type labels and educational panel |
| `assets/seedbank-i18n.js`, `.css` | English/Russian interface translation and DK Red design |
| `assets/seedbank-variety-images.js` | Reviewed image associations |
| `inventory/seed-collection-2026-11-11.md` | Canonical dictated inventory notes |

The HTML mirrors must stay synchronized; after normalizing `../assets/` to `assets/`, their content should match.

## Local preview

Run a local static server (for example, `python3 -m http.server 8000` in the repository), then open `http://localhost:8000/`. No account, backend, API key or build system is required.

## Sources and careful use

- Medieval Saint Gall plan and Walafrid Strabo's *Hortulus*: https://www.medievalists.net/2022/01/ST-GALL-PLAN-MEDIEVAL-MONASTERIES/
- Historical monastic cultivation research: https://etheses.dur.ac.uk/1311/1/1311.pdf
- Blue flax species: https://plants.ces.ncsu.edu/plants/linum-lewisii/common-name/blue-flax/
- National poison guidance: https://www.poison.org/
- Garden watering remains a soil-moisture decision, not a fixed prescription. Follow actual seed packet directions, local extension advice and medical safety warnings where relevant.

## Workflow

Update the README and recorded inventory before accepting a new build. Preserve existing browser-storage keys and compatible backups. Update both website entry points and check that counts and links remain correct. Changes go to GitHub only on explicit build approval.
