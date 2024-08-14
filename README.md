# DraughtSheets

Inspired by the legend, BeerSheets - DraughtSheets is a web-app that creates a ranking model for fantasy football snake drafts by calculating each player's value over replacement (VOR). The model is designed for standard, half-PPR, and PPR formats, with data sourced from FantasyPros. It focuses on identifying potential bargains by comparing VOR rankings with Average Draft Position (ADP) data.

To calculate a player's value over replacement (VOR), identify a "replacement player" at each position whose projected points reflect the average positional value. Then, subtract this replacement value from each player's projected points within the same position. The result is the player's VOR, indicating how much better they are compared to the typical replacement player.

The value of a player is determined not by the number of points they score. Their value is determined by how much they outscore their peers at their particular position.

My main goal for this project was to learn and try out Nuxt, as well as learn more about value-based drafting as the 2024 fantasy football season is just starting.

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm run dev
```

## Production

Pushing to `main` will build and deploy to production via Netlify.

Build the application for production:

```bash
# pnpm
pnpm run build
```

Locally preview production build:

```bash
# pnpm
pnpm run preview
```

## Resources
- Expert Consensus Data: https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php
- Stat/FPT Projections: https://www.fantasypros.com/nfl/projections/qb.php
- https://www.fantasypros.com/2024/05/fantasy-football-draft-strategy-value-based-drafting/
- https://www.footballguys.com/article/2019-value-based-drafting
- https://www.fantasyfootballdatapros.com/blog/intermediate/5

### TODO:
- [ ] Ability to select own draft picks
- [ ] Ability to remove drafted players
- [ ] Defence Sheet - Show upcoming opponents
- [ ] Calculate Sleeper Score by comparing value rank vs adp rank
- [x] Ability to input league settings and calculate fantasy point projections based on projected stats
- [ ] Apply settings to URL params
- [ ] CRON to pull FP data
- [ ] Store data on database
- [ ] Move data manipulation/calculations to server
