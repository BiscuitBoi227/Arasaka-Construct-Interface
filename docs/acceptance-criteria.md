# Acceptance Criteria and Test Cases

Part of the Design Documents assignment (card ACI-50). Every user story in Sprints 1–3 has its acceptance criteria written as Given / When / Then, and every criterion has at least one test case with steps and an expected result. Cards 21 and 27 run the manual test cases and record the results in `docs/testing.md`; cards 54 and 55 turn the API test cases into automated tests.

- **Covers:** the 10 user stories in Sprints 1–3 (44 criteria, 45 test cases), plus 18 checks for the technical cards the stories depend on
- **Source:** each card's acceptance criteria in Jira and `sprint-plan.md`
- **Updated:** Nov 18, 2026

## How to read this

| Label | Meaning |
| --- | --- |
| `AC-11.2` | Acceptance criterion 2 of card ACI-11 |
| `TC-11-03` | Test case 3 for card ACI-11 |
| **Manual** | Run by hand and recorded in `docs/testing.md` |
| **Automated** | Written as a Vitest + Supertest test that runs with `npm test` |
| **Both** | The UI steps are run by hand; the API part is also automated (card 54 or 55) |
| *(add to ACI-n)* | A criterion the card's description implies but its checklist doesn't list yet; add it to the Jira story |

A criterion is ticked in Jira only when every test case that covers it passes.

## Test setup

### Environments

| Where | Address | Used for |
| --- | --- | --- |
| Local | http://localhost:8888 after `npm run dev` | Day-to-day testing and the database-down checks |
| `dev` branch deploy | The Netlify branch deploy for `dev` | Cards 21 and 27: every check must also pass here |
| Automated | `npm test` from the repo root (in-memory MongoDB) | Cards 54 and 55 |

### Seed data

Card 20 asks us to write down the expected counts before testing. The test cases assume the seed script (card 9) inserts 10 constructs split like this. If the seed changes, update this table first, because every count below comes from it.

| Clearance | Seeded constructs | Seen by |
| --- | --- | --- |
| 1 | 4 | analyst, netrunner, executive |
| 2 | 3 | netrunner, executive |
| 3 | 3 | executive |
| **Total** | **10** | |

So each role's dashboard should list: **analyst 4, netrunner 7, executive 10.**

### Test accounts

The seed script adds one account per role (card 19). Passwords come from `.env` and are never committed.

| Account | Role | Clearance | Password variable |
| --- | --- | --- | --- |
| analyst | analyst | 1 | `SEED_ANALYST_PASSWORD` |
| netrunner | netrunner | 2 | `SEED_NETRUNNER_PASSWORD` |
| executive | executive | 3 | `SEED_EXECUTIVE_PASSWORD` |

### Test ids

| Name | What it is |
| --- | --- |
| `C1`, `C2`, `C3` | The `_id` of one seeded construct at clearance 1, 2 and 3. Copy them from MongoDB Compass, or from `GET /api/constructs` as the executive. |
| `MISSING_ID` | `000000000000000000000000`, a well-formed id that no construct has |
| `BAD_ID` | `not-an-id`, a malformed id |
| `T1`, `T2` | Throwaway constructs you create for the edit and delete tests (TC-23-01 or TC-23-02 makes one). Run `npm run seed` afterwards to reset. |

### Making API calls by hand

**Logged in, from the browser.** Open DevTools on the app's tab and run this in the Console. The auth cookie goes with the request.

```js
// GET
const r = await fetch('/api/constructs/PASTE_ID');
console.log(r.status, await r.json());

// POST or PUT
const w = await fetch('/api/constructs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'TC API', bio: 'Created by a test.', clearanceLevel: 1 }),
});
console.log(w.status, await w.json());
// For a 204 response (delete), log only w.status.
```

**Logged out, or as a chosen role, from a terminal:**

```bash
# Logged out
curl -i http://localhost:8888/api/constructs

# As a role: log in once, then reuse the cookie
curl -c cookies.txt -H "Content-Type: application/json" \
  -d '{"username":"<username>","password":"<password>"}' \
  http://localhost:8888/api/auth/login
curl -i -b cookies.txt http://localhost:8888/api/constructs
```

On Windows PowerShell, type `curl.exe` instead of `curl`. The saved requests in `docs/api.http` (card 10) also work with VS Code's REST Client extension, which keeps the login cookie between requests.

---

## Sprint 1 · Boot the Archive

### ACI-11 · Show every construct in a dashboard list

> As an Arasaka analyst, I want to see every construct in a dashboard list, so that I can scan the archive quickly.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-11.1 | the database holds the seeded constructs | I open the dashboard (`/`) | every construct I'm cleared to see is listed (all 10 before login exists, and all 10 for the executive after Sprint 2) |
| AC-11.2 | the dashboard has loaded | I look at any construct in the list | it shows name, alias, affiliation, status, integrity % and clearance level |
| AC-11.3 | the list request is still in flight | I'm waiting on the dashboard | a loading indicator shows |
| AC-11.4 | the API or the database is down | I open the dashboard | a friendly message shows instead of a blank page or a raw error |
| AC-11.5 | the dashboard has loaded | I click a construct | `/constructs/<its id>` opens |
| AC-11.6 | the card is merged into `dev` | I run `npm run build` from the repo root | the build passes, with a bare `AppLayout` in `client/src/components/layout/AppLayout.tsx` |

#### TC-11-01 · The dashboard lists every construct

**Covers** AC-11.1 · **Type** Manual · **Before** Database seeded; logged in as the executive (in Sprint 1, before login exists, just open the page)

1. Open `/`.
2. Count the constructs listed.

**Expected:** 10 constructs, one for each seeded record, with no duplicates or blank rows.

#### TC-11-02 · Each construct shows the six summary fields

**Covers** AC-11.2 · **Type** Manual

1. Open `/` and find `C2`.
2. In a second tab, open `/api/constructs/<C2>` to see its JSON.

**Expected:** The `C2` entry shows name, alias, affiliation, status, integrity as a percentage and clearance level, each matching the JSON. Every other entry shows the same six fields.

#### TC-11-03 · A loading indicator shows while the list loads

**Covers** AC-11.3 · **Type** Manual

1. In DevTools → Network, set throttling to the slowest preset (for example 3G).
2. Reload `/`.
3. Set throttling back to No throttling.

**Expected:** A loading indicator shows until the list appears, then goes away.

#### TC-11-04 · A friendly message shows when the API can't be reached

**Covers** AC-11.4 · **Type** Manual

1. Open `/` with DevTools → Network open.
2. Right-click the `/api/constructs` request and choose **Block request URL**, then reload.
3. Unblock the URL and reload again.

**Expected:** Step 2 shows a friendly message, with no blank page, raw error text or stack trace, and the page layout still renders. Step 3 shows the list again.

#### TC-11-05 · A friendly message shows when the database is down

**Covers** AC-11.4 · **Type** Manual (local only; card 27 runs it too)

1. Run `docker compose stop mongo`.
2. Reload `/`. Mongoose may wait about 10 seconds before it gives up.
3. Run `docker compose start mongo`, wait a few seconds, and reload.

**Expected:** Step 2 shows the same friendly message as TC-11-04. The API answers with a 5xx JSON error that has no stack trace, and the server keeps running. Step 3 shows the list again without restarting the app.

#### TC-11-06 · Clicking a construct opens its profile

**Covers** AC-11.5 · **Type** Manual

1. Open `/` and click `C1`.
2. Press the browser's Back button.

**Expected:** Step 1 opens `/constructs/<C1>` (a placeholder page until ACI-22, then the full profile). Step 2 returns to the dashboard.

#### TC-11-07 · The client builds with the bare layout

**Covers** AC-11.6 · **Type** Manual (a good first GitHub Actions check)

1. On a clean checkout of `dev`, run `npm ci`, then `npm run build`.

**Expected:** The build exits with code 0 and writes `client/dist/index.html`. `client/src/components/layout/AppLayout.tsx` exists, and the dashboard renders inside it.

---

## Sprint 2 · Login & Access Rules

### ACI-16 · Build the login and registration pages

> As an Arasaka employee, I want to log in with my credentials, so that I can access the construct archive.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-16.1 | I'm on `/login` | I submit a wrong password or an unknown username | the form shows a clear error, I stay on `/login`, and the message doesn't say which part was wrong |
| AC-16.2 | I'm on `/login` with a test account | I submit the correct credentials | the dashboard opens and the header shows my display name and role |
| AC-16.3 | I'm logged in | I click Logout | I land on `/login` and my session is gone |
| AC-16.4 | I'm logged in | I refresh any page | I'm still logged in, because the app calls `GET /api/auth/me` |
| AC-16.5 *(add to ACI-16; from ACI-14)* | I'm on `/register` | I register with a new username | the account is created with the analyst role |
| AC-16.6 *(add to ACI-16; from ACI-14)* | a username is already taken | I try to register with it | the form shows a clear error and no second account is created |

#### TC-16-01 · A wrong password is rejected with a generic error

**Covers** AC-16.1 · **Type** Both (card 54 automates the 401)

1. Open `/login`.
2. Enter the analyst's username and a wrong password, and submit.

**Expected:** I stay on `/login`, and the form shows `Invalid username or password`. Network shows `POST /api/auth/login` → 401, and no auth cookie is set.

#### TC-16-02 · An unknown username gets the same error

**Covers** AC-16.1 · **Type** Manual

1. On `/login`, submit the username `no-such-user-123` with any password.

**Expected:** The same message and the same 401 as TC-16-01, so the form doesn't reveal which usernames exist.

#### TC-16-03 · Logging in opens the dashboard with my name and role

**Covers** AC-16.2 · **Type** Manual

1. Log in as the netrunner.
2. Log out, then repeat with the analyst and the executive.

**Expected:** Each login lands on `/`, and the header shows that account's display name and role.

#### TC-16-04 · Logout ends the session

**Covers** AC-16.3 · **Type** Manual

1. While logged in, click Logout.
2. Visit `/`.
3. Visit `/api/auth/me`.

**Expected:** Step 1 lands on `/login`. Step 2 redirects to `/login`. Step 3 returns 401.

#### TC-16-05 · Refreshing keeps me logged in

**Covers** AC-16.4 · **Type** Manual

1. Log in as the analyst.
2. Refresh `/`.
3. Open `/constructs/<C1>` and refresh.

**Expected:** Each refresh stays on the same page, logged in with the same name and role, with no flash of the login page. Network shows `GET /api/auth/me` → 200.

#### TC-16-06 · Registering creates an analyst account

**Covers** AC-16.5 · **Type** Manual

1. Open `/register`.
2. Enter a new username (for example `tc-user-1118`), a display name and a password, and submit.
3. If the app doesn't log you in, log in with the new account.

**Expected:** Registration succeeds, the header shows the role `analyst`, and the dashboard lists 4 constructs.

#### TC-16-07 · A taken username is refused

**Covers** AC-16.6 · **Type** Manual

1. On `/register`, enter the analyst test account's username with any password, and submit.

**Expected:** The form shows a clear message that the username is taken. Network shows 409. The users collection still has only one user with that username.

### ACI-17 · Lock pages and API routes behind login

> As an Arasaka executive, I want the archive locked behind login, so that outsiders can't see construct data.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-17.1 | I'm not logged in | I call any `/api/constructs` route | I get 401 and no construct data |
| AC-17.2 | I'm not logged in | I open any page except `/login` or `/register` | I'm redirected to `/login` |
| AC-17.3 | I was redirected to `/login` | I log in | the dashboard loads normally |

#### TC-17-01 · A logged-out list request returns 401

**Covers** AC-17.1 · **Type** Both (card 54)

1. Run `curl -i http://localhost:8888/api/constructs`.

**Expected:** 401 with a JSON error, and no construct fields in the body.

#### TC-17-02 · A logged-out detail request returns 401

**Covers** AC-17.1 · **Type** Manual (easy to add to card 54)

1. Run `curl -i http://localhost:8888/api/constructs/<C1>`.

**Expected:** 401, not 200 or 404.

#### TC-17-03 · Logged-out writes return 401 (from Sprint 3)

**Covers** AC-17.1 · **Type** Manual

1. Run each request without a cookie:

```bash
curl -i -X POST   -H "Content-Type: application/json" -d '{}' http://localhost:8888/api/constructs
curl -i -X PUT    -H "Content-Type: application/json" -d '{}' http://localhost:8888/api/constructs/<C1>
curl -i -X DELETE http://localhost:8888/api/constructs/<C1>
```

**Expected:** Each returns 401, because login is checked before role and validation. `C1` still exists.

#### TC-17-04 · Private pages redirect a logged-out visitor

**Covers** AC-17.2 · **Type** Manual

1. Open a private browser window.
2. Visit `/` and `/constructs/<C1>`.
3. Visit `/login` and `/register`.

**Expected:** In step 2, each page redirects to `/login` without showing any construct data first. In step 3, both pages open normally.

#### TC-17-05 · Logging in after the redirect loads the dashboard

**Covers** AC-17.3 · **Type** Manual

1. In the private window from TC-17-04, log in as the executive.

**Expected:** The dashboard loads with all 10 constructs, and the console shows no errors.

### ACI-20 · Only show constructs at or below my clearance

> As an Arasaka analyst, I want to see only constructs at or below my clearance level, so that classified constructs stay restricted.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-20.1 | I'm logged in | the dashboard loads | it lists only constructs at or below my clearance (analyst 1, netrunner 2, executive 3) |
| AC-20.2 | a construct is above my clearance | I request it by id | I get 404, the same as for an id that doesn't exist |
| AC-20.3 | the database is seeded | each test account opens the dashboard | it sees the expected number of constructs |

#### TC-20-01 · Each role's list stops at its clearance

**Covers** AC-20.1, AC-20.3 · **Type** Both (card 54)

1. Log in as each account in turn.
2. Open `/` and `/api/constructs`.

| Account | Constructs listed | Highest clearance shown |
| --- | --- | --- |
| analyst | 4 | 1 |
| netrunner | 7 | 2 |
| executive | 10 | 3 |

**Expected:** The page and the API both match the table, and no construct above the account's clearance appears anywhere in the JSON.

#### TC-20-02 · Fetching a hidden construct by id returns 404

**Covers** AC-20.2 · **Type** Both (card 54)

1. As each account, request the construct shown.

| Account | Request | Expected |
| --- | --- | --- |
| analyst | `GET /api/constructs/<C2>` | 404 |
| analyst | `GET /api/constructs/<C3>` | 404 |
| netrunner | `GET /api/constructs/<C3>` | 404 |
| netrunner | `GET /api/constructs/<C2>` | 200 |
| executive | `GET /api/constructs/<C3>` | 200 |

**Expected:** Every row matches.

#### TC-20-03 · A hidden construct looks the same as a missing one

**Covers** AC-20.2 · **Type** Manual

1. As the analyst, request `/api/constructs/<C3>`.
2. Request `/api/constructs/000000000000000000000000`.

**Expected:** Both return 404 with identical bodies, so the response doesn't reveal that `C3` exists.

---

## Sprint 3 · CRUD & Tests

### ACI-12 · Give the app an Arasaka terminal look

> As an Arasaka employee, I want the interface to look like an internal Arasaka terminal, so that the app feels like part of the game world.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-12.1 | any page of the app | it loads | it uses the shared layout with the app name and nav links |
| AC-12.2 | the client's source code | I look for colors and fonts | they're defined once, as CSS variables in `styles/theme.css` |
| AC-12.3 | any page | I check the body text | its contrast passes WCAG AA |
| AC-12.4 | a laptop-width window or one 375 px wide | I open each page | it works with no sideways scrolling |

#### TC-12-01 · Every page uses the shared layout

**Covers** AC-12.1, AC-22.4 · **Type** Manual

1. Visit `/login`, `/register`, `/`, `/constructs/<C1>`, the create form, the edit form and `/no-such-page`.

**Expected:** Each shows the same header with the app name and nav links, in the theme's colors and fonts.

#### TC-12-02 · Colors and fonts live only in theme.css

**Covers** AC-12.2 · **Type** Manual (code check)

1. From the repo root, run:

```bash
grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|font-family" client/src \
  --include=*.css --include=*.tsx --include=*.ts | grep -v "styles/theme.css"
```

**Expected:** No output, or only matches that aren't colors or fonts (such as an id selector). Every other file uses `var(--…)`.

#### TC-12-03 · Body text passes WCAG AA contrast

**Covers** AC-12.3 · **Type** Manual

1. In Chrome DevTools → Lighthouse, run an Accessibility audit on `/` and on `/constructs/<C1>`.
2. For any text the audit flags, inspect it and read the contrast ratio from the color picker in the Styles pane.

**Expected:** The audit "Background and foreground colors have a sufficient contrast ratio" passes. Body text is at least 4.5:1; only large text (24 px, or 18.66 px bold) may go down to 3:1.

#### TC-12-04 · Pages fit a laptop and a 375 px screen

**Covers** AC-12.4 · **Type** Manual

1. Open each page from TC-12-01 in a window about 1366 px wide.
2. Turn on the DevTools device toolbar, set the width to 375 and open each page again.
3. On each page at 375 px, run `document.documentElement.scrollWidth <= window.innerWidth` in the Console.

**Expected:** Nothing overlaps or is cut off at either width, and step 3 returns `true` on every page.

### ACI-22 · View a construct's full profile

> As an Arasaka analyst, I want to open a construct's full profile, so that I can read its bio, traits, and skills.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-22.1 | I'm cleared to see a construct | I open `/constructs/<id>` | every field shows: name, alias, affiliation, occupation, bio, personality traits, skills, status, integrity %, clearance level and scan date |
| AC-22.2 | an id doesn't exist or is above my clearance | I open its profile URL | the page shows `Construct not found` |
| AC-22.3 | I'm on a profile | I click the back link | I return to the dashboard |
| AC-22.4 | I'm on a profile | it loads | it uses the shared layout and theme (tested by TC-12-01) |

#### TC-22-01 · The profile shows every field

**Covers** AC-22.1 · **Type** Manual

1. As the executive, open `/constructs/<C3>`.
2. In a second tab, open `/api/constructs/<C3>`.

**Expected:** All 11 fields show and match the JSON. Traits and skills show as separate items, and nothing shows as `undefined` or `null`.

#### TC-22-02 · An unknown id shows Construct not found

**Covers** AC-22.2 · **Type** Manual

1. Open `/constructs/000000000000000000000000`.
2. Open `/constructs/not-an-id`.

**Expected:** Both show `Construct not found` inside the normal layout, with the back link. No blank page and no crash in the console. (The API answers 404 and 400 here.)

#### TC-22-03 · A construct above my clearance shows Construct not found

**Covers** AC-22.2 · **Type** Manual

1. As the analyst, open `/constructs/<C3>`.

**Expected:** The same message as TC-22-02, and no field from `C3` appears, even briefly.

#### TC-22-04 · The back link returns to the dashboard

**Covers** AC-22.3 · **Type** Manual

1. From `/`, open `C1`.
2. Click the back link.

**Expected:** I land on `/` with the list loaded.

### ACI-23 · Create a construct through a form

> As an Arasaka netrunner, I want to add a new construct through a form, so that newly captured engrams get recorded in the archive.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-23.1 | I'm a netrunner or executive | I send a valid `POST /api/constructs` | the construct is saved and I get 201 |
| AC-23.2 | I'm an analyst | I send the same request | I get 403 and nothing is saved |
| AC-23.3 | I'm on the create form | I save with missing or invalid fields | an error shows next to each bad field, and nothing is saved |
| AC-23.4 | I'm on the create form | I type skills and traits as comma-separated text | each is saved as a list of separate items |
| AC-23.5 | I'm on the create form | I save a valid construct | I land on the new construct's profile |
| AC-23.6 *(add to ACI-23; from its description)* | I'm logged in | I create a construct | its `createdBy` is my user id |

#### TC-23-01 · A netrunner creates a construct through the form

**Covers** AC-23.1, AC-23.5 · **Type** Manual

1. Log in as the netrunner and open the create form from the dashboard.
2. Enter name `TC Construct`, alias `Echo`, affiliation `Arasaka`, occupation `Netrunner`, bio `Created by TC-23-01.`, status `Active`, integrity `85`, clearance `2`, today's scan date, skills `Breach protocol, Stealth` and traits `Calm, Calculating`.
3. Save.

**Expected:** Network shows `POST /api/constructs` → 201. I land on `/constructs/<new id>`, which shows the values I entered, and the netrunner's dashboard now lists 8 constructs.

#### TC-23-02 · The API saves a valid construct with its creator

**Covers** AC-23.1, AC-23.6 · **Type** Both (card 55)

1. As the netrunner, send `POST /api/constructs` with `{ "name": "TC API", "bio": "Created by TC-23-02.", "clearanceLevel": 1 }`.
2. Request `/api/auth/me`.

**Expected:** Step 1 returns 201 with an `_id`, the fields sent, `createdAt`, and a `createdBy` equal to the netrunner's id from step 2.

#### TC-23-03 · Only netrunners and executives can create

**Covers** AC-23.2 · **Type** Both (card 55)

1. Send the TC-23-02 request as each account.

| Account | Expected |
| --- | --- |
| analyst | 403, and the number of constructs doesn't change |
| netrunner | 201 |
| executive | 201 |

**Expected:** Every row matches.

#### TC-23-04 · Missing required fields are flagged next to each field

**Covers** AC-23.3 · **Type** Both (card 55 checks the 400)

1. As the netrunner, open the create form and save it empty.
2. Send `POST /api/constructs` with the body `{}`.

**Expected:** Step 1 shows an error next to Name, Bio and Clearance level, and nothing is saved. Step 2 returns 400 and names those three fields.

#### TC-23-05 · Invalid values are flagged

**Covers** AC-23.3 · **Type** Both (card 55)

1. On the create form, fill every required field correctly, then try each bad value below, one at a time.

| Field | Bad value | Expected |
| --- | --- | --- |
| Integrity | `101`, then `-1` | Error next to Integrity |
| Clearance level | `0`, then `4` | Error next to Clearance level |
| Status (API only, since the form uses a list) | `"Exploded"` | 400 that names the status field |

**Expected:** Each bad value shows its error next to the field, the API returns 400 naming the field, and nothing is saved.

#### TC-23-06 · Skills and traits accept comma-separated lists

**Covers** AC-23.4 · **Type** Manual

1. Create a construct with skills `Breach protocol, Stealth,  Cyberdeck repair` (note the double space) and traits `Calm`.
2. Open `/api/constructs/<new id>`.

**Expected:** Skills are saved as 3 separate items, `Breach protocol`, `Stealth` and `Cyberdeck repair`, with no extra spaces and no empty items. Traits are saved as 1 item, `Calm`. The profile shows them as separate items.

### ACI-24 · Edit a construct

> As an Arasaka netrunner, I want to edit a construct's details, so that the archive stays accurate as we learn more.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-24.1 | I'm a netrunner or executive on a profile | I click Edit | the form opens filled with the current values |
| AC-24.2 | I'm on the edit form | I change fields and save | the record updates and the profile shows the change |
| AC-24.3 | I'm on the edit form | I save missing or invalid values | errors show the same way as on create, and the record doesn't change |
| AC-24.4 | I send `PUT /api/constructs/:id` | I'm an analyst, or the id is unknown or above my clearance | I get 403 as an analyst, or 404 for an unknown or hidden id |

#### TC-24-01 · Edit opens a pre-filled form

**Covers** AC-24.1 · **Type** Manual · **Before** Create `T1` (TC-23-01 makes one)

1. As the netrunner, open `T1`'s profile and click Edit.

**Expected:** Every field shows `T1`'s current value, and skills and traits appear as comma-separated text.

#### TC-24-02 · Saving updates the record and the profile

**Covers** AC-24.2 · **Type** Both (card 55)

1. On `T1`'s edit form, change status to `Dormant` and integrity to `60`, and save.
2. Refresh the profile.

**Expected:** Network shows `PUT /api/constructs/<T1>` → 200. I'm back on the profile, which shows `Dormant` and `60%`. The values survive the refresh, and `updatedAt` is later than before.

#### TC-24-03 · Edit validates the same way as create

**Covers** AC-24.3 · **Type** Both (card 55)

1. On `T1`'s edit form, clear Name, set integrity to `150`, and save.
2. Send a `PUT /api/constructs/<T1>` that sets only integrity to 150.
3. Reload `T1`'s profile.

**Expected:** Step 1 shows the same errors as TC-23-04 and TC-23-05, next to Name and Integrity. Step 2 returns 400. Step 3 shows `T1` unchanged. If step 2 saves 150, the update is missing `runValidators: true`.

#### TC-24-04 · The edit route checks role and clearance

**Covers** AC-24.4 · **Type** Both (card 55)

1. Send `PUT /api/constructs/<id>` with a small valid change as each account below. Run `npm run seed` afterwards.

| Account | Id | Expected |
| --- | --- | --- |
| analyst | `C1` | 403 |
| netrunner | `C3` | 404 |
| netrunner | `MISSING_ID` | 404 |
| netrunner | `T1` | 200 |
| executive | `C3` | 200 |

**Expected:** Every row matches, and the 403 and 404 rows leave the record unchanged.

### ACI-25 · Delete a construct with confirmation

> As an Arasaka executive, I want to delete a construct after confirming, so that corrupted or obsolete constructs can be purged without accidents.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-25.1 | I'm an executive on a profile | I click Delete | I'm asked to confirm before anything is removed |
| AC-25.2 | I'm an executive | I send `DELETE /api/constructs/:id` | the construct is removed and I get 204 |
| AC-25.3 | I'm an analyst or a netrunner | I send the same request | I get 403 and nothing is removed |
| AC-25.4 | I confirmed a delete | it succeeds | I'm back on the dashboard and the construct is gone from the list |

#### TC-25-01 · Cancelling the confirmation deletes nothing

**Covers** AC-25.1 · **Type** Manual · **Before** Create a throwaway construct, `T2`

1. As the executive, open `T2`'s profile and click Delete.
2. Cancel the confirmation.

**Expected:** A confirmation appears before any request is sent. After Cancel, Network shows no `DELETE` request, I'm still on `T2`'s profile, and `T2` is still on the dashboard.

#### TC-25-02 · Confirming deletes and returns to the dashboard

**Covers** AC-25.2, AC-25.4 · **Type** Both (card 55)

1. On `T2`'s profile, click Delete and confirm.
2. Request `/api/constructs/<T2>`.

**Expected:** Network shows `DELETE /api/constructs/<T2>` → 204. I land on `/`, and `T2` isn't listed. Step 2 returns 404.

#### TC-25-03 · Analysts and netrunners can't delete

**Covers** AC-25.3 · **Type** Both (card 55)

1. Send `DELETE /api/constructs/<C1>` as each account below.

| Account | Expected |
| --- | --- |
| analyst | 403 |
| netrunner | 403 |

**Expected:** Both return 403, and `C1` is still listed for the executive.

### ACI-26 · Show only the actions my role allows

> As an Arasaka analyst, I want to see only the buttons I'm allowed to use, so that the interface doesn't offer actions that fail.

| AC | Given | When | Then |
| --- | --- | --- | --- |
| AC-26.1 | I'm an analyst | I view the dashboard or a profile | I see no Create, Edit or Delete buttons |
| AC-26.2 | I'm a netrunner | I view the dashboard or a profile | I see Create and Edit, but not Delete |
| AC-26.3 | I'm an executive | I view the dashboard or a profile | I see Create, Edit and Delete |
| AC-26.4 | I'm logged in | any page loads | the header shows a badge with my role and clearance |

#### TC-26-01 · Each role sees only its buttons

**Covers** AC-26.1, AC-26.2, AC-26.3 · **Type** Manual

1. Log in as each account and check the dashboard and `/constructs/<C1>`.

| Account | Create | Edit | Delete |
| --- | --- | --- | --- |
| analyst | not shown | not shown | not shown |
| netrunner | shown | shown | not shown |
| executive | shown | shown | shown |

**Expected:** Every row matches. The server still blocks these actions on its own (TC-23-03, TC-24-04, TC-25-03).

#### TC-26-02 · The header shows my role and clearance

**Covers** AC-26.4 · **Type** Manual

1. Log in as each account and look at the header on `/` and on a profile.

| Account | Badge shows |
| --- | --- |
| analyst | analyst, clearance 1 |
| netrunner | netrunner, clearance 2 |
| executive | executive, clearance 3 |

**Expected:** Every row matches on both pages.

---

## Supporting API and platform checks

The stories depend on these technical cards. Their criteria are short API or setup checks, so they're listed in one table.

| ID | Card | Check | Steps | Expected | Type |
| --- | --- | --- | --- | --- | --- |
| TC-04-01 | ACI-4 | The health check answers | `GET /api/health` | 200, and the body includes `"status": "ok"` | Automated (card 54) |
| TC-04-02 | ACI-4 | Unknown API routes return a JSON 404 | `GET /api/no-such-route` | 404 with a JSON body, not an HTML page | Manual |
| TC-04-03 | ACI-4 | Errors don't leak stack traces | Log in, run `docker compose stop mongo`, then `GET /api/constructs` | A 5xx JSON error with no stack trace, file paths or line numbers, and the server keeps running | Manual |
| TC-05-01 | ACI-5 | Local data survives a restart | `docker compose up -d mongo`, `npm run seed`, `docker compose down`, `docker compose up -d mongo`, then count constructs in Compass or `mongosh` | Still 10 constructs | Manual |
| TC-06-01 | ACI-6 | The live site and API answer | Open the Netlify URL, then `<site>/api/health` | The app loads, and health returns 200 | Manual |
| TC-06-02 | ACI-6 | Deep links survive a refresh | On the live site, open `/constructs/<C1>` directly and refresh | The app loads, not Netlify's 404 page | Manual |
| TC-07-01 | ACI-7 | Health reports the database | `GET /api/health` with MongoDB running, then stopped | Reports the database connected, then not connected, and the server log shows a readable error | Manual |
| TC-08-01 | ACI-8 | The model rejects bad values | Model test: validate a construct missing `name`, `bio` or `clearanceLevel`; with integrity 101 or -1; with clearance 0 or 4; with an unknown status | Each fails with a validation error naming the field; a valid construct passes and gets `createdAt` and `updatedAt` when saved | Automated (optional) |
| TC-09-01 | ACI-9 | The seed can be re-run | Run `npm run seed` twice, then count constructs by clearance | 10 constructs (4, 3 and 3), at least 3 statuses, no duplicates | Manual |
| TC-10-01 | ACI-10 | The list is sorted by name | As the executive, `GET /api/constructs` | 10 constructs in A–Z order by name | Manual |
| TC-10-02 | ACI-10 | A missing id returns 404 | `GET /api/constructs/000000000000000000000000` as the executive | 404 | Automated (add to card 54) |
| TC-10-03 | ACI-10 | A malformed id returns 400 | `GET /api/constructs/not-an-id` as the executive | 400, and the server keeps running | Automated (add to card 54) |
| TC-14-01 | ACI-14 | Passwords are stored hashed | Register a user, then open it in Compass | The stored password starts with `$2` (bcrypt) or `$argon2`, never the plain text | Manual |
| TC-14-02 | ACI-14 | No response includes a password or hash | Read the bodies from register, login and `GET /api/auth/me` | None contains the password, its hash or a password field | Automated (add to card 54) |
| TC-15-01 | ACI-15 | The auth cookie is httpOnly | After logging in, check DevTools → Application → Cookies and Local Storage, and run `document.cookie` in the Console | The cookie is HttpOnly (and Secure on the live site), `document.cookie` doesn't show it, and Local Storage holds no token | Manual |
| TC-15-02 | ACI-15 | The current-user route | `GET /api/auth/me` while logged in, then after logging out | 200 with the username, display name and role but no hash; then 401 | Manual |
| TC-19-01 | ACI-19 | `requireRole` blocks the wrong roles | Call the netrunner-only and executive-only test routes as each account | Netrunner route: analyst 403, netrunner 200, executive 200. Executive route: netrunner 403, executive 200 | Automated (card 54) |
| TC-19-02 | ACI-19 | One account per role, no committed passwords | Run `npm run seed` and log in as each account; run `git grep -n "<password>"` for each seed password | All three log in, and `git grep` finds nothing | Manual |

The live-site checks for card 47 (Jira key ACI-49) are the same test cases run on the `dev` branch deploy: the executive's dashboard lists 10 constructs from Atlas, and `MONGO_URI` is set in Netlify, not in the repo.

---

## Coverage summary

| Story | Sprint | Criteria | Test cases | Automated by cards 54 and 55 |
| --- | --- | --- | --- | --- |
| ACI-11 · Dashboard list | 1 | 6 | TC-11-01 to 07 | none (UI only) |
| ACI-16 · Login and registration | 2 | 6 | TC-16-01 to 07 | TC-16-01 |
| ACI-17 · Locked behind login | 2 | 3 | TC-17-01 to 05 | TC-17-01 |
| ACI-20 · Clearance filter | 2 | 3 | TC-20-01 to 03 | TC-20-01, 02 |
| ACI-12 · Terminal look | 3 | 4 | TC-12-01 to 04 | none (UI only) |
| ACI-22 · Full profile | 3 | 4 | TC-22-01 to 04 | none (UI only) |
| ACI-23 · Create | 3 | 6 | TC-23-01 to 06 | TC-23-02 to 05 |
| ACI-24 · Edit | 3 | 4 | TC-24-01 to 04 | TC-24-02 to 04 |
| ACI-25 · Delete | 3 | 4 | TC-25-01 to 03 | TC-25-02, 03 |
| ACI-26 · Role-aware buttons | 3 | 4 | TC-26-01, 02 | none (UI only) |
| **Total** | | **44** | **45** | **13** |

Every criterion is covered by at least one test case. AC-22.4 is covered by TC-12-01.

## What the Final Project needs from this

**At least 6 automated tests** (card 55 aims for 10 or more):

- Card 54: TC-04-01, TC-16-01, TC-17-01, TC-20-01, TC-20-02 and TC-19-01.
- Card 55: TC-23-02, TC-23-03, TC-23-04, TC-23-05, TC-24-02, TC-24-03, TC-24-04, TC-25-02 and TC-25-03.
- Easy extras: TC-10-02, TC-10-03 and TC-14-02.

**At least 8 manual tests**, recorded in `docs/testing.md`:

- Card 21 (Sprint 2) covers invalid login, logged-out requests, clearance filtering, detail access by id and the role checks: TC-16-01, TC-16-03, TC-16-04, TC-16-05, TC-17-04, TC-20-01, TC-20-02 and TC-19-01.
- Card 27 (Sprint 3) re-runs card 21's cases and adds TC-23-01, TC-24-02, TC-25-01, TC-25-02, TC-26-01, TC-22-03 and TC-11-05.
- Nine of those can only be checked by hand (TC-16-03, 16-04, 16-05, 17-04, 22-03, 23-01, 25-01, 26-01 and 11-05), so the manual count doesn't depend on tests that are also automated.

## Recording results

When you run a manual test case, copy it into `docs/testing.md` and add the result, in card 21's format:

| ID | Test | Expected | Actual | Result | Tester | Date |
| --- | --- | --- | --- | --- | --- | --- |
| TC-16-01 | A wrong password is rejected with a generic error | Stay on `/login`, generic error, 401, no cookie | | Pass / Fail | | |

- Log every failure as a Jira Bug with a `P1`–`P4` label. P1 and P2 bugs break a core feature or workflow, or lose or expose data, and block the v1.0 release.
- Run the cases on the `dev` branch deploy as well as locally.

## Adding this to the Jira stories

Each story card in Jira already lists these criteria as checkboxes. To tie them to this document:

1. Under each story's checklist, add one line naming its test cases, for example `Test cases: TC-11-01 to TC-11-07 (docs/acceptance-criteria.md)`.
2. Add the three new criteria as checkboxes: AC-16.5 and AC-16.6 on ACI-16, and AC-23.6 on ACI-23.
3. Tick a criterion only when every test case that covers it passes on the `dev` branch deploy.
