# Secure Vault for Mac

> An encrypted vault for photos and files on macOS. **Status: design stage / private beta waitlist.** Nothing is released yet.

**[Join the beta → securemacapp.com/vault/](https://securemacapp.com/vault/)**

## What it will do

- Encrypt photos, PDFs and other files you drag in.
- Unlock with Touch ID (password fallback).
- Lock automatically when the window closes or the Mac sleeps.
- Work without mounting or ejecting disk images.

## Encryption design (planned)

- **Cipher:** AES-256 in an authenticated mode (AES-GCM or equivalent).
- **Keys:** a random vault key is generated on your Mac. It is wrapped by a key derived from your password and by a Keychain / Secure Enclave-protected item for Touch ID. The vault key never leaves the device and is never sent to us.
- **Recovery:** because we don't hold keys, we can't recover a vault. A user-held recovery key is planned.
- **Metadata:** file names and sizes are stored inside the encrypted container.
- **Audit:** the full design will be published here for review before the beta ships.

This section describes intent, not shipped behaviour, and may change.

## Roadmap

- [ ] Publish the design document
- [ ] Core encryption library with tests
- [ ] Mac app prototype (drag and drop, Touch ID)
- [ ] Private beta
- [ ] Independent security review

## Licence

Undecided: MIT or GPL for the core. To be settled before the first code is published.

Topics: `macos` `privacy` `encryption` `vault`

*Unofficial; not affiliated with Apple Inc.*
