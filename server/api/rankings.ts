import type { H3Event } from 'h3';

interface RankingPlayer {
  cbs_player_id: string;
  note: string;
  player_bye_week: string;
  player_ecr_delta: string;
  player_eligibility: string;
  player_filename: string;
  player_id: number;
  player_image_url: string;
  player_name: string;
  player_opponent: string;
  player_opponent_id: string;
  player_owned_avg: number;
  player_owned_espn: number;
  player_owned_yahoo: number;
  player_page_url: string;
  player_position_id: string;
  player_positions: string;
  player_short_name: string;
  player_square_image_url: string;
  player_team_id: string;
  player_yahoo_id: string;
  player_yahoo_positions: string;
  pos_rank: string;
  r2p_pts: string;
  rank_ave: string;
  rank_ecr: number;
  rank_max: string;
  rank_min: string;
  rank_std: string;
  recommendation: string;
  sportsdata_id: string;
  start_sit_grade: string;
  tag: string;
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
    scoring: 'STD',
    position: 'ALL',
    week: '0',
  };
  const params = getQuery(event);
  return { ...defaultParams, ...params };
}

export default defineCachedEventHandler(
  async (event) => {
    return await $fetch<FpRankingsResponse>(
      'https://api.fantasypros.com/v2/json/nfl/2024/consensus-rankings',
      {
        headers: {
          'x-api-key': process.env.FFP_API_KEY || '',
        },
        params: handleQueryParams(event),
      }
    );
  },
  { maxAge: 30 * 60 /* 30 minutes */ }
);
