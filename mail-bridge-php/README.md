# Codecoder Mail Bridge PHP

Thin PHP API intended to run on the mail VM behind Apache at `https://mail.codecoder.in/api`.

This is the correct role split:

- Vercel: static frontend
- mail VM: API bridge close to Dovecot and Postfix

## What it does

- Authenticates by logging into Dovecot IMAP with the submitted mailbox username/password
- Stores an HTTP session for the web UI
- Lists mailbox folders and messages through IMAP
- Fetches message detail through IMAP
- Sends mail through local Postfix using `/usr/sbin/sendmail`

## Current assumptions

- Active mailboxes:
  - `support`
  - `noreply`
- IMAP reachable locally on `127.0.0.1:143` with STARTTLS
- Postfix sendmail binary available at `/usr/sbin/sendmail`

## Routes

- `POST /api/v1/auth/session`
- `DELETE /api/v1/auth/session`
- `GET /api/v1/auth/me`
- `GET /api/v1/mailboxes`
- `GET /api/v1/mailboxes/{mailboxId}?folder=inbox&q=...`
- `GET /api/v1/messages/{messageId}`
- `POST /api/v1/messages/send`

## Deploy on Apache

Recommended target:

```text
/var/www/codecoder-mail-api/
  public/
  src/
```

Apache example:

```apache
Alias /api /var/www/codecoder-mail-api/public

<Directory /var/www/codecoder-mail-api/public>
    AllowOverride All
    Require all granted
</Directory>
```

Then enable `rewrite` and reload Apache.

## Frontend binding

Point the frontend API base to:

`https://mail.codecoder.in/api`

If frontend stays on Vercel under another origin, add CORS carefully and use cookie-based session auth with HTTPS only.

## Notes

- Message IDs are composite base64 values: `mailbox|folder|uid`
- This keeps the frontend contract stable without exposing raw IMAP commands
- Attachment parsing is not implemented yet
- Star, delete, spam, reply threading, and draft persistence are not implemented yet

## Next implementation steps

1. Add attachment parsing from MIME parts
2. Add IMAP flag updates for star/unstar
3. Add move operations for trash/spam
4. Add draft save in MariaDB or IMAP Drafts
5. Add CSRF protection and origin checks for production
