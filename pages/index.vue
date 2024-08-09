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
const { data: kProjectionData } = await useFetch('/api/projections', {
  query: { position: 'k' },
});

const scoringSelectOptions = [
  { id: 'STD', label: 'Standard' },
  { id: 'PPR', label: 'PPR' },
  { id: 'HALF', label: 'Half PPR' },
];
const scoringSelected = ref(scoringSelectOptions[0]);
const rankingQuery = computed(() => {
  return {
    position: 'all',
    scoring: scoringSelected.value.id,
  };
});
const { data: rankingData } = await useFetch('/api/rankings', {
  query: rankingQuery,
});

const leagueSelectOptions = [
  { id: 8, label: '8 Team' },
  { id: 10, label: '10 Team' },
  { id: 12, label: '12 Team' },
  { id: 14, label: '14 Team' },
];
const leagueSelected = ref(leagueSelectOptions[2]);
function calculateRoundPick(ecr: number) {
  const round = Math.ceil(ecr / leagueSelected.value.id);
  const pick = ecr % leagueSelected.value.id || leagueSelected.value.id;
  return [round, pick];
}

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
        image: playerData.player_image_url,
        bye_week: playerData.player_bye_week,
        tier: playerData.tier,
        fpts: Number(matchingPlayerProjection?.fpts),
        rank: {
          roundPick: calculateRoundPick(playerData.rank_ecr).join('|'),
          ecr: playerData.rank_ecr,
          min: playerData.rank_min,
          max: playerData.rank_max,
          ave: playerData.rank_ave,
        },
        stats,
      };
      if (matchingPlayerProjection) data.push(player);
      return data;
    }, []);

  return tableData;
});

const qbTableData = computed(() => {
  return allPlayerData.value.filter(
    (player) => player.position.toLowerCase() === 'qb'
  );
});
const rbTableData = computed(() => {
  return allPlayerData.value.filter(
    (player) => player.position.toLowerCase() === 'rb'
  );
});
const wrTableData = computed(() => {
  return allPlayerData.value.filter(
    (player) => player.position.toLowerCase() === 'wr'
  );
});
const teTableData = computed(() => {
  return allPlayerData.value.filter(
    (player) => player.position.toLowerCase() === 'te'
  );
});

/**
 * Collect the min and max value of players across each position table, to determine the overall
 * min and max value across all players. Used for colour interpolation.
 */
const combinedMinMax = reactive({ min: 0, max: 0 });
function handleMinMax(minMax: { min: number; max: number }) {
  const { min, max } = minMax;
  if (min < combinedMinMax.min) combinedMinMax.min = min;
  if (max > combinedMinMax.max) combinedMinMax.max = max;
}

const searchValue = ref();

const filter = computed(() => {
  return {
    team: teamSelected.value,
  };
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

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});
</script>

<template>
  <main class="flex gap-6 flex-col p-6">
    <section class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <UIcon name="i-ph-beer-stein-bold" class="h-6 w-6 scale-x-[-1]" />
        <h1 class="text-xl font-bold">DraughtSheets</h1>
      </div>
      <div>
        <ClientOnly>
          <UButton
            :icon="
              isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
            "
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark" />
          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
      </div>
    </section>
    <UCard
      :ui="{
        body: { base: 'grid grid-cols-[3fr,1fr,1fr,1fr] gap-4 items-end' },
      }">
      <div>
        <label
          class="text-xs font-semibold light:text-slate-600 dark:text-white">
          Search
        </label>
        <UInput
          v-model="searchValue"
          placeholder="Search player..."
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg" />
      </div>
      <AppSelect
        v-model="teamSelected"
        :options="teamSelectOptions"
        label="Team" />
      <AppSelect
        v-model="leagueSelected"
        :options="leagueSelectOptions"
        label="League"
        label-attribute="label" />
      <AppSelect
        v-model="scoringSelected"
        :options="scoringSelectOptions"
        label="Scoring"
        label-attribute="label" />
    </UCard>
    <section class="grid 2xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6">
      <PlayersTable
        :data="qbTableData"
        position="QB"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
      <PlayersTable
        :data="rbTableData"
        position="RB"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
      <PlayersTable
        :data="wrTableData"
        position="WR"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
      <PlayersTable
        :data="teTableData"
        position="TE"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
    </section>
  </main>
</template>
