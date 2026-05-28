# flatpack.info

Source for the canonical home of the Flatpack standard, [flatpack.info](https://flatpack.info).

This repo contains:

- `index.html` — the landing page. Single self-contained HTML file, no
  external resources, follows the same discipline as Flatpack itself.
- `try/` — copies of the Flatpack templates and examples, served
  directly so the "Try one" links open real, working files.
- `tools/sync-flatpacks.mjs` — refreshes `try/` from a local clone of
  the canonical Flatpack repo. Run before every deploy.
- `vercel.json` — deploy config for Vercel.

The Flatpack standard itself lives at
[github.com/ConceptPending/flatpack](https://github.com/ConceptPending/flatpack).

## Local preview

```bash
# Sync the latest Flatpacks into try/
node tools/sync-flatpacks.mjs

# Serve locally — any static server works
python3 -m http.server 8080
# or: npx serve .
```

Then open <http://localhost:8080>.

## Deploying

Hosted on Vercel from this repo's `main` branch.

```bash
# First time only
vercel link

# Deploy
node tools/sync-flatpacks.mjs   # refresh try/ from upstream
vercel --prod
```

`vercel.json` declares the site as static — no build, no functions.

## Updating after upstream changes

When the canonical Flatpack repo ships a new template or example:

```bash
cd ~/flatpack && git pull       # or wherever your clone lives
cd ~/flatpack-info
node tools/sync-flatpacks.mjs
git add try/ && git commit -m "Sync Flatpacks from upstream"
git push                         # Vercel autodeploys
```

## What's next

The current landing page is a **holding page** — the v0.1 of
flatpack.info. The piece still to ship:

- **The web generator** — a server-rendered page that takes a
  user's request, calls an LLM API with the Flatpack generation
  prompt loaded, validates the output, and offers a download.
  Becomes `/generate` or a subdomain. When that ships, add a CTA
  card to `index.html` and a small "how this works" page.

(No email-signup form yet — deliberately. Adding one before there's
something to send wouldn't be useful and would oblige a list to keep
clean.)

## License

The Flatpack standard is MIT-licensed; see
[LICENSE](https://github.com/ConceptPending/flatpack/blob/main/LICENSE).
The contents of this repo (the landing page itself) are MIT-licensed
under the same terms.
