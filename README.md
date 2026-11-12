# DK Seed Bank

DK Seed Bank is an offline-capable seed collection and gardening recordkeeping application by DK Softworks for serious gardeners and emergency preparedness, available in English and Russian. It runs in a browser or as a portable Linux desktop program.

Organize seed varieties, packets and saved seed lots; view planting guides and reference photos; plan sowing; record plantings, germination, watering and harvests; track storage and seed viability; and export or restore backups.

**Web app:** https://dereksparks1982.github.io/seedrepo/

**Standalone Linux desktop download:** https://github.com/dereksparks1982/seedrepo/releases/download/v0.9.9-linux-portable/DK-Seed-Bank-0.9.9-Linux-x86_64.tar.gz

**Google Drive sync (web):** choose **Connect my Google Drive**, sign into your own Google account, approve access, then select **Sync now**. No OAuth codes or account identifiers are required from website users. Google Drive access is limited to each authorized account's private DK Seed Bank app data; ordinary Drive folders are not accessible. Google currently restricts the OAuth app to registered test users until the application is published and any required verification is completed. The separate Linux desktop OAuth registration is pending. See [Google Drive sync and privacy](docs/GOOGLE_DRIVE_SYNC.md).

**Visible Google Drive folder:** an additional, opt-in photo export is implemented for the website. It uses Google Picker to grant access to a user-selected folder without obtaining access to all Drive files. The publisher must enable Google Picker API and provide a restricted browser API key before the folder selector can operate. Until that setup is completed, visible-folder export is unavailable and the existing private app-data sync continues working. Do not delete existing backups.
