<script setup lang="ts">
import type { AvatarChipColor } from '#ui/types';

const props = defineProps<{ team?: string }>();

const {
  data: teamPlayers,
  execute,
  status,
} = useFetch('/api/depthchart', {
  immediate: false,
  query: { team: props.team },
});
const isLoading = computed(() => status.value === 'pending');

function chipMapping(position: string) {
  const mapping = {
    QB: 'red',
    WR: 'green',
    RB: 'blue',
    TE: 'yellow',
  };
  return mapping[position as keyof typeof mapping] as AvatarChipColor;
}

onMounted(() => {
  execute();
});
</script>

<template>
  <div class="p-4 rounded-lg">
    <p v-if="isLoading">Loading...</p>
    <div v-else>
      <p class="mb-2">Top Players</p>
      <div class="grid grid-cols-2 grid-rows-2 gap-4">
        <div
          v-for="player in teamPlayers"
          :key="player.id"
          class="flex gap-2 items-center object-cover"
        >
          <UAvatar
            size="lg"
            :src="player.headshot.href"
            :alt="player.headshot.alt"
            class="ring-2"
            :chip-color="chipMapping(player.position.abbreviation)"
            :chip-text="player.position.abbreviation"
            chip-position="bottom-right"
            img-class="object-cover"
          />
          <div class="flex flex-col">
            <p class="font-semibold text-neutral-800">{{ player.fullName }}</p>
            <p class="text-xs">
              EXP | {{ player.experience.years > 0 ? player.experience.years : 'Rookie' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
