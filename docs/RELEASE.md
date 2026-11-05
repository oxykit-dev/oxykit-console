# Release (one static zip)

oxykit-console does **not** publish to npm. Tag pushes build one same-origin site zip for GitHub Releases.

Workflow: [`.github/workflows/release.yml`](../.github/workflows/release.yml)

## Asset

| Asset | Notes |
|-------|--------|
| `oxykit-console-{version}.zip` | Static files. No Node and no .NET runtime on the server. Calls `/api/v1`, `/hubs`, `/api/render`, and `/api/flow` on the same origin. `config.json` is inside the zip. |

## Release steps

1. Bump `version` in `package.json` (must match the tag).
2. Cut `CHANGELOG.md`.
3. Commit and push to the default branch.
4. Tag and push:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

Watch **Actions → Release**. The tag without `v` must match `package.json`.
