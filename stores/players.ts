import { defineStore } from 'pinia';
import type { Player, Position } from '@/types/player';
import type { InjuredPlayer } from '@/server/api/injuries';
import type { ProjectionsPlayer } from '@/server/api/projections';

export const usePlayersStore = defineStore('players', {
  state: () => ({
    isFetchingPlayerData: false,
    allPlayerData: [] as Player[],
    playerInjuriesData: [] as InjuredPlayer[],
    qbProjectionData: [] as ProjectionsPlayer[],
    wrProjectionData: [] as ProjectionsPlayer[],
    rbProjectionData: [] as ProjectionsPlayer[],
    teProjectionData: [] as ProjectionsPlayer[],
    removedPlayers: [] as Player[],
  }),
  actions: {
    async fetchPlayerInjuryData() {
      this.playerInjuriesData = await $fetch('/api/injuries');
    },
    async fetchQbProjectionData() {
      this.qbProjectionData = await $fetch('/api/projections', {
        query: { position: 'qb' },
      });
    },
    async fetchRbProjectionData() {
      this.rbProjectionData = await $fetch('/api/projections', {
        query: { position: 'rb' },
      });
    },
    async fetchWrProjectionData() {
      this.wrProjectionData = await $fetch('/api/projections', {
        query: { position: 'wr' },
      });
    },
    async fetchTeProjectionData() {
      this.teProjectionData = await $fetch('/api/projections', {
        query: { position: 'te' },
      });
    },
    async fetchAllPlayerData(scoringType: 'STD' | 'PPR' | 'HALF') {
      if (!this.playerInjuriesData.length) await this.fetchPlayerInjuryData();
      if (!this.qbProjectionData.length) await this.fetchQbProjectionData();
      if (!this.rbProjectionData.length) await this.fetchRbProjectionData();
      if (!this.wrProjectionData.length) await this.fetchWrProjectionData();
      if (!this.teProjectionData.length) await this.fetchTeProjectionData();
      try {
        this.isFetchingPlayerData = true;
        const rankingData = await $fetch('/api/rankings', {
          query: {
            position: 'all',
            scoring: scoringType,
          },
        });
        if (rankingData.players) {
          this.allPlayerData = rankingData.players
            .filter(({ player_team_id }) => player_team_id !== 'FA')
            .reduce<Player[]>((data, playerData) => {
              const combinedPositionProjectionData =
                this.qbProjectionData.concat(
                  this.wrProjectionData,
                  this.rbProjectionData,
                  this.teProjectionData
                );
              const matchingInjuredPlayer = this.playerInjuriesData.find(
                ({ player_id }) => player_id === playerData?.player_id
              );
              const matchingPlayerProjection =
                combinedPositionProjectionData?.find(
                  ({ player_id }) =>
                    player_id === playerData.player_id.toString()
                );
              const {
                player_id,
                player: name,
                fpts,
                ...stats
              } = matchingPlayerProjection || {};

              const player: Player = {
                player_id: playerData.player_id,
                player_name: playerData.player_name,
                team: playerData.player_team_id,
                position: playerData.player_position_id as Position,
                url: playerData.player_page_url,
                image: playerData.player_image_url.replace(
                  '210x210.png',
                  '100x100.webp'
                ),
                bye_week: playerData.player_bye_week,
                tier: playerData.tier,
                rank: {
                  ecr: playerData.rank_ecr,
                  min: playerData.rank_min,
                  max: playerData.rank_max,
                  ave: playerData.rank_ave,
                },
                stats,
                injury: matchingInjuredPlayer,
              };
              if (matchingPlayerProjection) data.push(player);
              return data;
            }, []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.isFetchingPlayerData = false;
      }
    },
    isPlayerRemoved(playerId: number) {
      return this.removedPlayers.some(
        ({ player_id }) => player_id === playerId
      );
    },
    removePlayer(player: Player) {
      const matchingIndex = this.removedPlayers.findIndex(
        ({ player_id }) => player_id === player.player_id
      );
      if (matchingIndex === -1) {
        this.removedPlayers.push(player);
      } else {
        this.removedPlayers.splice(matchingIndex, 1);
      }
    },
  },
});
