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

## One-time Google Cloud setup

DK Seed Bank is currently **bring-your-own-OAuth-client**. The program cannot
start Google sign-in until its user or distributor configures valid Google OAuth
client IDs. Client IDs identify an app, **not** a user's Google account. A public
client ID does not grant access to anyone's Drive without that person's consent.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. Enable the **Google Drive API** for that project.
3. Configure the Google OAuth consent screen. If using Testing mode, add the
   Google account(s) that will sign in as test users. Publish and complete any
   required Google review before distributing broadly.
4. Create a **Web application** OAuth Client ID. Under Authorized JavaScript
   origins, add exactly `https://dereksparks1982.github.io`, with no path.
   Paste that client ID into the **Google Drive sync** section on the iPhone web app.
5. Create a separate **Desktop app** OAuth Client ID **in the same Google Cloud
   project**. Paste it into the Linux desktop program's Google Drive sync section.
6. Select **Connect my Google Drive**, choose and approve your own Google account,
   then select **Sync now**. On the website, the first tap may load Google's sign-in
   library; tap Connect again when prompted. The desktop app opens your default browser.
7. Sign into the **same Google account** in both app versions, then Sync now on
   each device. You can optionally enable auto-sync while each app is open.

Use the **same Cloud project** for the web and desktop OAuth client IDs: Google
isolates hidden application data per app and per Google user. Different Google
Cloud projects do not share the same app-data storage even for the same user.

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
