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

const scoringSelectOptions = [
  { id: 'std', label: 'Standard' },
  { id: 'ppr', label: 'PPR' },
  { id: 'half', label: 'Half PPR' },
];
const scoringSelected = ref(scoringSelectOptions[0]);

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
</script>

<template>
  <main class="flex gap-6 flex-col p-6">
    <section>
      <div class="flex items-center gap-1">
        <UIcon name="i-ph-beer-stein-bold" class="h-6 w-6 scale-x-[-1]" />
        <h1 class="text-xl font-bold">DraughtSheets</h1>
      </div>
    </section>
    <UCard
      :ui="{ body: { base: 'grid grid-cols-[3fr,1fr,1fr] gap-4 items-end' } }">
      <div>
        <label class="text-xs font-semibold text-slate-600">Search</label>
        <UInput
          v-model="searchValue"
          placeholder="Search player..."
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg" />
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-600">Team</label>
        <USelectMenu
          v-slot="{ open }"
          v-model="teamSelected"
          class="h-full"
          :options="teamSelectOptions">
          <UButton
            color="white"
            class="flex-1 justify-between h-10"
            :class="{
              'ring-2 ring-primary-500 dark:ring-primary-400': open,
            }">
            {{ teamSelected }}
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              class="w-5 h-5 transition-transform"
              :class="{ 'transform rotate-180': open }" />
          </UButton>
        </USelectMenu>
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-600">Scoring</label>
        <USelectMenu
          v-slot="{ open }"
          v-model="scoringSelected"
          class="h-full"
          :options="scoringSelectOptions">
          <UButton
            color="white"
            class="flex-1 justify-between h-10"
            :class="{
              'ring-2 ring-primary-500 dark:ring-primary-400': open,
            }">
            {{ scoringSelected.label }}
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              class="w-5 h-5 transition-transform"
              :class="{ 'transform rotate-180': open }" />
          </UButton>
        </USelectMenu>
      </div>
    </UCard>
    <section class="grid 2xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6">
      <PlayersTable
        :data="qbTableData"
        header="Quarterback"
        :replacement="15"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
      <PlayersTable
        :data="rbTableData"
        header="Running Back"
        :replacement="36"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
      <PlayersTable
        :data="wrTableData"
        header="Wide Receiver"
        :replacement="46"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
      <PlayersTable
        :data="teTableData"
        header="Tight End"
        :replacement="17"
        :min-max="combinedMinMax"
        :search="searchValue"
        :filter
        @min-max="handleMinMax" />
    </section>
  </main>
</template>
