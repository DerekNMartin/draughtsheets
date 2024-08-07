<script setup lang="ts">
import type { Player } from '@/types/player';

interface TablePlayer extends Omit<Player, 'scarcity'> {
  scarcity?: { value: number; colour: string };
  vorpColor?: string;
}

const emit = defineEmits(['minMax']);

const props = defineProps<{
  data: Player[];
  header?: string;
  replacement: number;
  minMax: { min: number; max: number };
}>();

const columns = [
  {
    key: 'player_name',
    label: 'Player',
  },
  {
    key: 'rank.roundPick',
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

const replacementPlayer = computed(() => props.data[props.replacement]);

function interpolateRgbColor(
  minColour: string,
  maxColour: string,
  minNum: number,
  maxNum: number,
  value: number
) {
  const shiftAmount = Math.abs(minNum);
  const range = Math.abs(minNum + shiftAmount - (maxNum + shiftAmount));
  const stepFactor = 1 / (range - 1);

  const colour1 = minColour.match(/\d+/g)?.map(Number) || [];
  const colour2 = maxColour.match(/\d+/g)?.map(Number) || [];

  const colorArr = colour1?.map((rgb, index) =>
    Math.round(
      rgb +
        stepFactor *
          (value + shiftAmount - 1) *
          (colour2[index] - colour1[index])
    )
  );

  return `rgb(${colorArr.join(',')})`;
}

function calcVorp(player: Player) {
  const vorp = Number(player.fpts) - Number(replacementPlayer.value?.fpts);
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
          'rgb(34, 211, 238)',
          'rgb(245, 158, 11)',
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
    const vorp = calcVorp(player);
    return {
      ...player,
      vorp,
      vorpColour: interpolateRgbColor(
        'rgb(220, 38, 38)',
        'rgb(34, 197, 94)',
        props.minMax.min,
        props.minMax.max,
        vorp
      ),
    };
  });

  const scarcityTableData = calcScarcity(tableData);
  return scarcityTableData;
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
</script>

<template>
  <UCard>
    <template #header>
      <h2>{{ header }}</h2>
    </template>
    <section>
      <UTable
        :rows="tableData"
        :columns="columns"
        :sort
        :ui="{
          wrapper: 'max-h-[600px] overflow-auto',
          th: {
            base: 'sticky top-0 bg-white z-10',
            padding: 'px-0 pb-4',
          },
          td: { padding: 'px-0 py-1' },
        }">
        <template #player_name-data="{ row }">
          <div class="flex gap-4 items-center">
            <UAvatar
              :src="row.image"
              :alt="row.player_name"
              class="border-2 border-solid border-grey" />
            <div class="flex flex-col">
              <a :href="row.url" target="_blank">
                <h5 class="font-semibold text-blue-700 hover:underline">
                  {{ row.player_name }}
                </h5>
              </a>
              <span>{{ row.team }} | {{ row.bye_week }}</span>
            </div>
          </div>
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
            class="p-1 rounded text-white"
            :style="{ background: row.scarcity.colour }">
            {{ row.scarcity.value }}%
          </span>
        </template>
      </UTable>
    </section>
  </UCard>
</template>
