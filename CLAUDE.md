# NBA "Stats Allowed" Visual Tool — Project Context & Design Decisions

> Handoff doc. This project is being built fresh in this folder. All design decisions
> below were settled in a prior planning session (against the SportsDataIO `fantasy-data`
> repo, so the OpponentSeason SQL aggregation could be studied). Nothing here needs
> re-deriving — it's decided. Owner is a developer AT SportsDataIO with API access.

## What this is

A single-page web app that visualizes NBA **OpponentGame** stats — i.e. "stats allowed."
Example use case: *"3-pointers allowed by each team over their last X games,"* charted as a
sorted bar chart comparing all 30 teams. User picks **one stat** and a **number of games (X)**;
the chart re-renders.

## The core data insight (this is the whole idea)

There is no `OpponentGame` scope/record in SportsDataIO's data model. Unlike season-level
opponent aggregation (which SUMS many games), **OpponentGame requires no aggregation — it's
just a relabeling.** A team-game stat row for Team A vs Opponent B *is* B's OpponentGame row
for that game. You produce the OpponentGame view by keying on `OpponentID` instead of `TeamID`.

- **TeamGame** = a team's own production in a game.
- **OpponentGame** for team T = what T's opponents did TO T (T's "allowed"/defensive line).
  Obtained from the rows where `OpponentID = T`.

## Architecture

- **API-powered, no database.** (The tool has no DB connection.)
- **Data source:** SportsDataIO `TeamGameStatsBySeason` endpoint.
  Route: `TeamGameStatsBySeason/{season}/{teamid}/{numberofgames}`
    - `{season}` — e.g. `2026`. Season TYPE is encoded in this string (e.g. `2026`, `2026POST`,
      `2026PRE`, `2026STAR`). Pin to regular season.
    - `{teamid}` — numeric team id (1–30-ish). Loop all 30.
    - `{numberofgames}` — use `all` for a full season of game logs.
  Requires an API key as `?key=...`. **The key stays OFFLINE — it lives only in the local
  build job, never in the repo, the bundle, or the published JSON.**
- **Storage = a single static JSON file**, produced by a **one-off local job**:
  30 game-log calls (one per team) + 1 Teams-endpoint call (for colors), joined on `TeamID`.
- **Hosting:** GitHub Pages (a plain static site).
- **App:** single-page, **no routing.** Controls: a **stat dropdown** + a **number-of-games
  picker** + the chart. That's the entire v1 UI.

### v1 scope
Uses **last season's completed data only** (immutable → a static JSON is sufficient; no
freshness concern). Live/current-season support is deferred and is a data-SOURCE swap only
(local job → serverless proxy or scheduled job), NOT a rewrite, because the data shape stays
identical. Does not need to work for next season yet.

## The stored JSON (design decided; exact top-level shape TBD — see below)

Per team, TWO date-sorted lists: `teamGame` (82 records) and `opponentGame` (82 records).
Records are **TRIMMED to only the fields the chart uses** — not the full API payload.

- **Every record carries:** `date`, `GameID`, `TeamID`, `TeamName`.
  (On OpponentGame records these identify the team the list belongs to — whose "allowed"
  numbers they are — while the stat values are what the opponent did to them.)
- **TeamGame stat fields (9):** `points`, `threePointersMade`, `threePointersAttempted`,
  `turnovers`, `stocks`, `personalFouls`, `freeThrowsAttempted`, `offensiveRebounds`, `assists`.
- **OpponentGame stat fields (5 — the "Allowed" stats only):** `points`, `threePointersMade`,
  `threePointersAttempted`, `freeThrowsAttempted`, `offensiveRebounds`. (No `stocks` — not an
  Allowed stat.)
- **`stocks` is PRECOMPUTED** = Steals + BlockedShots, stored as one field (TeamGame only).
- **Team color** stored ONCE at the team level (next to `TeamName`), not per row.
- Sort each list by `date`. NBA teams never play twice in one day, so date alone is a total
  ordering — "last X" is a simple slice, no GameID tiebreaker needed.

### The 14 selectable stats (all counting stats → sum cleanly over last-X; no % recompute issues)
| Stat | API field | View (list) |
|---|---|---|
| Points | `Points` | teamGame |
| Points Allowed | `Points` | opponentGame |
| 3PM | `ThreePointersMade` | teamGame |
| 3PA | `ThreePointersAttempted` | teamGame |
| 3PM Allowed | `ThreePointersMade` | opponentGame |
| 3PA Allowed | `ThreePointersAttempted` | opponentGame |
| TO | `Turnovers` | teamGame |
| Stocks | `Steals` + `BlockedShots` (precomputed) | teamGame |
| Fouls | `PersonalFouls` | teamGame |
| FTA | `FreeThrowsAttempted` | teamGame |
| FTA Against | `FreeThrowsAttempted` | opponentGame |
| OREB | `OffensiveRebounds` | teamGame |
| OREB Allowed | `OffensiveRebounds` | opponentGame |
| Assists | `Assists` | teamGame |

"Allowed/Against" = the same field read from the opponentGame view. The stat dropdown must map
each entry to **(which list, which field)** so the transform routes to the right data.

## Verified facts about the API payload (confirmed from a real response — don't re-check)

- Completed-game filter is **`IsGameOver` (true), not `IsClosed`** (IsClosed was false even on
  finished games).
- **`PlusMinus` is player-summed (~5x the actual game margin)**, not the margin. (Not in the
  stat list, just don't be fooled by it.)
- `Opponent` is an **abbreviation only** (e.g. "TOR"); the full team name is in `Name` (which
  describes the STAT OWNER, not the opponent). TeamID→name mapping falls out of the 30 pulls.
- These advanced fields come back **null at team-game scope**: `PlayerEfficiencyRating`,
  `AssistsPercentage`, `StealsPercentage`, `BlocksPercentage`, `TurnOversPercentage`,
  `UsageRatePercentage`, `OffensiveReboundsPercentage`, `DefensiveReboundsPercentage`,
  `TotalReboundsPercentage`. None of the 14 chosen stats touch these.
- `Possessions` IS populated (unused in v1, but available for pace-adjustment later).
- **OREB Allowed ≠ DefensiveRebounds.** OREB Allowed = the opponent's OffensiveRebounds. They
  are complementary (both end the same defensive possession) but NOT equal.
- Records come back newest-first; still normalize to an explicit date sort in the job.

## Team colors

- Pull from the **SDIO Teams endpoint** (one call, returns all 30 teams).
- Fields: `PrimaryColor`, `SecondaryColor`, `TertiaryColor`, `QuaternaryColor` — hex strings
  **WITHOUT a leading `#`** (e.g. `"CE1141"`). Prepend `#` when using in CSS/fill.
- Store once per team in the JSON; join to game data on `TeamID`.
- **Contrast caveat:** some primaries are near-black/white and can vanish against the chart
  background. Eyeball the 30 and keep a fallback (or use secondary for problem teams).

## Recharts BarChart — how it wants the data

- `data` prop = a **flat array of one object per bar.** For this tool: 30 objects, one per team.
  Shape: `[{ team, value, fill }, ...]`.
- `<Bar dataKey="value">`, `<YAxis type="category" dataKey="team">`, `<XAxis type="number">`.
- **Use `layout="vertical"`** (Recharts naming quirk: `vertical` layout = HORIZONTAL bars).
  Far more readable for 30 team labels than the default (which crowds labels on the X axis).
  Bump the **left margin** (or category-axis `width`) so team names don't clip.
- **Per-bar color needs a `<Cell>` per data point** inside `<Bar>` (a single `<Bar>` is
  otherwise uniform-colored):
  ```jsx
  <Bar dataKey="value">
    {data.map(d => <Cell key={d.team} fill={d.fill} />)}
  </Bar>
  ```
- **The `value` KEY stays constant** across all stats — only the number swaps. Selecting a
  different stat just re-runs the transform and hands Recharts a fresh array; chart config
  never changes.

## The render-time transform (this is the "massaging")

Stored per-game JSON is NOT the chart's shape. Rebuild the chart array on every change of stat
or games-count (useMemo keyed on `[stat, numGames]`). Per team:
1. Pick the list — `teamGame` vs `opponentGame` — per the selected stat's mapping.
2. Slice the last X rows (lists are already date-sorted).
3. Sum the selected field → one number.
4. Emit `{ team, value, fill }` (fill from the team color map).
Then sort the 30 objects (usually descending) and hand to `<BarChart>`.

Two clearly separated layers:
- **Stored JSON** → optimized for slice-last-X-and-sum (per-team date-sorted per-game rows).
- **Chart array** → 30 flat objects, built at render, thrown away and rebuilt on each change.

## Tech
- **React + Recharts.** TypeScript is a nice-to-have, NOT required.
- Almost certainly **Vite** (Create React App is deprecated). **Set Vite `base` to
  `/<repo-name>/`** or the GitHub Pages build 404s its own JS/CSS (blank page). Since there's no
  routing, relative fetch paths for the JSON are fine once `base` is set.
- Averages are NOT being built. Possibly show the average in a hover/tooltip only
  (`total ÷ X`, computed inline). This is primarily a VISUAL tool.
- Note: for v1 (all teams played a full 82), total vs. average give the SAME ranking (uniform
  ÷X scale). Average only becomes analytically distinct once live data brings unequal game
  counts.

## Still open (decide when building)
- **Exact top-level JSON shape** (object keyed by TeamID vs. array of teams; team identity at
  team level vs. repeated per row). Deferred pending a look at Recharts — but note the chart
  array is derived regardless, so this is a storage-ergonomics choice, not a Recharts constraint.
- Owner has a **notebook mockup** of the layout.

## Useful skill
When building the chart, consider invoking the **`dataviz` skill** (`/dataviz`) — it covers
chart color systems, accessible palettes, axis/legend/tooltip conventions, and light/dark
theming. Relevant here given the per-team color requirement and contrast caveat above.
