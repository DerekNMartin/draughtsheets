import type { ProjectionsPlayer } from '@/server/api/projections';
import type { InjuredPlayer } from '@/server/api/injuries';

export type Position = 'QB' | 'WR' | 'RB' | 'TE' | 'DST';

export interface Player {
  player_name: string;
  team: string;
  position: Position;
  url: string;
  image: string;
  bye_week: string;
  tier: number;
  fpts?: string;
  vorp?: number;
  scarcity?: number;
  round_pick: string;
  rank: {
    ecr: number;
    min: string;
    max: string;
    ave: string;
  };
  stats: Omit<ProjectionsPlayer, 'player_id' | 'player' | 'fpts'>;
  injury?: InjuredPlayer;
}
