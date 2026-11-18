# Arasaka Construct Interface — Folder Structure

How the repo is organized, where new code goes, and why. Numbers in the comments are card numbers from the sprint plan.

- **Stack:** Vite + React + TypeScript · Express + TypeScript · MongoDB (Mongoose) · Docker Compose · Netlify
- **Layout:** one repo with npm workspaces: `client`, `server`, `shared`
- **Lives at:** `docs/folder-structure.md`
- **Updated:** Nov 17, 2026

## Contents

1. [At a glance](#at-a-glance)
2. [The full tree](#the-full-tree)
3. [Key decisions](#key-decisions)
4. [Where does it go?](#where-does-it-go)
5. [Client](#client)
6. [Server](#server)
7. [Shared package](#shared-package)
8. [Netlify and environment variables](#netlify-and-environment-variables)
9. [Root config files](#root-config-files)
10. [Everyday commands](#everyday-commands)
11. [Naming conventions](#naming-conventions)
12. [Things to avoid](#things-to-avoid)
13. [Switching an existing repo to this layout](#switching-an-existing-repo-to-this-layout)
14. [References](#references)

## At a glance

| Folder | Holds | Runs |
| --- | --- | --- |
| `client/` | The React app | In the browser; Netlify serves the built files |
| `server/` | The Express API | Live as one Netlify Function; locally through `netlify dev` |
| `shared/` | Types and rules both sides use | Bundled into the client and the server; never runs alone |
| `netlify/functions/` | A 3-line wrapper around the API | On Netlify |
| `docs/` | Decisions, test checks, saved requests, this file | Reference only |
| Root files | Workspace, Netlify, Docker and TypeScript config | Read by npm, Netlify and Docker |

## The full tree

```text
arasaka-construct-interface/
├── client/                               # Vite + React + TypeScript
│   ├── public/                           # copied as-is to the site root (favicon)
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx                # all routes (card 3)
│   │   │   └── providers.tsx             # AuthProvider and other contexts
│   │   ├── assets/                       # images and fonts imported in code
│   │   ├── pages/                        # one thin component per route
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ConstructProfilePage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── features/                     # one folder per feature
│   │   │   ├── auth/
│   │   │   │   ├── AuthContext.tsx       # current user (card 16)
│   │   │   │   ├── ProtectedRoute.tsx    # sends logged-out users to /login (17)
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── auth.api.ts
│   │   │   ├── constructs/
│   │   │   │   ├── ConstructList.tsx     # dashboard list (card 11)
│   │   │   │   ├── ConstructProfile.tsx  # full profile (card 22)
│   │   │   │   ├── ConstructForm.tsx     # create + edit (cards 23, 24)
│   │   │   │   ├── useConstructs.ts      # loads the construct list
│   │   │   │   └── construct.api.ts      # this feature's API calls
│   │   │   └── chat/                     # stretch (card 30)
│   │   │       ├── ChatPanel.tsx
│   │   │       └── chat.api.ts
│   │   ├── components/                   # generic UI, no feature logic
│   │   │   ├── layout/
│   │   │   │   └── AppLayout.tsx         # header, nav, content (card 12)
│   │   │   ├── Spinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── lib/
│   │   │   └── api.ts                    # the only file that calls fetch (card 11)
│   │   ├── styles/
│   │   │   ├── theme.css                 # colors + fonts as CSS variables (card 12)
│   │   │   └── global.css
│   │   └── main.tsx                      # entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                               # Express + TypeScript
│   ├── src/
│   │   ├── app.ts                        # builds + exports the app, no listen (card 4)
│   │   ├── server.ts                     # local only: app.listen (card 4)
│   │   ├── config/
│   │   │   └── env.ts                    # the only file that reads process.env
│   │   ├── db/
│   │   │   ├── mongo.ts                  # one cached connection (card 7)
│   │   │   └── neo4j.ts                  # backlog (card 37)
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts            # card 15
│   │   │   ├── requireRole.ts            # card 19
│   │   │   ├── notFound.ts               # JSON 404 (card 4)
│   │   │   └── errorHandler.ts           # JSON 500, no stack trace (card 4)
│   │   ├── modules/                      # one folder per feature
│   │   │   ├── health/
│   │   │   │   └── health.routes.ts      # GET /api/health (card 4)
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts        # register, login, logout, me (14, 15)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── users/
│   │   │   │   └── user.model.ts         # card 14
│   │   │   ├── constructs/
│   │   │   │   ├── construct.model.ts    # schema + validation (card 8)
│   │   │   │   ├── construct.routes.ts   # cards 10, 23–25
│   │   │   │   ├── construct.controller.ts
│   │   │   │   └── construct.service.ts  # queries + clearance filter (card 20)
│   │   │   └── chat/                     # stretch (cards 29, 33)
│   │   │       ├── chat.routes.ts
│   │   │       ├── chat.service.ts
│   │   │       └── chat.prompt.ts        # the one prompt template (card 33)
│   │   ├── scripts/
│   │   │   └── seed.ts                   # npm run seed (cards 9, 19)
│   │   └── types/
│   │       └── express.d.ts              # adds req.user (set by requireAuth)
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                               # imported by client and server
│   ├── src/
│   │   ├── construct.ts                  # Construct type + status list (card 8)
│   │   ├── user.ts                       # PublicUser type (never the password hash)
│   │   ├── permissions.ts                # roles, clearance, permissions (13, 19)
│   │   └── index.ts                      # re-exports the files above
│   ├── tsconfig.json
│   └── package.json                      # "name": "@aci/shared"
│
├── netlify/
│   └── functions/
│       └── api.ts                        # wraps server/src/app.ts (card 6)
│
├── docs/
│   ├── folder-structure.md               # this file
│   ├── decisions.md                      # research card notes
│   ├── api.http                          # saved API requests (card 10)
│   ├── testing.md                        # manual test checks (cards 21, 27)
│   └── images/                           # screenshots for the README
│
├── .github/
│   └── pull_request_template.md          # Jira key + Definition of Done
├── docker-compose.yml                    # local MongoDB, Neo4j later (card 5)
├── netlify.toml                          # build, functions, dev, redirects (card 6)
├── package.json                          # workspaces + root scripts
├── package-lock.json                     # one lockfile for the whole repo
├── tsconfig.base.json                    # settings every workspace extends
├── .env                                  # real local values, never committed
├── .env.example                          # every variable, with placeholders
├── .gitignore
├── .nvmrc                                # one Node version everywhere
└── README.md
```

## Key decisions

| Decision | Why |
| --- | --- |
| **npm workspaces monorepo** | One `npm install` and one lockfile set up everything, and the three packages import each other without publishing anything. Netlify builds it all from the repo root. |
| **Group by feature** | Everything for one feature sits together. Dev A working in `auth/` and Dev B in `constructs/` rarely touch the same files, so there are fewer merge conflicts. |
| **Routes → controller → service → model** | Every database query is written once, in a service. The clearance filter (card 20) is then reused by the list, detail, edit, delete and chat routes. |
| **A `shared/` package** | The Construct type (card 8) and the permission table (card 19) exist exactly once. The server enforces the table, and the client can hide buttons with the same table (card 26). |
| **Thin Netlify wrapper** | `netlify/functions/api.ts` only adapts `server/src/app.ts`, so the API also runs without Netlify. |
| **One `.env` at the root** | `netlify dev` loads it for the API. The client needs no environment variables at all. |

> **Note:** Many Express tutorials group by file type instead (`controllers/`, `models/`, `routes/`). That works too, but each feature ends up spread across four folders.

## Where does it go?

| I'm adding… | Put it in | Example |
| --- | --- | --- |
| A page | `client/src/pages/`, plus a route in `app/router.tsx` | `DashboardPage.tsx` |
| UI or logic for one feature | `client/src/features/<feature>/` | `features/constructs/ConstructForm.tsx` |
| A component several features use | `client/src/components/` | `Spinner.tsx` |
| A call to the API | The feature's `.api.ts` file, built on `lib/api.ts` | `construct.api.ts` |
| App-wide colors and fonts | `client/src/styles/theme.css` | `--color-accent` |
| Styles for one component | A CSS Module next to the component | `ConstructForm.module.css` |
| An API endpoint | The module's routes, controller and service | `modules/constructs/construct.routes.ts` |
| A database query | The module's service | `construct.service.ts` |
| A Mongoose schema | The module's model | `construct.model.ts` |
| Middleware many routes use | `server/src/middleware/` | `requireRole.ts` |
| A script you run by hand | `server/src/scripts/`, plus an npm script | `seed.ts` → `npm run seed` |
| A type or rule both sides use | `shared/src/` | `permissions.ts` |
| An environment variable | `.env`, `.env.example`, `config/env.ts`, and Netlify's environment variables | `JWT_SECRET` |
| A whole new feature | One folder on each side | `features/graph/` + `modules/graph/` |
| Research notes | `docs/decisions.md` | Card 2's API decision |
| Manual test results | `docs/testing.md` | Card 21's access checks |
| Saved API requests | `docs/api.http` | `GET /api/constructs` |
| Screenshots | `docs/images/` | The theme screenshot (card 12) |

## Client

Paths are inside `client/src/` unless noted.

| Folder | What goes in it | Rule of thumb |
| --- | --- | --- |
| `app/` | `App.tsx`, the router, context providers | Set up once; rarely changes |
| `pages/` | One component per route | Thin: choose the layout, drop in feature components |
| `features/` | Components, hooks and API calls for one feature | Most of your code lives here |
| `components/` | Generic UI: layout, spinner, error message | Knows nothing about constructs or users |
| `lib/` | Plain helpers, like the `api.ts` fetch wrapper | No React components |
| `styles/` | `theme.css` (CSS variables) and `global.css` | Colors and fonts are defined once, here |
| `assets/` | Images and fonts you import in code | Vite adds a content hash to their file names |
| `client/public/` | Files served as-is, like the favicon | Vite copies them without changes |

Imports only point one way:

```text
pages/  ──►  features/  ──►  components/  +  lib/
```

`components/` and `lib/` never import from `features/` or `pages/`, which keeps them reusable anywhere.

A thin page looks like this:

```tsx
// client/src/pages/DashboardPage.tsx
import { AppLayout } from '../components/layout/AppLayout';
import { ConstructList } from '../features/constructs/ConstructList';

export function DashboardPage() {
  return (
    <AppLayout title="Construct Archive">
      <ConstructList />
    </AppLayout>
  );
}
```

> **Tip:** `lib/api.ts` is the only file that calls `fetch`, and it only uses relative URLs (`/api/...`). Each feature's `.api.ts` file lists that feature's endpoints on top of it, and the same code works under `netlify dev`, on Deploy Previews and in production.

## Server

Paths are inside `server/src/`.

| Path | What goes in it |
| --- | --- |
| `app.ts` | Creates the app, adds middleware, mounts each module under `/api`, and exports `app` |
| `server.ts` | Local-only entry point: `app.listen(PORT)` |
| `config/env.ts` | Reads `process.env` once and stops with a clear error if a required variable is missing |
| `db/` | Database connections, opened once and reused between function calls |
| `middleware/` | Code that runs before handlers: login check, role check, 404, error handler |
| `modules/` | One folder per feature |
| `scripts/` | Scripts you run by hand, like the seed |
| `types/` | Type additions; `express.d.ts` tells TypeScript that `req.user` exists |

Every request passes through four layers:

```text
GET /api/constructs/:id
        │
        ▼
construct.routes.ts        URL + middleware (requireAuth)
        │
        ▼
construct.controller.ts    reads req, sends res, chooses the status code
        │
        ▼
construct.service.ts       runs the query, with the clearance filter
        │
        ▼
construct.model.ts         schema + validation  ──►  MongoDB
```

Only routes and controllers know about HTTP. Services and models never touch `req` or `res`, so one service function can serve the list, detail, edit, delete and chat routes. A tiny module like `health/` only needs a routes file.

```ts
// construct.routes.ts: URL + middleware
router.get('/:id', requireAuth, getConstruct);

// construct.controller.ts: HTTP in, HTTP out
export async function getConstruct(req: Request, res: Response) {
  const clearance = clearanceFor(req.user!.role); // from @aci/shared
  const construct = await findVisibleById(req.params.id, clearance);
  if (!construct) {
    res.status(404).json({ error: 'Construct not found' });
    return;
  }
  res.json(construct);
}

// construct.service.ts: the query, written once
export function findVisibleById(id: string, clearance: number) {
  return Construct.findOne({ _id: id, clearanceLevel: { $lte: clearance } });
}
```

> **Note:** Express 5, which `npm install express` installs, passes errors thrown in async handlers to `errorHandler.ts` on its own. That's also where a malformed id's `CastError` becomes the 400 from card 10.

## Shared package

`shared/` holds code that the client and the server both import as `@aci/shared`.

| Put here | Never put here |
| --- | --- |
| Types: `Construct`, `PublicUser`, `Role` | Mongoose, Express, bcrypt or any other server package |
| Fixed lists: roles, construct statuses | Anything that reads `process.env` |
| The permission table and helpers like `clearanceFor()` | Secrets of any kind |
| Small pure functions both sides need | React components |

> **Warning:** Anything in `shared/` can end up in the browser bundle. If a visitor shouldn't be able to read it, it doesn't belong here.

Its `package.json` points straight at the TypeScript source, so there's no build step: Vite, Netlify's esbuild bundler and TypeScript runners like tsx all read `.ts` files directly.

```json
{
  "name": "@aci/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.ts",
  "types": "./src/index.ts"
}
```

To use it, add it to the dependencies in `client/package.json` and `server/package.json`, then run `npm install` at the root. npm uses `"*"` here; the `workspace:*` syntax in some tutorials is for pnpm and Yarn.

```json
"dependencies": {
  "@aci/shared": "*"
}
```

Import types with `import type`, which the Vite template's `verbatimModuleSyntax` setting requires:

```ts
import type { Construct } from '@aci/shared';
import { clearanceFor } from '@aci/shared';
```

Write fixed lists as `as const` arrays with union types, not `enum`. Recent Vite templates turn on `erasableSyntaxOnly`, which rejects enums, and the client type-checks `shared/` too.

```ts
// shared/src/permissions.ts
export const ROLES = ['analyst', 'netrunner', 'executive'] as const;
export type Role = (typeof ROLES)[number];

export const CLEARANCE: Record<Role, number> = {
  analyst: 1,
  netrunner: 2,
  executive: 3,
};

export function clearanceFor(role: Role): number {
  return CLEARANCE[role];
}
```

Card 13's table of who may view, create, edit and delete goes in this same file.

## Netlify and environment variables

On the live site, every request takes one of two paths:

```text
Browser
 ├─ /api/*            ─►  /.netlify/functions/api/:splat
 │                         └─►  netlify/functions/api.ts
 │                               └─►  server/src/app.ts  ─►  MongoDB Atlas
 └─ everything else   ─►  client/dist (unknown paths get index.html)
```

Locally, `netlify dev` does the same on http://localhost:8888. It starts Vite on port 5173 behind the scenes, runs the function, applies the same redirects and loads the root `.env`.

The function file only adapts the Express app:

```ts
// netlify/functions/api.ts
import serverless from 'serverless-http';
import { app } from '../../server/src/app';

export const handler = serverless(app);
```

`app.ts` mounts every router under `/api` (for example `app.use('/api/constructs', constructRoutes)`), which matches the `/api/*` redirect. Netlify's Express guide uses the same pattern.

| Where | What it holds | Committed? |
| --- | --- | --- |
| `.env` (root) | Real values for local development | Never |
| `.env.example` (root) | Every variable name, with placeholder values | Yes |
| Netlify environment variables | Live values: the Atlas `MONGO_URI`, `JWT_SECRET`, the AI key | Kept by Netlify |
| `server/src/config/env.ts` | The one place the code reads `process.env` | Yes |

```bash
# .env.example: copy to .env and fill in real values. Never commit .env.
PORT=3001
MONGO_URI=mongodb://localhost:27017/aci
JWT_SECRET=replace-with-a-long-random-string

# Test-account passwords for the seed script (card 19)
SEED_ANALYST_PASSWORD=
SEED_NETRUNNER_PASSWORD=
SEED_EXECUTIVE_PASSWORD=

# Stretch: AI construct chat
AI_API_KEY=
```

> **Warning:** Never give a secret a `VITE_` prefix. Vite copies `VITE_` variables into the browser bundle, where anyone can read them. The client needs no environment variables, because it calls relative `/api` URLs.

> **Note:** `npm run dev -w server` runs from inside `server/`, so it won't find the root `.env` on its own. Add Node's `--env-file=../.env` flag to the server's `dev` script so the variables are set before any import runs.

## Root config files

### `package.json`

```json
{
  "name": "arasaka-construct-interface",
  "private": true,
  "workspaces": ["client", "server", "shared"],
  "scripts": {
    "dev": "netlify dev",
    "build": "npm run build -w client",
    "seed": "npm run seed -w server",
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present"
  }
}
```

Packages that `netlify/functions/api.ts` imports directly, like `serverless-http`, are installed at the root (`npm install serverless-http`), because that file lives at the root.

### `netlify.toml`

```toml
[build]
  command = "npm run build -w client"
  publish = "client/dist"

[functions]
  directory = "netlify/functions"
  external_node_modules = ["express"]
  node_bundler = "esbuild"

[dev]
  framework = "#custom"
  command = "npm run dev -w client"
  targetPort = 5173
  port = 8888

# /api/* → the Express function (card 6)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

# Everything else → the React app, so deep links like /constructs/abc work
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- `[functions]` matches Netlify's Express guide. If a package fails to load in the deployed function, add it to `external_node_modules` too.
- `framework = "#custom"` tells Netlify Dev to run your `command` and connect to `targetPort` instead of guessing the framework.
- Keep the `/api/*` redirect above the catch-all, because Netlify uses the first rule that matches.

### `tsconfig.base.json`

Holds the compiler settings every workspace shares, such as `"strict": true`. Each workspace's config starts with `"extends": "../tsconfig.base.json"` (in the client, that's `tsconfig.app.json`) and adds its own settings on top.

### `.gitignore`

```gitignore
node_modules/
dist/
.env
.netlify/
*.log
.DS_Store
```

### `.nvmrc`

One line with the Node major version you both run, for example `24`. Netlify reads the same file, so the live build uses that version too.

### `.github/pull_request_template.md`

GitHub fills every new pull request with this text:

```markdown
## ACI-## Card title

**What changed**
-

**How to test**
- Deploy Preview:
- Steps:

**Definition of Done**
- [ ] PR title starts with the Jira key (ACI-##)
- [ ] The card's acceptance criteria are met
- [ ] My teammate tested it on the Deploy Preview
- [ ] No `.env` file or secrets committed
- [ ] Actual time added as a comment on the card
```

## Everyday commands

Run these from the repo root.

| Task | Command |
| --- | --- |
| Install everything | `npm install` |
| Start local MongoDB | `docker compose up -d mongo` |
| Stop local MongoDB (data is kept) | `docker compose down` |
| Run the whole app | `npm run dev`, then open http://localhost:8888 |
| Run only the API | `npm run dev -w server` |
| Run only the client | `npm run dev -w client` (API calls fail without `netlify dev`) |
| Seed the database | `npm run seed` |
| Build the client | `npm run build` |
| Add a package to one workspace | `npm install mongoose -w server` |
| Add a dev-only package | `npm install -D @types/express -w server` |
| Add a package the function file imports | `npm install serverless-http` (no `-w`) |

One-time setup on each laptop:

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify login`, then `netlify link` in the repo root to connect it to your Netlify site.
3. Copy `.env.example` to `.env` and fill in the values.

## Naming conventions

| What | Convention | Example |
| --- | --- | --- |
| Folders | Lowercase; plural when they hold a collection | `features/constructs/`, `modules/auth/` |
| React components | PascalCase, one component per file | `ConstructForm.tsx` |
| Pages | PascalCase ending in `Page` | `DashboardPage.tsx` |
| Hooks | `use` + PascalCase | `useConstructs.ts` |
| Server files | `<name>.<role>.ts`, singular name | `construct.service.ts` |
| Client API files | `<name>.api.ts`, singular name | `construct.api.ts` |
| Component styles | CSS Module named after the component | `ConstructForm.module.css` |
| Tests (if you add them) | Next to the file, ending in `.test.ts` | `construct.service.test.ts` |
| Branches | `ACI-<n>-short-description` | `ACI-11-dashboard-list` |
| Commits | `ACI-<n> type(scope): summary` | `ACI-11 feat(client): fetch and render the construct list` |

The `<name>.<role>.ts` pattern means a search for "construct" finds every file for that feature.

## Things to avoid

- **A catch-all `utils/` or `helpers/` folder.** Name a helper for what it does and keep it next to the code that uses it. Move it to `lib/` only when several features need it.
- **`index.ts` files that re-export a whole folder.** They cause circular imports and slow down Vite's dev server. The one exception is `shared/src/index.ts`, the package's entry point.
- **Database queries in routes or controllers.** Queries live in services, so the clearance filter can't be skipped by accident.
- **Reading `process.env` anywhere except `server/src/config/env.ts`.**
- **Server-only code in `shared/`, or secrets in `VITE_` variables.** Both end up in the browser.
- **Deep nesting.** If a path is more than three folders deep inside `src/`, flatten it.
- **Committing generated or secret files:** `node_modules/`, `dist/`, `.netlify/`, `.env`.

## Switching an existing repo to this layout

If card 1 already set up `client/` and `server/` as separate npm projects:

1. Add the root `package.json` from [Root config files](#root-config-files).
2. Create `shared/` with its `package.json`, a `tsconfig.json`, and `src/index.ts` (start it with `export {};` until it has real exports).
3. Add `"@aci/shared": "*"` to the dependencies in `client/package.json` and `server/package.json`.
4. Delete `client/package-lock.json`, `server/package-lock.json`, `client/node_modules/` and `server/node_modules/`.
5. Run `npm install` at the root. You'll end up with one `package-lock.json` and one `node_modules/`.
6. Put `netlify.toml` at the root. In Netlify's build settings, leave **Base directory** and **Package directory** empty so Netlify reads it; its settings override the ones in the UI.
7. Check that `npm run dev` still works, then commit, for example `ACI-1 chore: switch to npm workspaces`.

## References

- [Express on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/express/): the function file, the `/api` redirect and the `[functions]` settings
- [Local development with Netlify Dev](https://docs.netlify.com/api-and-cli-guides/cli-guides/local-development): the `[dev]` block and `framework = "#custom"`
- The sprint plan: the cards referenced by number throughout this file
