<script setup lang="ts">
import type { Player, Position } from '@/types/player.ts';

const { data: qbProjectionData } = await useFetch('/api/projections', {
  query: { position: 'qb' },
});
const { data: wrProjectionData } = await useFetch('/api/projections', {
  query: { position: 'wr' },
});
const { data: rbProjectionData } = await useFetch('/api/projections', {
  query: { position: 'rb' },
});
const { data: teProjectionData } = await useFetch('/api/projections', {
  query: { position: 'te' },
});
const { data: dstProjectionData } = await useFetch('/api/projections', {
  query: { position: 'dst' },
});
const { data: kProjectionData } = await useFetch('/api/projections', {
  query: { position: 'k' },
});

const { data: rankingData } = await useFetch('/api/rankings', {
  query: { position: 'all' },
});

function calculateRoundPick(ecr: number, numTeams = 12) {
  const round = Math.ceil(ecr / numTeams);
  const pick = ecr % numTeams || numTeams;
  return [round, pick];
}

const allPlayerData = computed<Player[]>(() => {
  if (!rankingData.value?.players) return [];
  const tableData: Player[] = rankingData.value?.players
    .filter(({ player_team_id }) => player_team_id !== 'FA')
    .map((playerData) => {
      const combinedPositionProjectionData = qbProjectionData.value?.concat(
        wrProjectionData.value || [],
        rbProjectionData.value || [],
        teProjectionData.value || [],
        dstProjectionData.value || [],
        kProjectionData.value || []
      );
      const matchingPlayerProjection = combinedPositionProjectionData?.find(
        ({ player_id }) => player_id === playerData.player_id.toString()
      );
      const { player_id, player, fpts, ...stats } =
        matchingPlayerProjection || {};

      return {
        player_name: playerData.player_name,
        team: playerData.player_team_id,
        position: playerData.player_position_id as Position,
        url: playerData.player_page_url,
        image: playerData.player_image_url,
        bye_week: playerData.player_bye_week,
        tier: playerData.tier,
        fpts: Number(matchingPlayerProjection?.fpts),
        vorp: 0,
        rank: {
          roundPick: calculateRoundPick(playerData.rank_ecr).join('|'),
          ecr: playerData.rank_ecr,
          min: playerData.rank_min,
          max: playerData.rank_max,
          ave: playerData.rank_ave,
        },
        stats,
      };
    });

  return tableData;
});

const qbTableData = computed(() => {
  return allPlayerData.value.filter((player) => {
    return player.position?.toLowerCase() === 'qb';
  });
});
const rbTableData = computed(() => {
  return allPlayerData.value.filter((player) => {
    return player.position?.toLowerCase() === 'rb';
  });
});
const wrTableData = computed(() => {
  return allPlayerData.value.filter((player) => {
    return player.position?.toLowerCase() === 'wr';
  });
});
const teTableData = computed(() => {
  return allPlayerData.value.filter((player) => {
    return player.position?.toLowerCase() === 'te';
  });
});
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <PlayersTable :data="qbTableData" header="Quarterback" :replacement="15" />
    <PlayersTable :data="rbTableData" header="Running back" :replacement="36" />
    <PlayersTable
      :data="wrTableData"
      header="Wide Receiver"
      :replacement="46" />
    <PlayersTable :data="teTableData" header="Tightend" :replacement="17" />
  </div>
</template>
