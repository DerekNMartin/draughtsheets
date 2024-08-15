<script setup lang="ts">
import type { Player, Position } from '@/types/player.ts';
import { calculateRoundPick } from '@/utils/strings.js';

const scoringType = ref('STD');
const leagueSize = ref(12);
const pickNumber = ref(1);

const { data: playerInjuriesData } = await useFetch('/api/injuries');

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
const { data: kProjectionData } = await useFetch('/api/projections', {
  query: { position: 'k' },
});

const rankingQuery = computed(() => {
  return {
    position: 'all',
    scoring: scoringType.value,
  };
});
const { data: rankingData } = await useFetch('/api/rankings', {
  query: rankingQuery,
});

const pointsMapping = reactive({
  passing: {
    tds: 4,
    yds: 0.04,
    cmp: 0,
    ints: -1.0,
  },
  rushing: {
    tds: 6,
    yds: 0.1,
  },
  receiving: {
    rec: 0,
    tds: 6,
    yds: 0.1,
  },
  misc: {
    fl: -2.0,
  },
});
type PointsMapping = typeof pointsMapping;
type StatCategory = keyof PointsMapping;
function calculateTotalPoints(stats: Player['stats']): string {
  let totalPoints = 0;

  for (const category in stats) {
    const statCategory = stats[category as StatCategory];
    const pointsCategory = pointsMapping[category as StatCategory];

    if (statCategory && pointsCategory) {
      for (const stat in statCategory) {
        const statPoints: number =
          pointsCategory[stat as keyof typeof pointsCategory];
        const statValue: string =
          statCategory[stat as keyof typeof pointsCategory];
        if (statPoints && statValue) {
          totalPoints += parseFloat(statValue.replace(',', '')) * statPoints;
        }
      }
    }
  }

  return totalPoints.toFixed(1);
}
watch(scoringType, (newValue) => {
  if (newValue === 'STD') pointsMapping.receiving.rec = 0;
  if (newValue === 'PPR') pointsMapping.receiving.rec = 1;
  if (newValue === 'HALF') pointsMapping.receiving.rec = 0.5;
});

const allPlayerData = computed<Player[]>(() => {
  if (!rankingData.value?.players) return [];
  const tableData = rankingData.value?.players
    .filter(({ player_team_id }) => player_team_id !== 'FA')
    .reduce<Player[]>((data, playerData) => {
      const combinedPositionProjectionData = qbProjectionData.value?.concat(
        wrProjectionData.value || [],
        rbProjectionData.value || [],
        teProjectionData.value || [],
        kProjectionData.value || []
      );
      const matchingInjuredPlayer = playerInjuriesData?.value?.find(
        ({ player_id }) => player_id === playerData?.player_id
      );
      const matchingPlayerProjection = combinedPositionProjectionData?.find(
        ({ player_id }) => player_id === playerData.player_id.toString()
      );
      const {
        player_id,
        player: name,
        fpts,
        ...stats
      } = matchingPlayerProjection || {};

      const player: Player = {
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
        fpts: calculateTotalPoints(stats),
        round_pick: calculateRoundPick(
          playerData.rank_ecr,
          leagueSize.value
        ).join(' | '),
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

  return tableData;
});

function calculateVorp(
  playerData: Player[],
  position: Exclude<Position, 'DST'>
) {
  const replacementMapping = {
    QB: leagueSize.value,
    RB: leagueSize.value * 2,
    WR: leagueSize.value * 3,
    TE: leagueSize.value,
  };
  const replacementIndex = replacementMapping[position];
  const replacementPlayer = playerData[replacementIndex];

  return playerData.map((player) => {
    const vorp = Number(player.fpts) - Number(replacementPlayer.fpts);
    return {
      ...player,
      vorp: Number(vorp.toFixed(1)),
    };
  });
}
function getPositionTableData(position: Exclude<Position, 'DST'>) {
  const players = allPlayerData.value.filter(
    (player) => player.position === position
  );
  return calculateVorp(players, position);
}
const qbTableData = computed(() => getPositionTableData('QB'));
const rbTableData = computed(() => getPositionTableData('RB'));
const wrTableData = computed(() => getPositionTableData('WR'));
const teTableData = computed(() => getPositionTableData('TE'));

/**
 * Determine the overall min and max value across all players. Used for colour interpolation.
 */
const minMaxVorp = computed(() => {
  const allPlayer = [
    ...qbTableData.value,
    ...rbTableData.value,
    ...wrTableData.value,
    ...teTableData.value,
  ];
  const min = Math.min(...(allPlayer.map(({ vorp }) => vorp) || 0));
  const max = Math.max(...(allPlayer.map(({ vorp }) => vorp) || 0));
  return { min, max };
});

const teamSelectOptions = computed(() => {
  const teams = allPlayerData.value
    .reduce<string[]>((teams, player) => {
      if (!teams.includes(player.team)) teams.push(player.team);
      return teams;
    }, [])
    .sort();
  teams.unshift('All');
  return teams;
});
const teamSelected = ref(teamSelectOptions.value[0]);
const filter = computed(() => ({ team: teamSelected.value }));
const searchValue = ref();

const LeagueSettingsRef = ref();
const draftPicks = computed(() => LeagueSettingsRef.value?.draftPicks);
</script>

<template>
  <div class="flex gap-6 flex-col">
    <LeagueSettings
      ref="LeagueSettingsRef"
      v-model:scoring-type="scoringType"
      v-model:league-size="leagueSize"
      v-model:pick-number="pickNumber"
      v-model:points-mapping="pointsMapping" />
    <TableFilter
      v-model:search="searchValue"
      v-model:team="teamSelected"
      :team-options="teamSelectOptions" />
    <section class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      <PlayersTable
        position="QB"
        :data="qbTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
      <PlayersTable
        position="RB"
        :data="rbTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
      <PlayersTable
        position="WR"
        :data="wrTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
      <PlayersTable
        position="TE"
        :data="teTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
    </section>
  </div>
</template>
