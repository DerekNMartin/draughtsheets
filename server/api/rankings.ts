import type { H3Event } from 'h3';

interface RankingPlayer {
  player_id: number;
  player_name: string;
  sportsdata_id: string;
  player_team_id: string;
  player_position_id: string;
  player_positions: string;
  player_short_name: string;
  player_eligibility: string;
  player_yahoo_positions: string;
  player_page_url: string;
  player_filename: string;
  player_square_image_url: string;
  player_image_url: string;
  player_yahoo_id: string;
  cbs_player_id: string;
  player_bye_week: string;
  player_owned_avg: number;
  player_owned_espn: number;
  player_owned_yahoo: number;
  player_ecr_delta: number;
  rank_ecr: number;
  rank_min: string;
  rank_max: string;
  rank_ave: string;
  rank_std: string;
  pos_rank: string;
  tier: number;
}

interface FpRankingsResponse {
  count?: number;
  experts_available?: {
    total: number;
    included: number[];
    exluded: number[];
    last_updated: number;
  };
  filters?: string;
  last_updated?: string;
  last_updated_ts?: number;
  players?: RankingPlayer[];
  position_id?: string;
  ranking_type_name?: string;
  scoring?: string;
  sport?: string;
  total_experts?: number;
  type?: string;
  week?: string;
  year?: string;
}

function handleQueryParams(event: H3Event) {
  const defaultParams = {
    type: 'adp',
    scoring: 'STD',
    position: 'ALL',
    week: '0',
    exports: 'available',
    sport: 'nfl',
  };
  const params = getQuery(event);

  return { ...defaultParams, ...params };
}

export default defineEventHandler(async (event) => {
  return await $fetch<FpRankingsResponse>(
    'https://api.fantasypros.com/v2/json/nfl/2024/consensus-rankings',
    {
      headers: {
        'x-api-key': 'zjxN52G3lP4fORpHRftGI2mTU8cTwxVNvkjByM3j',
      },
      params: handleQueryParams(event),
    }
  );
});
