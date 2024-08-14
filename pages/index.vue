<script setup lang="ts">
import type { Player, Position } from '@/types/player.ts';
import { formatOrdinals } from '@/utils/numbers';

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
watch(scoringSelected, ({ id }) => {
  if (id === 'STD') pointsMapping.receiving.rec = 0;
  if (id === 'PPR') pointsMapping.receiving.rec = 1;
  if (id === 'HALF') pointsMapping.receiving.rec = 0.5;
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
  return [round, String(pick).padStart(2, '0')];
}

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
        image: playerData.player_image_url,
        bye_week: playerData.player_bye_week,
        tier: playerData.tier,
        fpts: calculateTotalPoints(stats),
        round_pick: calculateRoundPick(playerData.rank_ecr).join(' | '),
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
    QB: leagueSelected.value.id,
    RB: leagueSelected.value.id * 2,
    WR: leagueSelected.value.id * 3,
    TE: leagueSelected.value.id,
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

const qbTableData = computed(() => {
  const players = allPlayerData.value.filter(
    (player) => player.position === 'QB'
  );
  return calculateVorp(players, 'QB');
});
const rbTableData = computed(() => {
  const players = allPlayerData.value.filter(
    (player) => player.position === 'RB'
  );
  return calculateVorp(players, 'RB');
});
const wrTableData = computed(() => {
  const players = allPlayerData.value.filter(
    (player) => player.position === 'WR'
  );
  return calculateVorp(players, 'WR');
});
const teTableData = computed(() => {
  const players = allPlayerData.value.filter(
    (player) => player.position === 'TE'
  );
  return calculateVorp(players, 'TE');
});

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

const pickSelectOptions = computed(() => {
  return Array.from({ length: leagueSelected.value.id }, (_, i) => {
    const pick = i + 1;
    return {
      id: pick,
      label: formatOrdinals(pick),
    };
  });
});
const pickSelected = ref(pickSelectOptions.value[0]);
watch(leagueSelected, (newValue) => {
  if (pickSelected.value.id > newValue.id)
    pickSelected.value = pickSelectOptions.value[0];
});
const myDraftPicks = computed(() => {
  const myPicks = [];
  const rounds = 16;
  const teams = leagueSelected.value.id;
  const position = pickSelected.value.id;
  for (let round = 1; round <= rounds; round++) {
    const pick = round % 2 === 0 ? teams - (position - 1) : position;
    const pickNumber = (round - 1) * teams + pick;
    myPicks.push(pickNumber);
  }
  return myPicks;
});

const searchValue = ref();

const filter = computed(() => {
  return {
    team: teamSelected.value,
  };
});
</script>

<template>
  <div class="flex gap-6 flex-col">
    <UCard
      :ui="{
        body: {
          base: 'grid sm:grid-cols-3 sm:grid-rows-[1fr,auto] gap-4 items-end',
        },
      }">
      <AppSelect
        v-model="scoringSelected"
        :options="scoringSelectOptions"
        label="Scoring"
        label-attribute="label" />
      <AppSelect
        v-model="leagueSelected"
        :options="leagueSelectOptions"
        label="League"
        label-attribute="label" />
      <AppSelect
        v-model="pickSelected"
        :options="pickSelectOptions"
        label="Pick"
        label-attribute="label" />
      <section class="sm:flex-row flex-col flex sm:col-span-3 gap-4">
        <div
          v-for="(_, categoryKey) in pointsMapping"
          :key="categoryKey"
          class="flex flex-col">
          <h5
            class="capitalize text-xs font-semibold light:text-slate-600 dark:text-white mb-1">
            {{ categoryKey }}
          </h5>
          <div class="flex gap-1 flex-wrap">
            <UInput
              v-for="(value, key) in pointsMapping[categoryKey]"
              :key="`${categoryKey}-${key}`"
              v-model="pointsMapping[categoryKey][key]"
              size="md"
              type="number"
              class="sm:w-28 w-full">
              <template #trailing>
                <span class="text-xs text-slate-500 uppercase">{{ key }}</span>
              </template>
            </UInput>
          </div>
        </div>
      </section>
      <section
        class="flex gap-2 sm:items-center sm:col-span-3 sm:flex-row flex-col">
        <h3 class="text-sm">Picks:</h3>
        <div class="flex gap-2 flex-wrap">
          <p
            v-for="pick in myDraftPicks"
            :key="pick"
            class="rounded bg-neutral-100 dark:bg-slate-800 py-1 px-2 text-neutral-600 dark:text-slate-400 text-sm font-semibold min-w-fit">
            {{ calculateRoundPick(pick).join(' | ') }}
          </p>
        </div>
      </section>
    </UCard>
    <UCard
      :ui="{
        body: {
          base: 'grid sm:grid-cols-[2fr,1fr] gap-4 items-end',
        },
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
    </UCard>
    <section class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      <PlayersTable
        position="QB"
        :data="qbTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="myDraftPicks" />
      <PlayersTable
        position="RB"
        :data="rbTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="myDraftPicks" />
      <PlayersTable
        position="WR"
        :data="wrTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="myDraftPicks" />
      <PlayersTable
        position="TE"
        :data="teTableData"
        :min-max="minMaxVorp"
        :search="searchValue"
        :filter
        :picks="myDraftPicks" />
    </section>
  </div>
</template>
