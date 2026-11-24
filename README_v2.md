# TK-100 — v2 (split version)

The original single-file `index.html`, split into separate HTML / CSS / JS files.
Look and behaviour are unchanged. The CSS is arranged so skins can be added later.

```
v2/
├── index.html              Markup only (no inline CSS/JS)
├── css/
│   ├── base.css            Page, chassis, header, footer
│   ├── components.css      Disc, LCD, scrubber, buttons, library drawer, forms
│   ├── layout.css          TV mode + landscape layout
│   └── skins/
│       ├── default.css     The original look: every colour, gradient, shadow, font
│       └── mp1.css         MP1 — white, minimal
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
    ├── skins.js            Generic skin switcher (never needs editing to add a skin)
    └── main.js             Bootstrap (runs last)
```

## Switching skin

Tap **Skin** in the header to cycle between skins. The choice is remembered in the
browser (`localStorage: tk_skin`).

## Adding a skin later

`base.css`, `components.css` and `layout.css` contain structure only; they take all
colours, gradients, shadows, fonts and corner radii from CSS variables.
`css/skins/default.css` defines every one of those variables.

Skins are declared in **`index.html` only**, one `<link>` per skin. The first one is the
default:

```html
<link rel="stylesheet" href="css/skins/default.css" data-skin="default" data-name="TK-100">
<link rel="stylesheet" href="css/skins/mp1.css"     data-skin="mp1"     data-name="MP1">
```

To add a skin:
1. Copy `css/skins/default.css` to e.g. `css/skins/mine.css` and change the values.
   (A skin may also add its own rules after the variables for bigger layout changes;
   `mp1.css` does this — see its "Part 2".)
2. Add one line to `index.html`:
   `<link rel="stylesheet" href="css/skins/mine.css" data-skin="mine" data-name="Mine">`

No JavaScript changes are needed; the Skin button cycles through every skin listed.
To remove a skin, delete its line. Anyone who had it saved falls back to the default.

(The CD disc, bay vignette and disc label are fixed on purpose: they are physical
objects, not part of the chassis.)

## Dropbox sign-in

* Uses the same Dropbox app and `localStorage` keys as the root version, so if you are
  already signed in on the same site, v2 picks up that session.
* To sign in fresh from v2, add the v2 URL (e.g.
  `https://<user>.github.io/TK_MusicPlayer/v2/`) to **Redirect URIs** in the Dropbox
  App Console. The redirect URI is the page's own path, so `/v2/` differs from the root.
* Serve over http(s). Dropbox sign-in does not work when the page is opened straight
  from disk (`file://`): you will only see the Sign-in screen. The skins still switch.
  Locally: `cd TK_MusicPlayer && python3 -m http.server 8000`, then open
  `http://localhost:8000/v2/`.
