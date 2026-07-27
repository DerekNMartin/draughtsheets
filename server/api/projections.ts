import { isEmpty } from '@/utils/misc';

type PlayerStat = {
  tds: number;
  yds: number;
  rec?: number;
  att?: number;
  cmp?: number;
  ints?: number;
};

type FpProjectionsResponse = {
  season: string;
  week: string;
  count: string;
  positions: string;
  scoring: string;
  players: FpProjectionPlayer[];
};

type FpProjectionQbStats = {
  points: number;
  points_ppr: number;
  points_half: number;
  pass_att: number;
  pass_cmp: number;
  pass_yds: number;
  pass_tds: number;
  pass_ints: number;
  pass_yds_300: number;
  pass_yds_400: number;
  rush_att: number;
  rush_yds: number;
  rush_tds: number;
  rush_yds_100: number;
  rush_yds_200: number;
  scrimage_yards_100: number;
  scrimage_yards_200: number;
  fumbles: number;
  ret_tds: number;
  '2pt_tds': number;
};

type FpProjectionPositionStats = {
  points: number;
  points_ppr: number;
  points_half: number;
  rush_att: number;
  rush_yds: number;
  rush_tds: number;
  rush_yds_100: number;
  rush_yds_200: number;
  scrimage_yards_100: number;
  scrimage_yards_200: number;
  rec_rec: number;
  rec_yds: number;
  rec_tds: number;
  rec_yds_100: number;
  rec_yds_200: number;
  fumbles: number;
  ret_tds: number;
  '2pt_tds': number;
};

type FpProjectionPlayer = {
  fpid: number;
  mflid: string;
  name: string;
  position_id: string;
  team_id: string;
  filename: string;
  stats: FpProjectionQbStats | FpProjectionPositionStats;
};

export type ProjectionsPlayer = {
  player_id?: number;
  player?: string;
  fpts?: string | number;
  passing?: PlayerStat;
  rushing?: PlayerStat;
  receiving?: PlayerStat;
  misc?: { fl: number; fpts: number };
};

const validPositionQueries = ['qb', 'rb', 'wr', 'te', 'k', 'dst'] as const;
type Position = (typeof validPositionQueries)[number];
interface QueryInterface {
  position: Position;
}

function handleQueries(query: QueryInterface) {
  const position = query?.position || 'qb';

  if (!validPositionQueries.includes(position)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid Query - position is not valid',
    });
  }

  return { position: position.toUpperCase() };
}

function getPlayerStats(statTypeKeyPrefix: 'pass' | 'rec' | 'rush', player: FpProjectionPlayer) {
  return Object.entries(player.stats).reduce((stats, [currentKey, currentValue]) => {
    if (currentKey.includes(statTypeKeyPrefix)) {
      const key = currentKey.replace(statTypeKeyPrefix + '_', '') as keyof PlayerStat;
      stats[key] = currentValue;
    }
    return stats;
  }, {} as PlayerStat);
}

/**
 * Transforms FFP player projection data to fit our own defined schema.
 */
function transformProjections(response: FpProjectionsResponse): ProjectionsPlayer[] {
  return response.players.map((player) => {
    const miscStats = {
      fl: player.stats.fumbles,
      fpts: player.stats.points,
    };
    const passStats = getPlayerStats('pass', player);
    const recStats = getPlayerStats('rec', player);
    const rushStats = getPlayerStats('rush', player);
    return {
      player_id: player.fpid,
      player: player.name,
      fpts: player.stats.points,
      misc: miscStats,
      ...(!isEmpty(passStats) && { passing: passStats }),
      ...(!isEmpty(rushStats) && { rushing: rushStats }),
      ...(!isEmpty(recStats) && { receiving: recStats }),
    };
  });
}

/**
 * Returns player projections from FantasyPros.
 * https://api.fantasypros.com/public/v2/docs#tag/Projections/paths/~1nfl~1%7Bseason%7D~1projections/get
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery<QueryInterface>(event);
    const { position } = handleQueries(query);
    const currentYear = new Date().getFullYear();

    const response = await $fetch<FpProjectionsResponse>(
      `https://api.fantasypros.com/public/v2/json/nfl/${currentYear}/projections`,
      {
        headers: {
          'x-api-key': process.env.FFP_API_KEY || '',
        },
        params: {
          week: 0,
          position,
        },
      }
    );

    return transformProjections(response);
  },
  { maxAge: 30 * 60 /* 30 minutes */ }
);
