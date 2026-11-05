# Mail features

```text
features/<name>/
  api/           HTTP against /api/v1
  views/         route roots
  components/    feature-only UI (optional)
  composables/   feature-only (optional)
  stores/        feature-only (optional)
  index.ts       public barrel
```

Sign-in is `/login` (shell route, not a Mail screen). Unsigned `/`, `/render`, and `/flow` go there.

| Feature | Routes | Who |
|---------|--------|-----|
| `identity` | shell `/login` | login, bootstrap admin, auth store, logoff, role helpers |
| `dashboard` | `/dashboard` | stats, charts, SignalR — Admin or User |
| `email` | Send in the mail nav | send form — Admin or Sender |
| `users` | `/users`, `/profile` | user admin is Admin; profile and own password are any signed-in role |
| `apikeys` | `/apikeys` | list is Admin or User; create is Admin; regenerate and delete confirm first |
| `ops` | `/ops` | Admin DKIM |
| `templates` | `/templates` | Admin mail packs |

Import another feature only through its `index.ts`. Shared helpers are `@mail/shared`. Gate screens with route `meta.roles` and `identity/roles.ts`.

Agent map: [`../../../AGENTS.md`](../../../AGENTS.md).
