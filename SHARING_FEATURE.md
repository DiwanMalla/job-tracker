# Public Read-Only Sharing Feature

## Feature Description
Allow users to share their job application list with others via a public, read-only link. This enables viewers to see the application dashboard without authentication or edit permissions.

## How It Works
- **Generate Shareable Link:**
  - User clicks "Share" on their dashboard.
  - System generates a unique, public URL (e.g., `/public/{shareId}`).
- **Read-Only Dashboard:**
  - Visitors to the link see the job application list in read-only mode.
  - No edit, delete, or upload actions are available.
- **Privacy Controls:**
  - User can choose which fields to share (e.g., hide notes or documents).
  - User can revoke the link at any time, disabling public access.
- **Security:**
  - Shareable links use random, hard-to-guess IDs.
  - No authentication required for viewers, but only non-sensitive data is shown unless allowed.

## Implementation Notes
- Add a `shareId` field to user/application records.
- Create a public API route to fetch shared data by `shareId`.
- Render dashboard in read-only mode when accessed via share link.
- Add UI controls for sharing/revoking links and selecting visible fields.

---

*This feature will be included in the project plan for implementation.*
