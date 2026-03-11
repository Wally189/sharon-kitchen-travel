# Sharon Kitchen Static Website

Lightweight brochure-site build with a separate admin console.

## Architecture

- Public site: generated static HTML in `dist/`
- Content source: simple JSON files in `content/`
- Admin: small Express app with login, file upload, and rebuild trigger
- Templates: reusable Nunjucks files in `templates/`

This keeps the main site static while still giving the owner a simple way to edit content.

## Commands

```bash
npm install
npm run build
npm run admin
```

Admin and local preview run from `http://localhost:3000`.

- Public site: `/`
- Admin login: `/login`
- Admin console: `/admin`

## Login

Set credentials in `.env`:

```bash
NODE_ENV=production
TRUST_PROXY=1
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this
SESSION_SECRET=replace-this-too
PORT=3000
```

You can copy `.env.example` to `.env` as the starting point.

If `.env` is missing, the app falls back to:

- Username: `admin`
- Password: `playtrix`

That is only for local setup and should be changed before any live use.

## Live deployment notes

Before putting `/admin` on a live website:

- use real values for `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET`
- serve the site over HTTPS
- set `NODE_ENV=production`
- set `TRUST_PROXY=1` if the app sits behind a reverse proxy or platform load balancer
- deploy somewhere with persistent writable storage, because the admin writes to `content/*.json` and `content/media/`

The admin now includes:

- server-side session auth
- secure cookies in production
- CSRF protection on save, rebuild, and upload actions
- login throttling
- basic image upload validation
- reduced API surface for the simplified editor

## Content files

- `content/site.json`: homepage and public-site content
- `content/notices.json`: dashboard notices
- `content/files.json`: uploaded files and image library records
- `content/contacts.json`: contact or lead list
- `content/clients.json`: client list
- `content/settings.json`: admin/dashboard settings

## Rebuild flow

Every save in the admin writes back to JSON and then regenerates `dist/`.

That means:

- no live database
- no runtime CMS dependency for the public site
- content stays portable and easy to back up

## Reuse for other client sites

To repurpose this structure for another brochure site:

1. Replace `content/site.json`
2. Replace or upload images/files
3. Adjust the Nunjucks templates in `templates/`
4. Keep the same admin and build scripts

The current setup is intentionally simple so it can be cloned for similar local-business sites.

## Deployment

Production deployment notes are in:

- `docs/DEPLOYMENT.md`

Use the examples in:

- `deploy/systemd/`
- `deploy/nginx/`
