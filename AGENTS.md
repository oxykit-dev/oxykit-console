# oxykit-console — agent guide

Vue app for Mail, Render, and Flow. The .NET hosts do not reference it. `oxykit-mail-web` is private — do not document or extend it.

## Libraries

| Need | Library | Why |
|------|---------|-----|
| App | Vue 3, Vite, TypeScript, Vue Router | One origin, lazy routes |
| Mail state | Pinia | Existing auth store |
| HTTP | axios | Mail, Render, and Flow clients already use it |
| Mail UI | Suite CSS (`src/mail/mail.css`) | Same panels, fields, and buttons as Render and Flow |
| Mail live updates | `@microsoft/signalr` | Dashboard hub |
| Mail charts | apexcharts | Existing dashboard charts |
| Mail composer | Quill (`@vueup/vue-quill`) | Send form |
| Shell, Render, Flow | Suite tokens in `src/shell/tokens.css` | No second component library |

## Modules

`public/config.json` is copied next to `index.html`. The app fetches it before creating the router (`cache: no-store`). Edit the deployed file and refresh. No rebuild.

```json
{ "mail": true, "render": true, "flow": true }
```

A key is on unless it is `false`. A missing key or a missing file leaves every module on. Sign-in still uses Mail when `"mail"` is `false`. Public writeup: `oxykit-site/docs/mail/auth.md` (`#modules`).

Sign-in is `/login`. Mail issues the session. Unsigned `/`, `/render`, and `/flow` go there; a saved API key does not skip it. Mail routes and roles: [`src/mail/features/README.md`](src/mail/features/README.md).

Dev proxies (when the matching URL env is unset):

| Browser path | Host |
|--------------|------|
| `/api/v1`, `/hubs` | Mail `:5026` |
| `/api/render/*` | Render `:5066` (prefix stripped) |
| `/api/flow/*` | Flow `:5077` (prefix stripped) |

## Layout

```text
src/
  shell/          session cookie, theme, nav
  modules.ts      config.json switches
  mail/           Mail module (features, api, mail.css)
  render/         template studio
  flow/           jobs
```

```bash
npm install
npm run dev      # :5173
npm test
npm run build
```

Run with `npm run dev` (`:5173`) beside the API hosts. Compose does not build a UI.
