<script setup lang="ts">
import type { Player, Position } from '@/types/player';
import { interpolateRgbColor } from '@/utils/color.js';

interface TablePlayer extends Omit<Player, 'scarcity'> {
  scarcity?: { value: number; colour: string };
  vorpColor?: string;
}

const emit = defineEmits(['minMax']);

const props = defineProps<{
  data: Player[];
  header?: string;
  search?: string;
  filter?: { team: string };
  minMax: { min: number; max: number };
  position: Exclude<Position, 'DST'>;
  picks?: number[];
}>();

const columns = [
  {
    key: 'player_name',
    label: 'Player',
  },
  {
    key: 'round_pick',
    label: 'ECR',
  },
  {
    key: 'vorp',
    label: 'VAL',
    sortable: true,
  },
  {
    key: 'fpts',
    label: 'Projected',
    sortable: true,
    direction: 'desc',
  },
  {
    key: 'scarcity',
    label: 'Scarcity',
  },
];

const sort = ref({
  column: 'vorp',
  direction: 'desc',
});

// TODO: Adjust replacement based on leage team size
const positionTableType = computed(() => {
  const mapping: Record<
    Exclude<Position, 'DST'>,
    { title: string; replacement: number; ring: string }
  > = {
    QB: {
      title: 'Quarterback',
      replacement: 15,
      ring: 'ring-red-200 dark:ring-red-300',
    },
    RB: {
      title: 'Running Back',
      replacement: 36,
      ring: 'ring-blue-200 dark:ring-blue-300',
    },
    WR: {
      title: 'Wide Receiver',
      replacement: 46,
      ring: 'ring-emerald-300 dark:ring-emerald-300',
    },
    TE: {
      title: 'Tight End',
      replacement: 17,
      ring: 'ring-amber-300 dark:ring-amber-200',
    },
  };
  return mapping[props.position];
});
const replacementValue = ref(positionTableType.value.replacement);
const replacementPlayer = computed(() => props.data[replacementValue.value]);
function calcVorp(projectedPoints?: string | number) {
  const vorp = Number(projectedPoints) - Number(replacementPlayer.value?.fpts);
  return replacementPlayer.value ? Number(vorp.toFixed(1)) : 0;
}

function calcScarcity(data: Player[]) {
  const totalValue = data.reduce(
    (sum, { vorp }) => (vorp && vorp > 0 ? sum + vorp : sum),
    0
  );
  return data
    .sort((a, b) => (b.vorp || 0) - (a.vorp || 0))
    .reduce<TablePlayer[]>((prev, curr, index, original) => {
      const tablePlayer = curr as TablePlayer;
      const removedValues = original
        .slice(0, index + 1)
        .reduce((sum, { vorp }) => (vorp && vorp > 0 ? sum + vorp : sum), 0);
      const remainingTotal = totalValue - removedValues;
      const percentageRemaining = Math.round(
        (remainingTotal / totalValue) * 100
      );
      tablePlayer.scarcity = {
        value: percentageRemaining,
        colour: interpolateRgbColor(
          'rgb(199, 210, 254)',
          'rgb(254, 215, 170)',
          0,
          100,
          percentageRemaining
        ),
      };
      prev.push(tablePlayer);
      return prev;
    }, []);
}

const tableData = computed(() => {
  const tableData: Player[] = props.data.map((player) => {
    const vorp = calcVorp(player?.fpts);
    return {
      ...player,
      vorp,
      vorpColour: interpolateRgbColor(
        'rgb(220, 38, 38)',
        'rgb(5, 150, 105)',
        props.minMax.min,
        props.minMax.max,
        vorp
      ),
    };
  });

  const scarcityTableData = calcScarcity(tableData);
  return scarcityTableData;
});

const filteredData = computed(() => {
  if (!props?.search && props.filter?.team === 'All') return tableData.value;
  return tableData.value
    .filter(({ player_name }) => {
      return player_name
        .toLowerCase()
        .includes(props?.search?.toLowerCase() || '');
    })
    .filter(({ team }) => {
      return props.filter?.team === 'All' ? true : team === props.filter?.team;
    });
});

const minMaxPlayerValue = computed(() => {
  const allVorp = tableData.value.map(({ vorp }) => vorp || 0);
  return {
    min: Math.min(...allVorp),
    max: Math.max(...allVorp),
  };
});
watch(
  minMaxPlayerValue,
  (newValue) => {
    emit('minMax', newValue);
  },
  { immediate: true }
);

const injuryMapping = {
  Q: 'ring-amber-500',
  O: 'ring-red-500',
};
</script>

<template>
  <UCard
    :ui="{ ring: positionTableType.ring, body: { padding: 'sm:p-0 p-0' } }">
    <template #header>
      <section
        class="flex sm:justify-between sm:items-center sm:flex-row flex-col gap-2">
        <h2 class="font-semibold">{{ positionTableType.title }}</h2>
        <div class="flex items-center gap-1">
          <label class="text-xs">Replacement</label>
          <UInput
            v-model="replacementValue"
            size="xs"
            type="number"
            class="w-16" />
          <UTooltip :text="replacementPlayer.player_name">
            <UAvatar
              :src="replacementPlayer.image"
              :alt="replacementPlayer.player_name"
              class="ring-2 ring-slate-200 dark:ring-slate-700" />
          </UTooltip>
        </div>
      </section>
    </template>
    <section>
      <UTable
        :rows="filteredData"
        :columns="columns"
        :sort
        :ui="{
          wrapper: 'h-[600px] overflow-auto',
          th: {
            base: 'sticky top-0 bg-white dark:bg-gray-900 z-10',
            padding: 'px-2 py-4',
          },
          td: { padding: 'px-2 py-1' },
        }">
        <template #player_name-data="{ row }">
          <div class="flex gap-4 items-center">
            <UTooltip
              :text="
                row.injury &&
                `${row.injury.injury_type} | ${row.injury.comment}`
              "
              :prevent="!Boolean(row.injury)">
              <UAvatar
                :src="row.image"
                :alt="row.player_name"
                :class="[row?.injury?.status_short
                    ? injuryMapping[row?.injury?.status_short as keyof typeof injuryMapping]
                    : 'ring-slate-200 dark:ring-slate-700']"
                class="ring-2" />
            </UTooltip>
            <div class="flex flex-col">
              <a :href="row.url" target="_blank">
                <h5
                  class="font-semibold text-blue-800 dark:text-blue-400 hover:underline">
                  {{ row.player_name }}
                </h5>
              </a>
              <span>{{ row.team }} | {{ row.bye_week }}</span>
            </div>
          </div>
        </template>
        <template #round_pick-data="{ row }">
          <span
            :class="{
              'text-neutral-800 dark:text-slate-200 font-bold': picks?.includes(
                row.rank.ecr
              ),
            }">
            {{ row.round_pick }}
          </span>
        </template>
        <template #vorp-data="{ row }">
          <span
            class="p-1 rounded text-white font-bold"
            :style="{ background: row.vorpColour }">
            {{ row.vorp }}
          </span>
        </template>
        <template #scarcity-data="{ row }">
          <span
            class="p-1 rounded text-neutral-800"
            :style="{ background: row.scarcity.colour }">
            {{ row.scarcity.value }}%
          </span>
        </template>
      </UTable>
    </section>
  </UCard>
</template>
