<script setup lang="ts">
import { kmeans } from 'ml-kmeans';
import dayjs from 'dayjs';

const validPositions = ['QB', 'WR', 'RB', 'TE', 'DST', 'K', 'FLX'] as const;
type Position = (typeof validPositions)[number];
const positionOptions: { value: Position; label: string }[] = [
  { value: 'QB', label: 'QB' },
  { value: 'WR', label: 'WR' },
  { value: 'RB', label: 'RB' },
  { value: 'TE', label: 'TE' },
  { value: 'DST', label: 'DST' },
  { value: 'K', label: 'K' },
  { value: 'FLX', label: 'FLEX' },
];
const positionSelected = ref<Position>(positionOptions[0].value);

const validScoringTypes = ['STD', 'PPR', 'HALF'] as const;
type ScoringType = (typeof validScoringTypes)[number];
const scoringOptions: { value: ScoringType; label: string }[] = [
  { value: 'STD', label: 'Standard' },
  { value: 'PPR', label: 'PPR' },
  { value: 'HALF', label: 'Half PPR' },
];
const scoringSelected = ref<ScoringType>(scoringOptions[0].value);

const positionMapping = computed(() => {
  const playerMap: Record<
    Position,
    { numOfPlayers: number; numOfTiers: number }
  > = {
    QB: { numOfPlayers: 26, numOfTiers: 8 },
    WR: { numOfPlayers: 60, numOfTiers: 12 },
    RB: { numOfPlayers: 40, numOfTiers: 9 },
    TE: { numOfPlayers: 24, numOfTiers: 8 },
    FLX: { numOfPlayers: 100, numOfTiers: 15 },
    DST: { numOfPlayers: 20, numOfTiers: 5 },
    K: { numOfPlayers: 20, numOfTiers: 6 },
  };
  return playerMap[positionSelected.value];
});

const nflWeek = computed(() => {
  const startDate = dayjs('September 2, 2024');
  const today = dayjs();
  return Math.ceil(today.diff(startDate, 'week', true)).toString();
});

const weekOptions = Array.from({ length: Number(nflWeek.value) + 1 }, (_, i) =>
  i.toString()
);
const weekSelected = ref(nflWeek.value);

const rankingQuery = computed(() => {
  return {
    position: positionSelected.value,
    scoring: scoringSelected.value,
    week: weekSelected.value,
    limit: positionMapping.value.numOfPlayers,
  };
});
const { data: playerRankData } = useFetch('/api/rankings', {
  query: rankingQuery,
});
const players = computed(() => playerRankData?.value?.players);
const lastUpdatedTime = computed(() => {
  const lastUpdatedTs = playerRankData?.value?.last_updated_ts;
  return lastUpdatedTs
    ? dayjs.unix(lastUpdatedTs).format('ddd MMM DD h:mm A')
    : '';
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
      player.start_sit_grade,
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

const route = useRoute();
const router = useRouter();
watch([positionSelected, scoringSelected, weekSelected], (newValue) => {
  const [position, scoring, week] = newValue;
  useTrackEvent('tier_settings_changed', { position, scoring, week });
  router.replace({ path: route.path, query: { position, scoring } });
});
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    if (newQuery === oldQuery) return;
    const { position, scoring } = newQuery;
    if (
      typeof position === 'string' &&
      validPositions.includes(position as Position)
    )
      positionSelected.value = position as Position;
    if (
      typeof scoring === 'string' &&
      validScoringTypes.includes(scoring as ScoringType)
    )
      scoringSelected.value = scoring as ScoringType;
  },
  { immediate: true }
);
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
    <div class="flex flex-col gap-6">
      <div class="border-b border-solid border-neutral-200 pb-6">
        <div class="grid grid-flow-col gap-6">
          <AppSelect
            v-model="positionSelected"
            :options="positionOptions"
            label-attribute="label"
            value-attribute="value"
            label="Position"
          />
          <AppSelect
            v-model="scoringSelected"
            size="sm"
            :options="scoringOptions"
            label-attribute="label"
            value-attribute="value"
            label="Scoring"
          />
          <AppSelect
            v-model="weekSelected"
            size="sm"
            :options="weekOptions"
            label="Week"
          />
        </div>
      </div>
      <div class="flex flex-col border-b border-solid border-neutral-200 pb-6">
        <p class="text-xs self-end text-gray-500">
          Last Updated: {{ lastUpdatedTime }}
        </p>
        <TierChart :data="chartData" />
      </div>
      <div>
        <ul>
          <li
            v-for="(tier, index) in tierList"
            :key="index"
            class="flex gap-2 py-2 first:pt-0 last:pb-0 last:border-none items-center border-b border-solid border-gray-200"
          >
            <span class="text-sm text-gray-500 min-w-fit"
              >Tier {{ index + 1 }}</span
            >
            <span>{{ tier?.join(', ') }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
