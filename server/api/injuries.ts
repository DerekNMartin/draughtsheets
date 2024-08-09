export interface InjuredPlayer {
  comment: string;
  injury_type: string;
  injury_update_date: string;
  ir_weeks: unknown[];
  name: string;
  player_id: number;
  practice_1?: string | null;
  practice_2?: string | null;
  practice_3?: string | null;
  probability_of_playing?: string | null;
  status: string;
  status_short: string;
  yahoo_id?: string;
}

interface FPInjuriesResponse {
  count: number;
  covids?: unknown[];
  injuries: InjuredPlayer[];
  sport: string;
}

export default defineEventHandler(async () => {
  const year = new Date().getFullYear();
  const response = await $fetch<FPInjuriesResponse>(
    `https://partners.fantasypros.com/api/v1/player-injuries.php?sport=NFL&year=${year}&week=0`
  );
  return response.injuries;
});
