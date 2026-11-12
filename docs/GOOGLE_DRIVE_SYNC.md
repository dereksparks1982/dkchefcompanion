# Optional Google Drive synchronization

DK Seed Bank keeps its data on your device unless you explicitly connect Google and
choose **Sync now** or opt into automatic synchronization while the app is open.

## Privacy and account isolation

- Every user signs into **their own Google account**. No Google account, refresh token,
  folder ID, or password is shipped in DK Seed Bank or stored in the public repository.
- Authorization requests only the limited `drive.appdata` permission. It cannot browse
  or edit other files or folders in Google Drive.
- Google stores the snapshots in a **hidden application-data area** within the
  authorized user's Drive. You don't need to create a folder and cannot browse these
  snapshots in the regular Google Drive website.
- Disconnect removes the local Google authorization (desktop: the local refresh-token
  file; website: the in-memory token). Existing uploaded data remains in the user's
  Google app-data area. Revoke access in Google Account permissions if needed.
- Do not sign into an account that should not receive the local collection: the app
  clearly asks for permission before connecting, and `Sync now` transfers data to
  the account you authorized.

## Connect Google Drive on the website (English and Russian)

1. Open [DK Seed Bank](https://dereksparks1982.github.io/seedrepo/) on your device.
2. Open **Google Drive sync** and select **Connect my Google Drive**.
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
- Website access tokens remain **in memory only** and typically require another
  Google sign-in after reloading or when the token expires. The Linux desktop
  refresh token is stored only within that OS user's DK Seed Bank data directory,
  with owner-only file permissions.
- Sync is **not** a substitute for full downloadable JSON backups. Before the
  first synchronization, export a safety copy from each device.

Google API documentation:
[app-specific storage](https://developers.google.com/workspace/drive/api/guides/appdata),
[Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth),
[web sign-in](https://developers.google.com/identity/oauth2/web/guides/use-token-model).

**No personal collection or Google account identifiers belong in the project README.**

## Visible folder photo export (pending publisher setup)

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
