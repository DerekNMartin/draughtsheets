<script setup lang="ts">
import type { Player } from '@/types/player';

const props = defineProps<{
  data: Player[];
  header?: string;
  replacement: number;
}>();

const columns = [
  {
    key: 'player_name',
    label: 'Player',
  },
  {
    key: 'fpts',
    label: 'Projected Points',
    sortable: true,
    direction: 'desc',
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
    key: 'scarcity',
    label: 'Scarcity',
  },
];

const sort = ref({
  column: 'vorp',
  direction: 'desc',
});

const replacementPlayer = computed(() => props.data[props.replacement]);

function calculateVorp(player: Player) {
  const vorp = Number(player.fpts) - Number(replacementPlayer.value?.fpts);
  return replacementPlayer.value ? Number(vorp.toFixed(1)) : 0;
}

const tableData = computed(() => {
  const tableData: Player[] = props.data.map((player) => {
    return {
      ...player,
      vorp: calculateVorp(player),
    };
  });

  const totalValue = tableData.reduce(
    (sum, { vorp }) => (vorp && vorp > 0 ? sum + vorp : sum),
    0
  );

  const scarcity = tableData
    .sort((a, b) => (b.vorp || 0) - (a.vorp || 0))
    .reduce<Player[]>((prev, curr, index, original) => {
      const removedValues = original
        .slice(0, index + 1)
        .reduce((sum, { vorp }) => (vorp && vorp > 0 ? sum + vorp : sum), 0);
      const remainingTotal = totalValue - removedValues;
      const percentageRemaining = Math.round(
        (remainingTotal / totalValue) * 100
      );
      curr.scarcity = percentageRemaining;
      prev.push(curr);
      return prev;
    }, []);

  return scarcity;
});
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
                <h5 class="font-semibold text-primary-600 hover:underline">
                  {{ row.player_name }}
                </h5>
              </a>
              <span>{{ row.team }} | {{ row.bye_week }}</span>
            </div>
          </div>
        </template>
      </UTable>
    </section>
  </UCard>
</template>
