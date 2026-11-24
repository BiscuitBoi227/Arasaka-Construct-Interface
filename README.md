# Arasaka Construct Interface

A Cyberpunk 2077–themed web app for viewing and managing Soulkiller personality constructs. Built for PRO150 by a team of two.

**Stack:** Vite + React + TypeScript (client) · Express + TypeScript (API) · MongoDB · Netlify

## Prerequisites

- [Node.js](https://nodejs.org/) 22.12 or newer (24 LTS recommended)
- Git

Needed to run the local database and full app, not the client alone:

- Docker Desktop, for the local MongoDB
- Netlify CLI (`npm install -g netlify-cli`), to run the client and API together

## Demo Site

https://arasaka-construct-interface.netlify.app/

## Getting started

```bash
git clone https://github.com/BiscuitBoi227/Arasaka-Construct-Interface.git
cd Arasaka-Construct-Interface
npm install
npm run dev -w client
```

Then open http://localhost:5173.

The client currently opens to a dashboard skeleton with local preview records. Select a construct to see its details at a readable URL such as `/constructs/johnny-silverhand`.
Visit an unknown path, such as `/missing`, to see the themed 404 page. Edit and Delete are visible placeholders until those features are connected.

Always run `npm install` from the repo root, not inside `client/` or `server/`. One install sets up all three workspaces: `client`, `server` and `shared`.

## Local MongoDB

From the repo root, run `docker compose up -d mongo`. Compose creates the `mongo_data` named volume if it does not already exist and mounts it at `/data/db`. The database is
available to local tools at `localhost:27017`, matching the `MONGO_URI` below.

Run `docker compose down` to stop MongoDB. The named volume and its data remain in place for the next `docker compose up -d mongo`. Avoid `docker compose down -v` unless you
intend to delete the local database.

## Sample data

`npm run seed` fills the database with 10 sample constructs covering clearance levels 1–3 and all four statuses. The records live in
`server/src/scripts/seedConstructs.ts`. Run it again whenever you want a fresh set: it removes the old copies of the seeds (matched by `slug`)
before inserting new ones, so it never creates duplicates. Constructs you created in the app are left alone.

**Local database.** Start MongoDB, then seed it. The script reads `MONGO_URI` from the root `.env`:

```bash
docker compose up -d mongo
npm run seed
```

**MongoDB Atlas.** Put the Atlas connection string in front of the command for that one run. A `MONGO_URI` set this way wins over the one in
`.env`. Include the database name (`/aci`) in the string, or MongoDB writes to a database called `test`. Your IP address must be on the
cluster's Network Access list.

```bash
# macOS, Linux, Git Bash
MONGO_URI='mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/aci' npm run seed
```

```powershell
# Windows PowerShell
$env:MONGO_URI = 'mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/aci'; npm run seed; Remove-Item Env:MONGO_URI
```

The first log line names the host and database it connected to, with the password hidden. A successful run ends with `[seed] Done`.

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

| Command                           | What it does                                                                                                                                     |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `npm install`                     | Installs everything for all workspaces                                                                                                           |
| `npm run dev -w client`           | Starts the client at http://localhost:5173                                                                                                       |
| `npm run dev -w server`           | Starts the API on the `PORT` in `.env` (3001 if unset) and restarts it when you save a server file. Check it at http://localhost:3001/api/health |
| `npm run dev`                     | Starts the client and API together at http://localhost:8888 (needs the Netlify CLI and the API)                                                  |
| `npm run seed`                    | Replaces the sample constructs in the database `MONGO_URI` points at (see [Sample data](#sample-data))                                           |
| `npm run build`                   | Builds the client into `client/dist`                                                                                                             |
| `npm run lint`                    | Lints every workspace                                                                                                                            |
| `npm install <package> -w client` | Adds a package to the client (use `-w server` for the API)                                                                                       |

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
