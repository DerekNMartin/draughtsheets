import type { ProjectionsPlayer } from '@/server/api/projections';

export type Position = 'QB' | 'WR' | 'RB' | 'TE' | 'DST';

export interface Player {
  player_name: string;
  team: string;
  position: Position;
  url: string;
  image: string;
  bye_week: string;
  tier: number;
  fpts?: number;
  vorp?: number;
  scarcity?: number;
  rank: {
    roundPick: string;
    ecr: number;
    min: string;
    max: string;
    ave: string;
  };
  stats: Omit<ProjectionsPlayer, 'player_id' | 'player' | 'fpts'>;
}
