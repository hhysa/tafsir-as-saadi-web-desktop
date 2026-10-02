# Tefsir Es-Saadi

A Vue 3 Quran reader with an Electron desktop app and Windows installer. The Albanian interface includes all 114 surahs, Arabic and Albanian verse text, shared tafsir sections, full-Quran text search, bookmarks, saved reading position, light/dark themes, and adjustable text size.

## Run the web app

Install Node.js 22.12 or newer (a current LTS release is recommended), then run these commands in the project folder:

```sh
npm ci
npm run dev
```

Open the localhost address printed in the terminal. To preview the production web build:

```sh
npm run build
npm run preview
```

The `dist` folder can be served by any static web server. Do not open `dist/index.html` directly using `file://`; the web app loads local JSON using HTTP. The Electron version serves the same files through its own local protocol and works entirely offline.

