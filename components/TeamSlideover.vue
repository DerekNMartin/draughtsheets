<script setup lang="ts">
import { usePlayersStore } from '@/stores/players';
const store = usePlayersStore();
const isOpen = defineModel<boolean>();
const teamPicks = computed(() => store.teamPicks);
</script>

<template>
  <USlideover
    v-model="isOpen"
    :overlay="false"
    :ui="{ base: 'border-l border-solid border-slate-100 drop-shadow-lg' }">
    <div class="flex p-6 gap-6 flex-col">
      <section class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">My Team</h2>
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          icon="i-ph-x-bold"
          square
          padded
          @click="isOpen = false" />
      </section>
      <p v-for="player in teamPicks" :key="player.player_id">
        {{ player.player_name }}
      </p>
    </div>
  </USlideover>
</template>
