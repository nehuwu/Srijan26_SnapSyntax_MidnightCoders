# CAUgen v3 — Identity Platform

> Four tools. One platform. Usernames · Passwords · Emails · Domains.

---

## Deploy to Vercel (GitHub → Vercel)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "CAUgen v3"
git remote add origin https://github.com/YOUR_USER/caugen.git
git push -u origin main

# 2. Import in Vercel dashboard → vercel.com/new
# Framework preset: Vite (auto-detected)
# Build command: npm run build
# Output dir: dist
# Done — no env vars needed
```

---

## Local dev

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build
npm run preview    # preview production build locally
```

---

## File map

```
src/
├── App.jsx                    ← hash router + ThemeContext + RouterContext
├── index.css                  ← full design system (Cabinet Grotesk + DM Mono)
├── main.jsx
├── components/
│   └── Navbar.jsx             ← glass sticky nav, theme toggle
├── pages/
│   ├── HomePage.jsx           ← hero + 4 live tool cards
│   ├── UsernamePage.jsx       ← form + 10/10/10 results + availability + share link
│   ├── PasswordPage.jsx       ← memorable (baseInput) + random modes
│   ├── EmailPage.jsx          ← service radio + keyword + scored results
│   ├── DomainPage.jsx         ← brand/domain suggestions (Phase 5: real check)
│   ├── SavedPage.jsx          ← saved items + identity bundles tab
│   └── ProfilePage.jsx        ← session stats + pro features
└── services/
    ├── generator.js            ← token + pattern + scoring + validator
    ├── availability.js         ← GitHub check + structured response + cache
    ├── memory.js               ← MEM (liked/history) + IDENTITY (bundles)
    ├── passwordGen.js          ← memorable + strong modes + strength analyser
    ├── emailGen.js             ← pattern-scored email generator
    └── domaingen.js            ← brand name + domain suggestion engine

vercel.json                     ← Vercel config (SPA rewrite + cache headers)
.gitignore
```

---

## New in Phase 4

| Feature | Detail |
|---|---|
| **Email v2** | Service selector (Gmail/Yahoo/Outlook/Proton/Other), optional keyword, pattern-scored output |
| **Password v2** | Memorable mode (phrase → structured password) + strong random mode |
| **Domain/Brand** | New tool — TLD-aware, vibe-matched suggestions |
| **Identity bundles** | `IDENTITY` in memory.js — groupable username+email+password objects |
| **Availability v2** | Structured `{github, instagram, domain}` response (instagram/domain = Phase 5 stubs) |
| **Share link** | btoa-encoded URL — restores form + results on open |
| **Design** | Cabinet Grotesk + DM Mono fonts, glassmorphism cards, ambient bg orbs |
| **Vercel** | vercel.json with SPA rewrites + asset caching headers |

---

## Share URL format

```
https://caugen.vercel.app/#username?data=BASE64_ENCODED_JSON
```

Payload:
```json
{ "name": "alex", "birthYear": "2001", "interests": ["tech"], "vibe": "cool", "regenOffset": 2 }
```

On open: form auto-fills + generate() fires.

---

MIT License — CAUgen 2025
