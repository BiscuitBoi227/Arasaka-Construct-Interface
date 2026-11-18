# Arasaka Construct Interface

A Cyberpunk 2077–themed web app for viewing and managing Soulkiller personality constructs. Built for PRO150 by a team of two.

**Stack:** Vite + React + TypeScript (client) · Express + TypeScript (API) · MongoDB · Netlify

## Prerequisites

- [Node.js](https://nodejs.org/) 22.12 or newer (24 LTS recommended)
- Git

Needed later, not to run the client:

- Docker Desktop, for the local MongoDB
- Netlify CLI (`npm install -g netlify-cli`), to run the client and API together

## Getting started

```bash
git clone https://github.com/BiscuitBoi227/Arasaka-Construct-Interface.git
cd Arasaka-Construct-Interface
npm install
npm run dev -w client
```

Then open http://localhost:5173.

Always run `npm install` from the repo root, not inside `client/` or `server/`. One install sets up all three workspaces: `client`, `server` and `shared`.

## Environment variables

The server reads a `.env` file in the repo root; the client doesn't need one. Create it with these keys. It's listed in `.gitignore`, so it never gets committed.

```bash
PORT=3001
MONGO_URI=mongodb://localhost:27017/aci
JWT_SECRET=
SEED_ANALYST_PASSWORD=
SEED_NETRUNNER_PASSWORD=
SEED_EXECUTIVE_PASSWORD=
AI_API_KEY=
```

Generate a value for `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Common commands

Run these from the repo root.

| Command | What it does |
| --- | --- |
| `npm install` | Installs everything for all workspaces |
| `npm run dev -w client` | Starts the client at http://localhost:5173 |
| `npm run dev` | Starts the client and API together at http://localhost:8888 (needs the Netlify CLI and the API) |
| `npm run build` | Builds the client into `client/dist` |
| `npm run lint` | Lints every workspace |
| `npm install <package> -w client` | Adds a package to the client (use `-w server` for the API) |

## Project layout

```text
client/     React app (Vite)
server/     Express API
shared/     Types and rules both sides use, imported as @aci/shared
netlify/    Netlify Function that wraps the API
docs/       Decisions, test notes and the full folder guide
```

See [docs/project-folder-structure.md](docs/project-folder-structure.md) for where everything goes.

## Git workflow

- Branch from `dev` and put the Jira key in the branch name: `ACI-11-dashboard-list`
- Start commit messages with the key: `ACI-11 feat(client): add construct list`
- Open a pull request into `dev`, and have your teammate review it before merging
- Merge `dev` into `main` only for sprint demos