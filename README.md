# CAUgen v3 — Identity Platform

> Four tools. One platform. Usernames · Passwords · Emails · Domains.

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
---

## Share URL format

```
https://caugen.vercel.app/
```

Payload:
```json
{ "name": "alex", "birthYear": "2001", "interests": ["tech"], "vibe": "cool", "regenOffset": 2 }
```

On open: form auto-fills + generate() fires.

---

MIT License — CAUgen 2025
