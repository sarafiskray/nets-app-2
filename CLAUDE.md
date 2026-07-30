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
- **App:** single-page, **no routing.** Controls: a **stat rail** (14 pill buttons) + a
  **range rail** (7 preset pills + calendar date picker) + the chart. That's the entire v1 UI.
  (See "Front-end design" section below for the locked layout spec.)

### v1 scope
Uses **last season's completed data only** (immutable → a static JSON is sufficient; no
freshness concern). Live/current-season support is deferred and is a data-SOURCE swap only
(local job → serverless proxy or scheduled job), NOT a rewrite, because the data shape stays
identical. Does not need to work for next season yet.

## The stored JSON (settled; record shapes live in src/types.ts)

Per team, TWO date-sorted lists: `teamGames` (82 records) and `opponentGames` (82 records).
Records are **TRIMMED to only the fields the chart uses** — not the full API payload.

- **Every record carries:** `date`, `gameId`, `teamId`, `teamKey` (the abbreviation, e.g.
  "BKN" — full team names are NOT stored; the key is what the page will display).
  (On OpponentGame records these identify the team the list belongs to — whose "allowed"
  numbers they are — while the stat values are what the opponent did to them. The build
  script reads the key from the row's `Team` field for teamGames and `Opponent` field for
  opponentGames.)
- **TeamGame stat fields (9):** `points`, `threePointersMade`, `threePointersAttempted`,
  `turnovers`, `stocks`, `personalFouls`, `freeThrowsAttempted`, `offensiveRebounds`, `assists`.
- **OpponentGame stat fields (5 — the "Allowed" stats only):** `points`, `threePointersMade`,
  `threePointersAttempted`, `freeThrowsAttempted`, `offensiveRebounds`. (No `stocks` — not an
  Allowed stat.)
- **`stocks` is PRECOMPUTED** = Steals + BlockedShots, stored as one field (TeamGame only).
- **Team color** stored ONCE at the team level (next to `key`), not per row.
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
| FTA Allowed | `FreeThrowsAttempted` | opponentGame |
| OREB | `OffensiveRebounds` | teamGame |
| OREB Allowed | `OffensiveRebounds` | opponentGame |
| Assists | `Assists` | teamGame |

"Allowed" = the same field read from the opponentGame view (label convention settled
2026-07-24: ALL opponent stats use the "Allowed" suffix, never "Against"). The stat picker must
map each entry to **(which list, which field)** so the transform routes to the right data.

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

## The chart — hand-rolled with Framer Motion (decided 2026-07-26, SUPERSEDES Recharts)

**No charting library.** The chart is a bespoke React component: 30 horizontal rows, each a
team key + a colored bar whose width = value ÷ axisMax, styled entirely with the Tailwind
tokens and animated with Framer Motion (npm package `motion`).

Why the switch from Recharts: **bar color = team identity.** On a re-sort, a fixed-row chart
library animates lengths in place, so a row's bar visibly CHANGES COLOR — one team appears to
morph into another. The honest animation moves each keyed bar to its new rank carrying its
color; Framer Motion's `layout` prop does exactly that (FLIP + spring) and chart libraries
don't. This chart's needs are tiny (one series, linear scale, no legend/stacking).
(Nivo was the considered library alternative; rejected for theming ceilings and dependency
weight. react-day-picker remains the calendar choice — this decision changes nothing else.)

- Chart array = **flat array of one object per bar**, 30 objects (`TeamBarData`).
- Rows are keyed by team key; `motion.div` with `layout` animates re-sorts; bar widths and
  the axis max animate as values change. (Motion layer not yet built as of 2026-07-27.)
- Axis max: a "nice" rounded value above the data max (`niceAxisMax` in Chart.tsx), tuned so
  the top bar lands near full width — mitigates narrow-spread stats (Points) looking flat.
- **NO axis chrome** (decided 2026-07-27 after an interactive preview): no tick marks, no
  numeric labels, no gridlines, no baseline. Values are permanently labeled at each bar's
  right edge, which makes axis numbers redundant. Fixed-quarter gridlines were tried and
  removed.
- **NO tooltip layer** (decided 2026-07-26): same reason — every value is always visible. The
  planned tooltip step was deleted, not deferred.
- **Row hover + click-to-pin** (added 2026-07-30, narrows the 2026-07-26 "no hover" rule).
  Hovering anywhere on a row tints the whole row `bg-line/50` and shows a pointer cursor;
  clicking pins it at full `bg-line`, and clicking again unpins. This is NOT the rejected
  hover layer — it surfaces no data, it is an affordance plus a way to follow ONE team while
  changing stats and ranges. Pins are keyed by TEAM KEY, so a pinned row keeps its highlight
  as it glides to a new rank. Hover is dropped entirely while a row is pinned: applying both
  would LIGHTEN a pinned row on hover, which reads as deselecting. Any number of rows may be
  pinned; pinning all 30 is pointless but deliberately not blocked.
- **Median divider:** a dashed `hardwood` rule between ranks 15 and 16.
- **Chart panel fits the viewport** (`max-h calc(100dvh - page padding)`) and scrolls
  INTERNALLY with a hidden scrollbar (`scrollbar-hidden` utility in index.css); the page
  itself never scrolls, so both pill rails always stay in view.
- **BOTH side rails get the same treatment** (added 2026-07-30) — each `<aside>` is a capped
  flex column (`rail` / `railScroll` / `railHeading` consts in App.tsx): heading pinned via
  `shrink-0`, pills scrolling beneath it. `min-h-0` on the scroll box is load-bearing — without
  it a flex child will not shrink below its content height and the cap silently does nothing.
  In the RANGE rail the scroll box wraps ONLY `RangePicker`, with the two custom pickers pinned
  below it as a `shrink-0` sibling: a scroll container clips its own absolutely positioned
  children, so putting the popovers inside it would cut their panels off. That also means the
  preset list is the part that grows as presets are added.

## The render-time transform (this is the "massaging")

Stored per-game JSON is NOT the chart's shape. Rebuild the chart array on every change of stat
or range (useMemo keyed on `[stat, range]`).

**`buildBars(teams, stat, range)` is the ONE entry point** (consolidated 2026-07-30). It takes
both selections NULLABLE and returns the placeholder — 30 zero-value bars, sorted
alphabetically — whenever either is missing; `transformData` and `placeholderBars` are private
to the module. This is why a cleared chart and a freshly loaded one take the identical code
path, and it is what makes `initial={false}` sufficient for "bars start at 0" (the zero is a
DATA value, not a mount state). Note the guard is an OR: a stat with no range still renders the
placeholder, which is why the range defaults to Full Season.

Per team, when both are present:
1. Pick the list — `teamGames` vs `opponentGames` — per the selected stat's mapping.
2. Select the rows for the range. Two branches only (consolidated 2026-07-28):
   - `mode: 'numGames'` → `games.slice(startGame - 1, endGame)`. Game numbers are 1-based and
     INCLUSIVE; slice is 0-based and exclusive. Presets and the custom game picker both land
     here — the presets are just stored index pairs (Last 10 = 73–82), so there is one code
     path, and transform-data.ts no longer imports the preset table at all.
   - `mode: 'dates'` → filter by `date` within [from, to] (plain string compares).
3. Sum the selected field, **divide by the number of selected rows** → per-game average
   (decided 2026-07-24: averages EVERYWHERE, all range modes).
4. Emit `{ key, color, value }` (color from the team entry).
Then sort the 30 objects **descending** (always — top = most) and hand to the Chart component.

Two clearly separated layers:
- **Stored JSON** → optimized for slice-and-average (per-team date-sorted per-game rows).
- **Chart array** → 30 flat objects, built at render, thrown away and rebuilt on each change.

Why averages everywhere: for preset ranges every team divides by the same X, so the chart is
visually IDENTICAL to totals (axis numbers shrink, bar ratios don't change) — but for custom
date ranges teams play unequal game counts, and averaging is what keeps the comparison fair.
Basketball decision-makers are also more used to per-game numbers.

## Tech (confirmed 2026-07-23; charting decision revised 2026-07-26)
- **React + TypeScript.** TS is confirmed (not optional): type the stored JSON,
  the stat-config map, and component props — the two-layer data design should be
  self-documenting.
- **Framer Motion (`motion` package) + hand-rolled chart, NOT Recharts** (decided 2026-07-26
  — see the chart section for the full rationale).
- **Vite** (confirmed). **Set Vite `base` to `/<repo-name>/`** or the GitHub Pages build 404s
  its own JS/CSS (blank page). Since there's no routing, relative fetch paths for the JSON are
  fine once `base` is set.
- **Tailwind CSS** for all styling (confirmed).
- **Light mode ONLY** (confirmed). No dark theme. Vet all 30 team colors against the light
  background; near-white/very light primaries are the ones needing a fallback color.
- **Chart orientation: horizontal bars** (confirmed). Bars grow left-to-right, 30 team keys
  stacked down the left edge.
- **Chart values: per-game AVERAGES everywhere** (decided 2026-07-24, supersedes the earlier
  "averages are not being built" note). Rationale in the render-time transform section.
- **react-day-picker** for the custom date-range calendar (decided 2026-07-24), themed to the
  Tailwind tokens.
- **Tailwind theme tokens** (light mode, "hardwood & logo" palette, approved 2026-07-24) live
  in `src/index.css` under `@theme` — page/surface/ink/ink-muted/line/hardwood/accent/
  accent-red. Chart chrome uses the quiet ones (line, ink-muted, surface); accents stay
  pinpoint because ~half the league's team colors are themselves reds and blues.

## Top-level JSON shape (settled 2026-07-23; source of truth = src/types.ts)
- **Array of teams** (not an object keyed by TeamID). Team identity lives at team level.
- Per team: `teamId`, `key` (the abbreviation, e.g. "BKN" — no full-name field), `color`,
  plus two 82-record lists named **`teamGames`** and **`opponentGames`** (plural).
- Top level: `{ season, teams }`.
- The exact record shapes are the `TeamGame`/`OpponentGame`/`Team`/`StatsResponse` interfaces
  in **`src/types.ts`** — the shared contract, imported type-only by `scripts/build-data.ts`
  so script output and app expectations cannot drift. Consult it rather than re-deriving.
  (App-side: `TeamBarData` = one chart bar; `GameRangeSelection` = the range state union.)

## Front-end design (locked 2026-07-24, from owner's notebook mockup)

Three-zone layout, title centered at top (title TEXT is still TBD — use a placeholder):
- **Left rail — stat picker:** 14 rounded pill buttons, one per stat, in this order/labels:
  Points, Points Allowed, 3PM, 3PM Allowed, 3PA, 3PA Allowed, TO, Stocks, Fouls, FTA,
  FTA Allowed, OREB, OREB Allowed, Assists. Hoverable; the selected pill must be clearly
  distinct (working treatment: filled accent blue, white text; unselected = surface bg with
  line border; hover = light tint).
- **Center — the chart** (hand-rolled Framer Motion horizontal bars, per the chart section).
- **Right rail — range picker:** 7 rounded pill buttons: Last 5, Last 10, Last 25,
  Full Season, First 5, First 10, First 25. Beneath them a **react-day-picker** calendar for a
  custom date range, and beneath that a **custom game-number range** (two 1–82 inputs).
- **All three range sources are MUTUALLY EXCLUSIVE** — one source of truth, last choice wins.
  This is structural, not enforced: `GameRangeSelection` is a discriminated union, so setting
  one shape erases the others, and each control derives its own active state from it.
  Preset pills highlight on `mode === 'numGames' && label === <pill>`; the date trigger fills
  on `mode === 'dates'`; a custom game range is `mode === 'numGames'` with NO `label`.
- **Custom pickers commit explicitly** — a Go button, so the chart does not move while you are
  still choosing. Each picker keeps its draft in local state and only lifts committed values to
  App; both use the shared `GoButton` (actions) while `Pill` stays the selection primitive.
- **Default view on load: NO stat + Full Season** (changed 2026-07-30, supersedes "3PA Allowed
  + Last 10"). Both selections are nullable and the stat starts null, so the chart opens on a
  placeholder of 30 zero-width bars sorted alphabetically. The RANGE defaults to Full Season
  (`DEFAULT_RANGE` in App.tsx) so a single stat click is enough to see data — without it,
  `buildBars` returns the placeholder until BOTH are chosen and the stat rail looks dead.
- **Clear button** (added 2026-07-30) — top right of the chart panel, a quiet text button
  (not `Pill`, not `GoButton`; inline in Chart.tsx). Sets stat, range AND pinned rows back to
  empty. It resets the range to NULL rather than to `DEFAULT_RANGE`, so after a Clear it takes
  two clicks to see data again — owner's explicit choice, not an oversight. Disabled only when
  nothing is selected, which given the default range means it is enabled from first render.
- **Sort: always descending** (longest bar on top). A sort-direction toggle is a noted
  FUTURE idea, not v1.
- **Desktop-first; NO custom responsive logic in v1.** Standard flexible sizing only; tablet
  working is a bonus, phones are out of scope.

## Build workflow & code style (owner's standing instructions)
- **The owner is the sole decision-maker.** Any time a decision comes up that wasn't clearly
  instructed — naming, structure, library choice, anything — ASK the owner. Do not assume or
  decide unilaterally. When the owner asks a question, answer it and STOP; do not resume the
  pending action until they say to proceed.
- **Build one component at a time, ONLY when the owner asks for it.** Do not build ahead,
  scaffold extra components, or "while I'm here" anything. The owner names the next component.
- **Prioritize code readability and reusability** over cleverness or brevity.
- When building the chart, invoke the **`dataviz` skill** (`/dataviz`) first — chart color
  systems, accessible palettes, axis/tooltip conventions. Directly relevant to the per-team
  color + contrast caveat.

## Build status & sequencing (as of 2026-07-30)
**All v1 functionality is built.** data job + data.json ✓ · Pill / StatPicker / RangePicker ✓ ·
App state ✓ · data loading ✓ · transform-data.ts ✓ · Chart/Bar with median divider +
viewport-fit scroll panel ✓ · Framer Motion layer ✓ · DatePicker (popover) ✓ ·
GamePicker (custom 1–82 range) ✓ · Clear button ✓ · row hover + click-to-pin ✓ ·
both side rails viewport-capped and internally scrolling ✓.
**Owner's sequencing decision: FUNCTIONAL work first, appearance second.** With function done,
the remaining work is styling/design (see "Still open"). Temporary console.logs in App.tsx
stay until final cleanup.

### Component inventory
- `Pill` — the selection primitive (stat rail, range rail, popover triggers). `aria-pressed`.
- `GoButton` — the action primitive (commit buttons in both custom pickers). No selection
  semantics. Extracted 2026-07-28 rather than duplicating a third copy of the class string.
- `Popover` — trigger Pill + floating panel + outside-click/Escape dismissal, shared by BOTH
  custom pickers (extracted 2026-07-28 when GamePicker was converted to a popover for
  consistency with DatePicker). `isOpen` is CONTROLLED by the caller so `commit()` can close
  the panel; `isActive` fills the trigger; panel content is `children`.
  **Panel is SIDE-anchored, not a dropdown** (settled 2026-07-30): `right-full … top-1/2
  -translate-y-1/2`, so it sits LEFT of the rail over the chart, vertically centred on its
  trigger. Reason: the rail hugs the right edge of a wide screen, so horizontal room is
  plentiful and vertical room is scarce — and an absolutely positioned panel that overflows
  the viewport is UNREACHABLE, because it does not extend the page's scroll height. Centring
  means a tall panel needs only half its height of clearance each way. `max-h calc(100dvh -
  page padding)` + `overflow-y-auto` on the panel is the actual guarantee: it can never exceed
  the viewport, worst case it scrolls internally. `top-full` (dropdown) and `bottom-full`
  (drop-up) were both tried and both clipped. A measure-and-flip approach and Floating UI were
  considered and rejected — Floating UI portals the panel out of `containerRef`, which would
  break the existing outside-click dismissal.
- `StatPicker` / `RangePicker` — map their config table to Pills; fully controlled.
- `DatePicker` — popover calendar; local `range` (draft, painted by the grid) + `committed`
  (what the trigger label shows). Separate on purpose: abandoned picks must not appear on the
  pill, and the union forgets dates when a preset is chosen.
- `GamePicker` — two 1–82 inputs + GoButton; inputs held as STRINGS so a cleared box stays
  empty instead of snapping to 0. Blocks commit until both are whole numbers, in range, in order.
- `Chart` / `Bar` — presentational; Chart owns `niceAxisMax` and the inline Clear button, Bar
  owns the motion + bar paint + the row hover/pin highlight. Neither holds selection state:
  the pinned-row `Set<string>` lives in App (so Clear can empty it) and arrives as
  `selectedTeams` + `onToggleTeam`, which Chart passes straight through per row.

### Motion (built 2026-07-27)
Two animations only, both in `Bar.tsx`, sharing one spring constant:
- `layout` on the row → the vertical glide when ranks change (this is why bar color = team
  identity works; the bar travels rather than a fixed row changing color).
- `animate={{ width }}` on the fill → the width morph, with **`initial={false}`**.
  `initial={false}` is LOAD-BEARING and the three states are not interchangeable (settled the
  hard way, 2026-07-30):
    - `initial={{ width: 0 }}` — correct on first paint, but it is a separate mount state that
      REPLAYS, so bars visibly dropped to zero and grew back on every single click. This was
      tried twice and reverted twice. Do not reintroduce it.
    - no `initial` at all — Framer Motion paints the element's natural (full) width for one
      frame before resolving the percentage target, so bars flash full-width then shrink.
    - `initial={false}` — snaps straight to the animate target on the first frame. Bars still
      start empty because the PLACEHOLDER's value is 0, i.e. the zero comes from the DATA, not
      from mount timing. Nothing can replay it.
An entrance cascade, hover lift, and value ticker were built and then REMOVED — the cascade's
mount animation made re-sorts look buggy, and the owner cut the extras. Do not reintroduce
them without being asked. (The 2026-07-30 row hover is a flat background tint, not the
rejected hover LIFT — no transform, no scale.) Value crossfade was rejected in favor of instant swap because
different stats are unrelated quantities (Points → TO), so counting between them is meaningless.

## Still open
- **Page title text** — owner will supply; build with a placeholder until then.
- **GitHub Pages deploy** — deliberately deferred until the front end is in a better state.
  Single deploy of the whole Vite build (data.json ships inside `public/` → `dist/`).
- **data.json minification** — pretty-printed for development debugging; consider minifying
  for production.
- **Appearance/design pass — this is the remaining work.** All four team colors are now stored
  and typed (`color1`–`color4`); the "sheen × weave" bar treatment (diagonal primary→secondary
  gradient under fine tertiary threads, darkened-primary border) was designed in a preview
  artifact and is the agreed direction. Known items: `type="number"` spinner arrows in
  GamePicker look wrong; no visual indicator that a CUSTOM game range is active (no pill
  lights up); typography scale; possible theme revisit (a dark "court at night" page was
  trialed 2026-07-27 and reverted). `src/index.css` @theme is always the palette's
  source of truth.
- **Accessibility is explicitly OUT OF SCOPE** (owner, 2026-07-28): "this app does not need to
  be accessible." Do not add ARIA work or raise it as a finding.
- Future ideas parked by the owner: sort-direction toggle. (Sticky side rails: SATISFIED —
  as of 2026-07-30 both rails are viewport-capped and scroll internally, so no column can
  outrun the chart and the page genuinely never scrolls.)

## Deployment (decided 2026-07-28, not yet executed)
**Explicit deploys, not continuous** — the `gh-pages` package plus a `"deploy": "npm run build
&& gh-pages -d dist"` script, with GitHub Pages' source set to the `gh-pages` branch (that
setting can only be made AFTER the first deploy creates the branch). Target URL:
`sarafiskray.github.io/nets-app-2/`. Vite `base` is already `/nets-app-2/` — if the repo is
ever renamed, that string must change with it. The owner runs deploys.


