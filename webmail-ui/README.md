# Codecoder Mail Frontend

Static, framework-free webmail UI intended to replace Roundcube's frontend layer without changing the underlying mail infrastructure.

## Stack

- HTML
- CSS
- Vanilla JavaScript

## Backend assumptions

The existing infrastructure stays unchanged:

- Postfix for SMTP
- Dovecot for IMAP
- MariaDB for app data or sessions
- TLS already handled on `mail.codecoder.in`

This app is only a frontend shell today. It is structured to connect later to a custom API that can sit in front of IMAP/SMTP actions.

## Suggested folder structure

```text
webmail-ui/
  index.html
  vercel.json
  README.md
  src/
    assets/
    styles/
      base.css
      layout.css
      components.css
      responsive.css
    js/
      app.js
      core/
        store.js
      data/
        mailboxes.js
        messages.js
      services/
        api.js
      components/
        sidebar.js
        searchBar.js
        mailList.js
        mailView.js
        composeModal.js
        toast.js
```

## UX notes

- Dark-first palette
- Responsive two/three-panel layout
- Dummy mailbox switcher for multiple accounts
- Search shell
- Compose modal
- Toast notifications
- Attachment cards
- Loading skeletons
- Empty states
- Thread preview blocks
- Ready for realtime, infinite scroll, and pagination extensions

## API surface

Defined in [src/js/services/api.js](/home/ubuntu/webmail-ui/src/js/services/api.js).

Mock Vercel handlers are included in:

- [api/v1/auth/session.js](/home/ubuntu/webmail-ui/api/v1/auth/session.js)
- [api/v1/auth/me.js](/home/ubuntu/webmail-ui/api/v1/auth/me.js)
- [api/v1/mailboxes/index.js](/home/ubuntu/webmail-ui/api/v1/mailboxes/index.js)
- [api/v1/mailboxes/[mailboxId].js](/home/ubuntu/webmail-ui/api/v1/mailboxes/[mailboxId].js)
- [api/v1/messages/[messageId].js](/home/ubuntu/webmail-ui/api/v1/messages/[messageId].js)
- [api/v1/messages/send.js](/home/ubuntu/webmail-ui/api/v1/messages/send.js)

Recommended backend shape:

- `POST /api/v1/auth/session`
- `GET /api/v1/mailboxes`
- `GET /api/v1/mailboxes/:mailboxId/messages`
- `GET /api/v1/mailboxes/:mailboxId/messages/:messageId`
- `POST /api/v1/messages/send`
- `POST /api/v1/drafts`
- `DELETE /api/v1/messages/:messageId`
- `POST /api/v1/messages/:messageId/spam`
- `POST /api/v1/messages/:messageId/star`
- `POST /api/v1/attachments`
- `GET /api/v1/events/stream`

## Replace mocks with real mail backend

When you bind this to `https://mail.codecoder.in`, keep the frontend contract the same and swap the internals:

1. `GET /api/v1/auth/me`
   - validate your session cookie
   - map user to mailbox permissions

2. `GET /api/v1/mailboxes`
   - return allowed mailboxes
   - return folder counts from IMAP state or cached DB state

3. `GET /api/v1/mailboxes/:mailboxId`
   - query IMAP folders through Dovecot-compatible tooling or a server-side IMAP library
   - return message list summaries only

4. `GET /api/v1/messages/:messageId`
   - fetch full message body, attachments, thread metadata

5. `POST /api/v1/messages/send`
   - submit through local Postfix on `localhost:587` or local sendmail-compatible submission
   - do not expose SMTP credentials to the browser

## Bind to `mail.codecoder.in`

Recommended production shape:

1. Deploy this static frontend on Vercel.
2. Put a lightweight custom API behind `https://mail.codecoder.in/api`.
3. Keep Roundcube available temporarily at `/roundcube` until the replacement is fully validated.
4. Terminate TLS at the existing host or reverse proxy.
5. Expose only app-specific API methods to the browser. Do not expose raw IMAP or SMTP directly to frontend JavaScript.

## Local preview

For the static shell only, any static server works. Example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/webmail-ui/`.

For frontend plus API functions together, use Vercel dev so `/api/v1/...` executes as functions instead of being served as plain files.
