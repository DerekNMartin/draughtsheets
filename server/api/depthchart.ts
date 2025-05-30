import type { ESPNDepthChartResponse } from '@/types/espn_depth_chart';
import type { ESPNPlayerResponse } from '@/types/espn_player';
import { ESPN_TEAM_IDS } from '@/types/espn_depth_chart';

export interface DepthPositions {
  qb: string;
  wr: string;
  rb: string;
  te: string;
}

function getTeamId(teamAbrv?: string) {
  if (!teamAbrv) {
    throw createError({
      statusCode: 400,
      message: 'Invalid Query - No team provided',
    });
  }
  const teamId = ESPN_TEAM_IDS[teamAbrv as keyof typeof ESPN_TEAM_IDS];
  if (teamId) return teamId;
  else {
    throw createError({
      statusCode: 400,
      message: 'Invalid Query - Unable to find team ID',
    });
  }
}

function fetchDepthChart(teamQuery?: string) {
  const teamId = getTeamId(teamQuery);
  const year = new Date().getFullYear();
  return $fetch<ESPNDepthChartResponse>(
    `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/teams/${teamId}/depthcharts`
  );
}

// Pulls the ranked 1 players of top offensive positions, returns their ESPN player information endpoint
function getTopPlayers(depthChart: ESPNDepthChartResponse) {
  const topPostions = depthChart.items.reduce((positions, currentSquad) => {
    const groups = Object.keys(currentSquad.positions)
      .filter((groupKey) => ['qb', 'wr', 'rb', 'te'].includes(groupKey))
      .map((groupKey) => {
        const topPlayerLink = currentSquad.positions[
          groupKey as keyof typeof currentSquad.positions
        ]?.athletes.find((player) => player.rank === 1);
        return { [groupKey]: topPlayerLink?.athlete.$ref };
      });
    positions = Object.assign({}, ...groups);
    return positions;
  }, {} as DepthPositions);
  return topPostions;
}

async function fetchPlayerDetails(topPlayerLinks: DepthPositions) {
  const responses = await Promise.all(
    Object.values(topPlayerLinks).map((link) => $fetch<ESPNPlayerResponse>(link))
  );
  const sorted: Record<keyof DepthPositions, ESPNPlayerResponse> = Object.fromEntries(
    ['qb', 'rb', 'wr', 'te']
      .map((k) => [
        k,
        responses.find((player) => player.position.abbreviation.toLocaleLowerCase() === k),
      ])
      .filter(([_, v]) => v)
  );
  return sorted;
}

export default defineCachedEventHandler(
  async (event) => {
    const queryParams = getQuery<{ team?: string }>(event);
    const depthChart = await fetchDepthChart(queryParams.team);
    const topPlayers = getTopPlayers(depthChart);
    const playerDetails = await fetchPlayerDetails(topPlayers);
    return playerDetails;
  },
  { maxAge: 30 * 60 /* 30 minutes */ }
);
