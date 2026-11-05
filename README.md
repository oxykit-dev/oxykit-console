# oxykit-console

Optional console for OxyKit Mail, Render, and Flow. One Vue app. The API hosts run without it.

Modules are `public/config.json` (copied next to `index.html` on build). The app reads it on each load. Set a key to `false` and refresh. No rebuild. A missing key, or a missing file, leaves that module on. Sign-in still uses Mail when `"mail"` is `false`.

```json
{
  "mail": true,
  "render": true,
  "flow": true
}
```

See [AGENTS.md](AGENTS.md).

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173. Mail is proxied from `:5026`, Render from `:5066`, Flow from `:5077`.
