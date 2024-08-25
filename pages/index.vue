<script setup lang="ts">
import type { Player, Position } from '@/types/player.ts';
import { calculateRoundPick } from '@/utils/strings';
import { usePlayersStore } from '@/stores/players';
import useSlideover from '@/composables/useSlideover';

const store = usePlayersStore();
const { isSlideoverOpen } = useSlideover;

const scoringType = ref<'STD' | 'PPR' | 'HALF'>('STD');
const leagueSize = ref(12);
const pickNumber = ref(1);

store.fetchAllPlayerData(scoringType.value);
const allPlayerData = computed(() => store.allPlayerData);
const isFetchingPlayerData = computed(() => store.isFetchingPlayerData);
watch(scoringType, (newValue) => store.fetchAllPlayerData(newValue));

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

const allTableData = computed<Player[]>(() => {
  return allPlayerData.value.map((player) => {
    return {
      ...player,
      fpts: calculateTotalPoints(player.stats),
      round_pick: calculateRoundPick(player.rank.ecr, leagueSize.value).join(
        ' | '
      ),
    };
  });
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
  const players = allTableData.value.filter(
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
  const teams = allTableData.value
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
        :loading="isFetchingPlayerData"
        :data="qbTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
      <PlayersTable
        position="RB"
        :loading="isFetchingPlayerData"
        :data="rbTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
      <PlayersTable
        position="WR"
        :loading="isFetchingPlayerData"
        :data="wrTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
      <PlayersTable
        position="TE"
        :loading="isFetchingPlayerData"
        :data="teTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="draftPicks" />
    </section>
    <TeamSlideover v-model="isSlideoverOpen" />
  </div>
</template>
