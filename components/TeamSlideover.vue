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
    :ui="{
      base: 'border-l border-solid border-slate-100 drop-shadow-lg dark:border-slate-800',
    }"
  >
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
          @click="isOpen = false"
        />
      </section>
      <ul v-if="teamPicks.length" class="flex flex-col">
        <li
          v-for="player in teamPicks"
          :key="player.player_id"
          class="py-2 border-b border-solid border-neutral-200 last:border-none"
        >
          <PlayerAvatar :player="player" @avatar-click="store.pickPlayer" />
        </li>
      </ul>
      <div v-else>
        <UAlert
          title="Add players"
          description="Click a player head to add them to your team!"
          icon="i-ph-plus-bold"
          variant="solid"
        />
      </div>
    </div>
  </USlideover>
</template>
