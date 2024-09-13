<script setup lang="ts">
import { kmeans } from 'ml-kmeans';
import dayjs from 'dayjs';

const positionOptions = ['QB', 'WR', 'RB', 'TE', 'DST', 'K'] as const;
type Position = (typeof positionOptions)[number];
const positionSelected = ref(positionOptions[0]);

const scoringOptions = ['STD', 'PPR', 'HALF'];
const scoringSelected = ref(scoringOptions[0]);

const positionMapping = computed(() => {
  const playerMap: Record<
    Position,
    { numOfPlayers: number; numOfTiers: number }
  > = {
    QB: { numOfPlayers: 26, numOfTiers: 8 },
    WR: { numOfPlayers: 60, numOfTiers: 12 },
    RB: { numOfPlayers: 40, numOfTiers: 9 },
    TE: { numOfPlayers: 24, numOfTiers: 8 },
    DST: { numOfPlayers: 20, numOfTiers: 5 },
    K: { numOfPlayers: 20, numOfTiers: 6 },
  };
  return playerMap[positionSelected.value];
});

function getNFLWeek() {
  const startDate = dayjs('September 6, 2024');
  const today = dayjs();
  return Math.ceil(today.diff(startDate, 'week', true));
}

const rankingQuery = computed(() => {
  return {
    position: positionSelected.value,
    scoring: scoringSelected.value,
    week: getNFLWeek(),
    limit: positionMapping.value.numOfPlayers,
  };
});
const { data: players } = useFetch('/api/rankings', {
  query: rankingQuery,
  transform(input) {
    return input.players;
  },
});

const chartData = computed(() => {
  const data = players.value?.map((player) => [Number(player.rank_ave)]);
  if (!data?.length) return [];
  const tiers = kmeans(data, positionMapping.value.numOfTiers, {
    seed: 111,
  }).clusters;
  return players.value?.map((player, index) => {
    return [
      player.player_name,
      player.rank_ecr,
      player.rank_ave,
      player.rank_std,
      tiers[index],
    ];
  });
});

const tierList = computed(() => {
  if (!chartData?.value?.length) return [];
  return chartData.value.reduce<{
    currentTier: number;
    prevCluster: number | string;
    tiers: string[][];
  }>(
    (acc, player) => {
      const currentCluster = player[4];

      if (currentCluster !== acc.prevCluster) {
        acc.currentTier++;
        acc.prevCluster = currentCluster;
      }

      if (!acc.tiers[acc.currentTier]) {
        acc.tiers[acc.currentTier] = [];
      }
      acc.tiers[acc.currentTier].push(player[0] as string);
      return acc;
    },
    { currentTier: 0, prevCluster: chartData.value[0][4], tiers: [] }
  ).tiers;
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <section>
      <h3 class="text-xl font-medium">Player Tiers</h3>
      <p>
        Pick a position and your league's scoring type to easily compare players
        and decide your starters.
      </p>
    </section>
    <UCard>
      <template #header>
        <section class="flex gap-6">
          <AppSelect
            v-model="positionSelected"
            :options="positionOptions"
            label="Position"
          />
          <AppSelect
            v-model="scoringSelected"
            size="sm"
            :options="scoringOptions"
            label="Scoring"
          />
        </section>
      </template>
      <TierChart :data="chartData" />
      <template #footer>
        <p v-for="(tier, index) in tierList" :key="index">
          Tier {{ index + 1 }}: {{ tier?.join(', ') }}
        </p>
      </template>
    </UCard>
  </div>
</template>
