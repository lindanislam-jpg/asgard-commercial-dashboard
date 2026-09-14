# Licence gate — how to run it

The dashboard now asks for a licence key on first run and checks it against
`licences.json` in this repo. You grant, extend and revoke access by editing
that one file.

---

## ⚠️ One step before this works

The gate reads the register from the **`main`** branch:

```
https://raw.githubusercontent.com/lindanislam-jpg/asgard-commercial-dashboard/refs/heads/main/licences.json
```

`licences.json` is on the feature branch right now, so **merge this branch into
`main`** before sending the dashboard to anyone. Until you do, the fetch 404s
and users see "Could not reach the licence server".

(If you'd rather point at a different branch, edit `registerUrl` near the top of
the gate script at the bottom of `index.html`.)

---

## Opening the admin panel

- Press **Ctrl+Shift+L**, or add **`#admin`** to the URL
- Password: **`AsgardAdmin2026!`** — change this, see below

From the panel you can start a trial, extend by 14 days, or revoke. Each action
produces an updated `licences.json` to paste into GitHub. There's an "Open on
GitHub" button that takes you straight to the edit page.

The panel can't commit for you — a browser has no write access to the repo
without an access token, and embedding one in a public repo would leak it.
So it's copy → paste → commit.

## Granting a 14-day trial

1. Open the admin panel
2. Type the customer's name under **Start a new 14-day trial**, click **Create**
3. It shows you their key (e.g. `COLLIN-2026`) — send them that
4. Copy the updated JSON, paste it into `licences.json` on GitHub, commit

## Revoking

1. Open the admin panel, click **Revoke** next to their name
2. Paste the updated JSON into `licences.json`, commit

They're locked out the next time they open the dashboard. If they're offline
they keep working until their grace period runs out (7 days from their last
successful check), then they're locked until they reconnect.

## Extending

**+14d** adds 14 days. If the licence already lapsed it runs 14 days from today
rather than from the old date, so you never accidentally grant a licence that's
already expired.

## Editing the file by hand

```json
"COLLIN-2026": {
  "name": "Collin",
  "status": "trial",
  "expires": "2026-09-28",
  "note": "14-day trial"
}
```

- `status` — `trial`, `active`, or `revoked`
- `expires` — `YYYY-MM-DD`, or `null` for no expiry. **Exclusive**: a licence
  expiring `2026-09-28` works through the 27th and is dead on the 28th. That
  makes a trial starting the 14th exactly 14 days.

## Changing the admin password

```bash
printf '%s' 'your-new-password' | shasum -a 256
```

Paste the result into `adminPasswordHash` in the gate script at the bottom of
`index.html`. Only the hash is stored, never the password.

## Your own copy

Click **Trust this browser** in the admin panel and that browser skips the gate
permanently. Do this on your own machines so you're never locked out of your
own dashboard.

---

## What this does and doesn't stop

It stops casual sharing: a copy passed to someone without a key is useless, and
revoking genuinely cuts off access on the next load.

It will **not** stop someone technical. The check runs in the browser, so
anyone who opens devtools can bypass it in a couple of minutes. Real
enforcement means the data itself living behind a server that checks the licence
before returning anything — a much bigger job than this. For handing trials to
construction clients, this is the right amount of lock. Just don't treat it as
copy protection against a determined developer.
