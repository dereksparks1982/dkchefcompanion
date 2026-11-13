# Optional Google Drive synchronization

DK Chef Companion keeps its data on your device unless you explicitly connect Google and
choose **Sync now** or opt into automatic synchronization while the app is open.

## Privacy and account isolation

- Every user signs into **their own Google account**. No Google account, refresh token,
  folder ID, or password is shipped in DK Seed Bank or stored in the public repository.
- Regular synchronization uses the limited `drive.appdata` permission.
  A separate visible-folder export requests `drive.file` and writes only to a folder
  the signed-in user explicitly selects through Google Picker.
- Google stores normal sync snapshots in a **hidden application-data area** within
  the authorized user's Drive. The visible-folder export writes readable photograph
  files and a JSON backup into the chosen ordinary Drive folder.
- Disconnect removes the local Google authorization (desktop: the local refresh-token
  file; website: the in-memory token). Existing uploaded data remains in the user's
  Google app-data area. Revoke access in Google Account permissions if needed.
- Do not sign into an account that should not receive the local collection: the app
  clearly asks for permission before connecting, and `Sync now` transfers data to
  the account you authorized.

## Sync & Backup on the website (English and Russian)

The former **Google Drive sync** and **Backups and offline readiness** accordions
are combined into one **☁ Sync & Backup** section. This section contains Google
Drive connection, folder photo export, full local backup download/restore/validation,
protect-browser-storage and offline photo caching. The offline readiness indicator
also appears here. No data formats or account destinations change as a result.

The folder selection window is embedded in a fixed dialog in the web app using
Google Picker's documented `PickerBuilder.toUri()` method, avoiding Google's
standard dialog scrolling the long seed list. The dialog has a visible **Close**
button and can be dismissed by pressing Escape. A failed picker load is displayed
in the dialog instead of silently moving the page.


1. Open [DK Chef Companion](https://dereksparks1982.github.io/dkchefcompanion/) on your device.
2. Open **Sync & Backup → Google Drive synchronization** and select **Connect my Google Drive**.
3. Pick your own Google account in Google's sign-in window and approve the requested access.
4. Select **Sync now** to merge the device's records with that account's hidden DK Seed Bank app data. Or enable optional automatic sync while the app is open.

There is **no client-ID input for website users**. DK Softworks provides the public web OAuth application identifier in the website code. That identifier cannot access anyone's Google Drive by itself. An account grants access only by signing in to Google's own authorization window.

### Publisher information and current limits

- The DK Seed Bank web OAuth application, Google Drive API, and `drive.appdata` scope are configured through the developer's Google Cloud project. This is a publisher responsibility, not a user setup step.
- While the Google OAuth application is in **Testing** status, only accounts added to its test-user list can connect. To offer sign-in to the public, the publisher must switch to production and complete any Google verification required by the requested scope.
- The **Linux desktop edition uses a different Desktop OAuth client ID**, from the same Google Cloud project. That registration is not configured in the published portable Linux download yet, so do not use the web client ID as the desktop client ID. The existing desktop build may still request its separate client ID until that edition is updated.
- The web browser and desktop edition need OAuth clients from the same Google Cloud project to see the same Google app-data storage for one signed-in user.
- A browser pop-up blocker or expired sign-in session may require using Connect again. On iPhone, automatic sync runs only when the website is open.

## How synchronization works

- DK Seed Bank uploads each device's full validated snapshot (including compressed
  growth photographs) to the private app-data area.
- Before updating a device, it downloads and validates the existing snapshots and
  merges plantings, dated height measurements, photo histories, and saved records.
- It keeps separate per-device snapshots so one offline device cannot silently
  overwrite the only cloud copy. Deletions of plantings and their growth photos or
  measurements carry deletion markers to prevent an older snapshot reviving them.
- Sync transfers up to 95 MB of snapshot content. Larger photo collections require
  smaller files or separate backups.
- **Sync now** works on demand; optional auto-sync runs approximately every two
  minutes while the app is open, online, and authorized. Browsers on iPhone do
  not continuously sync while the website is closed.
- Website access tokens are stored only in memory and **per-tab sessionStorage**, until expiration. An ordinary refresh can reuse the valid token without another sign-in or forced consent. **Disconnect** clears the temporary cache. Closing the tab/browser or token expiry can still require sign-in; guaranteed persistent authorization across sessions would require a secure backend with refresh tokens. Tokens never go into permanent localStorage, backups, or public GitHub. The Linux desktop refresh token is stored only within that OS user's DK Seed Bank data directory, with owner-only file permissions.
- Sync is **not** a substitute for full downloadable JSON backups. Before the
  first synchronization, export a safety copy from each device.

Google API documentation:
[app-specific storage](https://developers.google.com/workspace/drive/api/guides/appdata),
[Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth),
[web sign-in](https://developers.google.com/identity/oauth2/web/guides/use-token-model).

**No personal collection or Google account identifiers belong in the project README.**

## Visible folder photo export

DK Seed Bank now includes the code for a second copy of each synchronized photograph
as a real image file in a user-selected, visible Google Drive folder, alongside the full
collection JSON backup. This is **additional** to the original hidden app-data sync, which
is preserved as the recovery source. No hidden data is deleted or migrated destructively.

This uses Google's narrow `drive.file` authorization, not full access to users' files.
A user selects **Choose my Google Drive folder** and chooses an existing folder via
Google Picker; the selected folder ID stays on that device. This does not silently grant
other people access to the publisher's personal Drive.

### Google Picker integration

The website's Google Picker API is enabled and a browser key is configured for
the DK Seed Bank Google Cloud project. The key is restricted to the DK Seed Bank
GitHub Pages origin and Google Picker API. It identifies the website and does not
grant access to the publisher's Google account. Google account authorization is
per user and requested through Google's own OAuth dialog.

After choosing an existing folder on the same Google account, select **Sync now**
to save each uploaded photograph as a readable image file and create/update
**DK Seed Bank - full backup.json** directly inside that folder. Use the
**Open this folder in Google Drive** link to inspect them.

The website asks for the `drive.file` scope in addition to `drive.appdata`.
The Google consent page may ask users to authorize the additional permission
when they reconnect. Publisher must keep the scopes and OAuth application status
appropriately configured in the Google Auth Platform. While in Testing mode,
only registered test users may connect.

The original hidden app-data sync remains active whether or not a visible folder
is selected; it is not removed or replaced. A failed visible-folder export is
reported separately so that users can still see whether hidden sync succeeded.
Visible photos are not exposed to other users of DK Seed Bank.

## When Google Picker requests cookies or says access denied

The fixed folder window now includes **Retry folders**. Some browsers require the
embedded Google login/picker iframe to reload after third-party cookie permission
is granted. Click **Retry folders** to reload only the picker; don't delete the app,
clear site data, or re-upload the photographs.

Google's current Picker documentation requires a website-restricted Google Picker
browser API key that allows **both Google Picker API and Google Drive API**.
If access is still denied, the DK Seed Bank publisher must open the existing
**DK Seed Bank Picker** key in Google Cloud Console → APIs & Services → Credentials
and select both of those APIs under **API restrictions**. Retain the website
restrictions for `https://dereksparks1982.github.io/*` and
`https://docs.google.com/*`. Save; do not create a replacement key or change the
OAuth web client. These are developer-only changes, not end-user steps.

## Alternative if Google Picker says Access Denied

In **Sync & Backup**, use **Create my DK Seed Bank folder** to create a visible folder in the signed-in user's own Google Drive, without relying on Google Picker. Then choose **Sync now** to save photograph files and a full JSON backup in that folder. The same folder-creation option appears in the picker dialog if Google's embedded browser is denied. **Forget selected folder** clears the device selection but never deletes the folder or its files. Selecting *existing* folders still requires Google Picker to be permitted by its API key, referrer rules, OAuth project, and browser privacy settings.

Google's browser-only access tokens expire. An unexpired token is retained during a page refresh, but closing a browser session or token expiry can require reconnecting. Persistent background synchronization requires a separate authorized backend or desktop OAuth flow, which this static website does not have.

## Device pairing, folder discovery and sync history (November 2026)

After authorizing the same Google account in DK Seed Bank on another web device, the app verifies any folder ID saved on that device, then searches Drive for an existing folder named **DK Seed Bank** that is available under this app's `drive.file` permission. If exactly one is accessible, the same Drive folder ID is reused. **Create my DK Seed Bank folder** is hidden while connected to an existing folder and appears only after a successful search finds none. Every attempt to create performs another check first. If more than one is found, or Google denies the search, the app **does not** create another folder. Use **Find existing folder** to retry or **Choose my Google Drive folder** to select the appropriate folder using Picker.

**Limitation:** with the narrow `drive.file` scope the app cannot discover arbitrary folders created by other applications, or folders Google has not made accessible to DK Seed Bank. The app does not use the publisher's personal Google Drive or auto-share folders. Google authorization still happens independently on each device. The web app may need reconnection once the short-lived token expires.

**Two separate backups:** private two-way synchronization uses per-account Google Drive **appDataFolder** snapshots, which are hidden from regular Drive browsing. The normal visible **DK Seed Bank** folder contains exported photos and a full JSON backup for the user's own inspection and safekeeping. The Sync & Backup panel displays separate timestamps for the last successful private cloud sync and last completed visible-folder backup on the current device. A visible export does not itself prove changes were imported on a second device; verify your planting records and photos after connecting the iPhone before deleting any other backups.

## Record safety improvements

New or edited garden records, deleted seed lots/beds and deleted watering records now carry change times or deletion markers. Uploaded plant and packet photos also have revision times, and removed photos have deletion markers. On sync, the app prefers the newest actual revision instead of the last backup export time. The validated merged snapshot is uploaded to the private Google Drive backup before locally applying it. The visible DK Seed Bank folder is a separate, readable export of pictures and the complete JSON snapshot. Keep backups until actual iPhone and desktop round-trip synchronization has been tested.
