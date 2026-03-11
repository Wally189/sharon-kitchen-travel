# Content Model

## Public content

`content/site.json`

- `businessName`
- `siteTitle`
- `siteDescription`
- `tagline`
- `hero`
- `serviceTypes`
- `services`
- `story`
- `vehicle`
- `gallery`
- `faq`
- `contact`
- `footer`

## Admin-only content

`content/notices.json`

- dashboard notices

`content/files.json`

- uploaded files and image records

`content/contacts.json`

- contact and lead records

`content/clients.json`

- client records and statuses

`content/settings.json`

- admin title
- dashboard intro
- site URL
- publish checklist
- internal notes

## Build output

- `dist/index.html`
- `dist/gdpr.html`
- `dist/privacy.html`
- `dist/terms.html`
- `dist/assets/`

## Notes

The public site is rendered only from structured content files. The admin does not change templates directly.
