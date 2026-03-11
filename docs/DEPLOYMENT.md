# Deployment Guide

This project is not a static-only deploy. The public pages are generated into `dist/`, but the admin writes to `content/*.json` and `content/media/`, then rebuilds the site.

That means the live host must have:

- Node.js available
- a long-running server process
- persistent writable disk storage
- HTTPS in front of the admin

## Good hosting fit

- Linux VPS with `systemd` and `nginx`
- a small VM behind a reverse proxy
- a platform with persistent disk and support for long-running Node apps

## Bad hosting fit

- read-only static hosting
- serverless-only hosting where local file writes do not persist

## 1. Prepare the server

Install:

- Node.js 20+
- npm
- nginx

Copy the project to the server, then install dependencies:

```bash
npm install
npm run build
```

## 2. Set production environment variables

Create a real `.env` on the server:

```env
NODE_ENV=production
TRUST_PROXY=1
PORT=3000
ADMIN_USERNAME=replace-this
ADMIN_PASSWORD=replace-this-with-a-long-random-password
SESSION_SECRET=replace-this-with-a-long-random-secret
```

Notes:

- `TRUST_PROXY=1` is needed when the app sits behind nginx or another proxy.
- Do not commit the real `.env`.
- Use a long random password and session secret.

## 3. Run as a service

Example `systemd` unit:

- [sharon-kitchen.service.example](/C:/AG/Repos2/SharonKitchen/deploy/systemd/sharon-kitchen.service.example)

Typical steps:

```bash
sudo cp deploy/systemd/sharon-kitchen.service.example /etc/systemd/system/sharon-kitchen.service
sudo systemctl daemon-reload
sudo systemctl enable sharon-kitchen
sudo systemctl start sharon-kitchen
sudo systemctl status sharon-kitchen
```

## 4. Reverse proxy with HTTPS

Example nginx site config:

- [sharon-kitchen.conf.example](/C:/AG/Repos2/SharonKitchen/deploy/nginx/sharon-kitchen.conf.example)

Typical steps:

```bash
sudo cp deploy/nginx/sharon-kitchen.conf.example /etc/nginx/sites-available/sharon-kitchen
sudo ln -s /etc/nginx/sites-available/sharon-kitchen /etc/nginx/sites-enabled/sharon-kitchen
sudo nginx -t
sudo systemctl reload nginx
```

Then add TLS with Let's Encrypt or your preferred certificate setup.

## 5. Admin protection

The app now includes:

- session login
- secure cookies in production
- CSRF protection on save, rebuild, and upload actions
- login throttling
- image upload type checks

For a stronger production setup, add one more outer control in front of `/admin` and `/login`:

- Cloudflare Access
- IP allow-list
- reverse-proxy basic auth

## 6. Health check

Use:

```text
/health
```

It returns a simple JSON response and can be used by uptime monitors or load balancers.

## 7. Backups

Back up these paths regularly:

- `.env`
- `content/site.json`
- `content/files.json`
- `content/media/`
- any other `content/*.json` you keep using

If the host disk is lost, the admin edits and uploaded images are lost too unless those files are backed up.

## 8. After deployment

Check:

- `https://your-domain/` loads
- `https://your-domain/login` works over HTTPS
- admin login succeeds
- save and rebuild succeeds
- image upload succeeds
- `/health` returns `200`
- the server restarts cleanly after reboot

## 9. Update workflow

For content edits:

- use the admin
- save and rebuild

For code/template changes:

- update the repo
- pull on the server
- run `npm install` if dependencies changed
- run `npm run build`
- restart the service if needed
