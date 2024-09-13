<script setup lang="ts">
import type { SelectOption } from '@/components/AppSelect.vue';
import { formatOrdinals } from '@/utils/numbers';
import { calculateRoundPick } from '@/utils/strings.js';
import useSlideover from '@/composables/useSlideover';

type PointsMapping = Record<string, Record<string, number>>;

const { toggleSlideover } = useSlideover;

const scoringSelected = defineModel<string>('scoringType');
const scoringSelectOptions: SelectOption[] = [
  { value: 'STD', label: 'Standard' },
  { value: 'PPR', label: 'PPR' },
  { value: 'HALF', label: 'Half PPR' },
];

const leagueSelected = defineModel<number>('leagueSize');
const leagueSelectOptions: SelectOption[] = [
  { value: 8, label: '8 Team' },
  { value: 10, label: '10 Team' },
  { value: 12, label: '12 Team' },
  { value: 14, label: '14 Team' },
];

const pointsMapping = defineModel<PointsMapping>('pointsMapping');

const pickSelected = defineModel<number>('pickNumber');
const pickSelectOptions = computed<SelectOption[]>(() => {
  return Array.from({ length: leagueSelected?.value || 0 }, (_, i) => {
    const pick = i + 1;
    return {
      value: pick,
      label: formatOrdinals(pick),
    };
  });
});

watch(leagueSelected, (newValue) => {
  if (pickSelected?.value && newValue && pickSelected.value > newValue)
    pickSelected.value = Number(pickSelectOptions.value[0].value);
});

const draftPicks = computed(() => {
  const myPicks = [];
  const rounds = 16;
  const numOfTeams = Number(leagueSelected?.value);
  const pickPosition = Number(pickSelected?.value);
  for (let round = 1; round <= rounds; round++) {
    const pick =
      round % 2 === 0 ? numOfTeams - (pickPosition - 1) : pickPosition;
    const pickNumber = (round - 1) * numOfTeams + pick;
    myPicks.push(pickNumber);
  }
  return myPicks;
});

defineExpose({ draftPicks });
</script>

<template>
  <UCard
    :ui="{
      body: {
        base: 'grid sm:grid-cols-3 sm:grid-rows-[1fr,auto] gap-4 items-end',
      },
    }"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <h3>League Settings</h3>
        <UButton
          color="white"
          aria-label="Theme"
          icon="i-ph-users-three-bold"
          @click="toggleSlideover"
        >
          My Team
        </UButton>
      </div>
    </template>
    <AppSelect
      v-model="scoringSelected"
      :options="scoringSelectOptions"
      label="Scoring"
      label-attribute="label"
      value-attribute="value"
    />
    <AppSelect
      v-model="leagueSelected"
      :options="leagueSelectOptions"
      label="League"
      label-attribute="label"
      value-attribute="value"
    />
    <AppSelect
      v-model="pickSelected"
      :options="pickSelectOptions"
      label="Pick"
      label-attribute="label"
      value-attribute="value"
    />
    <section class="sm:flex-row flex-col flex sm:col-span-3 gap-4">
      <div
        v-for="(_, categoryKey) in pointsMapping"
        :key="categoryKey"
        class="flex flex-col"
      >
        <h5
          class="capitalize text-xs font-semibold light:text-slate-600 dark:text-white mb-1"
        >
          {{ categoryKey }}
        </h5>
        <div v-if="pointsMapping" class="flex gap-1 flex-wrap">
          <UInput
            v-for="(value, key) in pointsMapping[categoryKey]"
            :key="`${categoryKey}-${key}`"
            v-model="pointsMapping[categoryKey][key]"
            size="md"
            type="number"
            class="sm:w-28 w-full"
          >
            <template #trailing>
              <span class="text-xs text-slate-500 uppercase">{{ key }}</span>
            </template>
          </UInput>
        </div>
      </div>
    </section>
    <section
      class="flex gap-2 sm:items-center sm:col-span-3 sm:flex-row flex-col"
    >
      <h3 class="text-sm">Picks:</h3>
      <div class="flex gap-2 flex-wrap">
        <p
          v-for="pick in draftPicks"
          :key="pick"
          class="rounded bg-neutral-100 dark:bg-slate-800 py-1 px-2 text-neutral-600 dark:text-slate-400 text-sm font-semibold min-w-16 group text-center cursor-default"
        >
          <span class="group-hover:hidden">{{
            calculateRoundPick(pick, leagueSelected || 0).join(' | ')
          }}</span>
          <span class="group-hover:inline-block hidden">{{ pick }}</span>
        </p>
      </div>
    </section>
  </UCard>
</template>
