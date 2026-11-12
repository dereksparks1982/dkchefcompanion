# DK Seed Bank

**DK Seed Bank** is a local-first seed collection and gardening recordkeeping app by **DK Softworks**, available in English and Russian. It works in a web browser and as a portable Linux desktop application.

**Web app:** https://dereksparks1982.github.io/seedrepo/

**Linux portable release:** https://github.com/dereksparks1982/seedrepo/releases/download/v0.9.9-linux-portable/DK-Seed-Bank-0.9.9-Linux-x86_64.tar.gz

## Features

- **Garden Planner:** growing conditions, planting calendar, seed inventory and lots, germination checks, garden beds, harvest records, saved seeds, and optional growth history.
- **Planting Journal:** dated plantings, photos, notes, measurements, watering observations, and growth charts. Tracking and reminders remain optional.
- **Sync & Backup:** full JSON backups with verification, restore controls, local/offline storage tools, and opt-in Google Drive synchronization.
- **Recipe Guide:** personal ingredient checklists and culinary references, separate from the actual seed inventory.
- **Medieval Monastery Garden:** a standalone historical reference section immediately below Recipe Guide, with its explanatory material inside the section. Garden Planner remains near the top.
- **Seed Suppliers:** website links to established seed suppliers plus user-added favorite links. No shopping checkout or global seed-variety catalog is built into the app.

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
