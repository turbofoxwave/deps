# monodeps

> **Deprecated.** This package is no longer maintained. Modern workspace tooling covers its use cases more completely. See [Alternatives](#alternatives) below.

Previously: load a dependency-sorted array of package objects from a monorepo folder tree. Built to assist with publishing multiple packages where in-repo packages depend on each other — especially when maintaining cross-dependencies with lock files.

That workflow predates [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) (npm 7+). With workspaces, a single root lockfile and local package linking replace per-package installs and manual ordering.

## Alternatives

Pick based on what you were using `monodeps` for.

### Cross-package dependencies and lockfiles

Use a workspace-aware package manager so all packages share one install graph and one lockfile.

**npm workspaces** (built into npm 7+):

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["packages/*"]
}
```

```bash
npm install
```

Reference sibling packages with `workspace:*` in `dependencies`:

```json
{
  "dependencies": {
    "@my-org/utils": "workspace:*"
  }
}
```

Docs: [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)

**pnpm workspaces** — faster installs, strict dependency isolation, strong monorepo support:

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

Docs: [pnpm workspaces](https://pnpm.io/workspaces)

**Yarn workspaces** (Classic or Berry):

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

Docs: [Yarn workspaces](https://yarnpkg.com/features/workspaces)

---

### Publishing packages in dependency order

`monodeps` sorted packages so you could publish dependents after their in-repo dependencies. Use one of these instead:

| Tool | Best for | Topological publish |
| --- | --- | --- |
| [Changesets](https://github.com/changesets/changesets) | Version bumps, changelogs, CI-driven releases | Yes (`changeset publish`) |
| [pnpm publish -r](https://pnpm.io/cli/publish) | pnpm monorepos, minimal extra tooling | Yes (built in) |
| [Lerna](https://lerna.js.org/) | Legacy npm/yarn monorepos already on Lerna | Yes (`lerna publish`) |

**Changesets** (works with npm, pnpm, or yarn workspaces):

```bash
npm install -D @changesets/cli
npx changeset init
# After merging version PR:
npx changeset publish
```

Docs: [changesets/changesets](https://github.com/changesets/changesets)

**pnpm recursive publish:**

```bash
pnpm publish -r --access public
```

`pnpm publish -r` publishes in dependency order and resolves `workspace:*` to the local version.

**Note:** Plain `npm publish --workspaces` does **not** publish in dependency order. If you stay on npm workspaces without Changesets or Lerna, publish in explicit tiers or switch to pnpm/Changesets.

---

### Build, test, and lint in dependency order

If you used the sorted package list to run scripts in order (build `utils` before `api`), use a task orchestrator:

| Tool | What it adds |
| --- | --- |
| [Turborepo](https://turbo.build/repo/docs) | Task pipeline, caching, parallel builds with dependency order |
| [Nx](https://nx.dev/) | Task graph, affected detection, caching |
| [pnpm recursive](https://pnpm.io/cli/recursive) | `pnpm -r run build` with `--workspace-concurrency` |

**Turborepo** example — `build` runs upstream packages first:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

```bash
npx turbo run build
```

---

### Circular dependency detection

Workspace tools surface cycles during install or via graph commands:

```bash
# pnpm
pnpm list -r --depth 0

# npm (inspect the dependency tree)
npm ls --workspaces
```

For CI, most orchestrators (Nx, Turborepo) fail when the task graph contains a cycle.

---

## Migration checklist

1. Add a root `package.json` with `"workspaces"` (or a `pnpm-workspace.yaml`).
2. Replace `file:../` sibling references with `workspace:*`.
3. Remove per-package `npm install` loops; run one install at the repo root.
4. Replace custom publish scripts that called `monodeps` with **Changesets** or **`pnpm publish -r`**.
5. Replace ordered build scripts with **Turborepo**, **Nx**, or explicit `-w` workspace flags.
6. Remove `monodeps` from your dependencies.

## Legacy API (deprecated)

<details>
<summary>Original usage (for reference only)</summary>

```bash
npm install monodeps
```

```javascript
const monodeps = require('monodeps')

/*
where folder example contains 3 packages: a,b,c.
c depends on b and a, b depends on a, a has no cross dependency.
*/
try {
  let packages = await monodeps.loadPackagesAsync('/example')

  console.log(packages[0].package.name) // -> 'a'
  console.log(packages[1].package.name) // -> 'b'
  console.log(packages[2].package.name) // -> 'c'

  console.log(packages[0].path) // -> /example/a
  console.log(packages[1].path) // -> /example/b
  console.log(packages[2].path) // -> /example/c
} catch (err) {
  console.error(err) // -> "Error: circular dependency"
}
```

</details>

## Publishing this deprecation to npm

After merging these changes and releasing a new version, mark the package deprecated on the registry:

```bash
npm deprecate monodeps "Deprecated: use npm/pnpm/yarn workspaces with Changesets or pnpm publish -r. See https://github.com/turbofoxwave/deps#alternatives"
```

To deprecate all versions:

```bash
npm deprecate monodeps "*" "Deprecated: use npm/pnpm/yarn workspaces with Changesets or pnpm publish -r. See https://github.com/turbofoxwave/deps#alternatives"
```
