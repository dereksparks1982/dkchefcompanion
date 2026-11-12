# DK Seed Bank

DK Seed Bank is an offline-capable seed collection and gardening recordkeeping application by DK Softworks for serious gardeners and emergency preparedness, available in English and Russian. It runs in a browser or as a portable Linux desktop program.

Organize seed varieties, packets and saved seed lots; view planting guides and reference photos; plan sowing; record plantings, germination, watering and harvests; track storage and seed viability; and export or restore backups.

**Web app:** https://dereksparks1982.github.io/seedrepo/

**Standalone Linux desktop download:** https://github.com/dereksparks1982/seedrepo/releases/download/v0.9.9-linux-portable/DK-Seed-Bank-0.9.9-Linux-x86_64.tar.gz

**Sync & Backup (web):** one expandable panel combines Google Drive sync, visible-folder photo export, local backup download/restore/verification, browser storage protection, and offline photo readiness. Select **Connect my Google Drive**, sign into your own Google account, approve access, then select **Sync now**. No OAuth codes or account identifiers are required from website users. Cloud snapshots remain in each authorized user's private app-data area; only a folder explicitly picked by that user is eligible for the additional visible photo export. Google currently restricts the OAuth app to registered test users until the application is published and any required verification is completed. The separate Linux desktop OAuth registration is pending. See [Google Drive sync and privacy](docs/GOOGLE_DRIVE_SYNC.md).

**Visible Google Drive folder (web):** after connecting their own Google account, users can choose an existing folder using a Google Picker embedded in a fixed app dialog, preventing document scrolling. **Sync now** then writes readable photograph files and a full JSON backup directly inside that folder. This separate, opt-in visible export does not delete or replace the original hidden app-data sync, which remains the cross-device recovery copy. The Google Picker browser key is restricted to this GitHub Pages origin and the Picker API; each user separately authorizes their own account and chooses their own folder. Google's OAuth application is currently in Testing mode, so only approved test users may sign in until the publisher completes publication requirements. Do not delete existing backups.

**Connection on refresh:** a valid Google access token is kept in browser-tab session storage, so a page refresh keeps its connection until the token expires. Closing the browser or token expiry may require signing in again; truly permanent login requires secure server-side refresh tokens. Disconnect clears the cached token. Google consent is no longer forced every time.

**Troubleshooting:** if the Google Drive panel is missing after a website update, refresh the app so its offline cache installs the current scripts; existing plantings and photos are not deleted by an ordinary refresh.

**UI behavior:** The former independent **Backups and offline readiness** and **Google Drive sync** accordion panels now appear as sections inside the single **☁ Sync & Backup** accordion. Offline readiness status is displayed inside the unified panel rather than in the footer. Existing element IDs, backup files, cloud sync snapshots, journal photos, and local storage keys remain unchanged. The seed journal delegates its backup buttons to the unified tools. Google Picker shows a fixed in-app overlay with a Close control, so opening the folder browser does not scroll the seed catalog.

**Google Picker access troubleshooting:** the browser API key must allow BOTH **Google Picker API** and **Google Drive API**, and its website referrers must include the DK Seed Bank GitHub Pages origin and `https://docs.google.com/*`. A browser cookie permission prompt alone does not authorize Google Picker API calls. When Google's embedded picker reports access denied, review these key restrictions before changing OAuth accounts or touching any stored photos.
