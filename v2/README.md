# TK-100 — v2 (modular, skinnable)

Same player as the root `index.html`, split into separate files so it is easier to
maintain and so the look can be swapped with **skins**.

```
v2/
├── index.html              Markup only (no inline CSS/JS)
├── css/
│   ├── base.css            Reset, page, chassis, header, footer
│   ├── components.css      Disc, LCD, scrubber, buttons, library drawer, forms
│   ├── layout.css          TV mode + landscape layout
│   └── skins/              ← one file per skin: CSS variables only
│       ├── graphite.css    Default (the original look) — fully commented
│       ├── silver.css      Light brushed aluminium
│       ├── phosphor.css    Green CRT / monospace / squared corners
│       └── walnut.css      Wood-grain cabinet, brass accent, serif
└── js/                     Classic scripts sharing one global scope (order matters)
    ├── config.js           Constants (Dropbox client id, storage keys, icons)
    ├── utils.js            DOM / formatting helpers
    ├── state.js            Shared mutable state
    ├── dropbox.js          API wrapper + temporary-link cache
    ├── auth.js             OAuth PKCE login, token refresh, sign-out
    ├── artwork.js          Embedded ID3 art + throttled folder-art queue
    ├── media-session.js    Lock-screen / OS media controls
    ├── disc.js             Spinning CD animation loop
    ├── tray.js             Insert / eject tray mechanics
    ├── library.js          Folder browsing + library drawer
    ├── player.js           Display refresh, play, stop, step, play/pause
    ├── controls.js         Button / scrubber / <audio> event wiring
    ├── skins.js            Skin registry + switcher
    └── main.js             Bootstrap (runs last)
```

## Skins

Tap **Skin** in the header to cycle; the choice is remembered (`localStorage: tk_skin`).

A skin is a single file that sets CSS variables on `:root` (colours, gradients, shadows,
fonts, corner radii). The shared CSS contains no hard-coded colours, so a skin can
change the whole look without touching layout.

To add one:
1. Copy `css/skins/graphite.css` to `css/skins/<id>.css` and edit the values.
2. Add `{ id: '<id>', name: 'Display Name', themeColor: '#rrggbb' }` to `SKINS` in `js/skins.js`.

(The CD disc, bay vignette and disc label are fixed on purpose — they are physical
objects, not part of the chassis.)

## Dropbox sign-in

* Login uses the same Dropbox app and the same `localStorage` keys as v1. If you are
  already signed in on the same site, v2 picks up that session automatically.
* To sign in **fresh from v2**, add the v2 URL (e.g.
  `https://<user>.github.io/TK_MusicPlayer/v2/`) to **Redirect URIs** in the Dropbox
  App Console. The redirect URI is the page's own path, so `/v2/` is a different URI
  from the root.

## Running locally

Serve over http (Dropbox OAuth will not work from `file://`):

```
cd TK_MusicPlayer && python3 -m http.server 8000   # then open http://localhost:8000/v2/
```
