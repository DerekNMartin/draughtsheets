<script setup lang="ts">
import type { Player } from '@/types/player';
import { usePlayersStore } from '@/stores/players.js';

const store = usePlayersStore();

defineProps<{ player: Player }>();
const emit = defineEmits(['avatar-click']);

const injuryMapping = {
  Q: 'ring-amber-500',
  O: 'ring-red-500',
};
</script>

<template>
  <div class="flex gap-4 items-center group/player-cell">
    <UTooltip
      :text="
        player.injury &&
        `${player.injury.injury_type} | ${player.injury.comment}`
      "
      :prevent="!Boolean(player.injury)"
    >
      <UAvatar
        :src="player.image"
        :alt="player.player_name"
        :class="[player?.injury?.status_short
                    ? injuryMapping[player?.injury?.status_short as keyof typeof injuryMapping]
                    : 'ring-slate-200 dark:ring-slate-600']"
        class="ring-2 relative cursor-pointer"
      >
        <span
          class="absolute group-hover/player-cell:opacity-100 opacity-0 bg-white dark:bg-slate-800 w-full h-full rounded-full transition-all flex items-center justify-center group/pick hover:bg-blue-50 dark:hover:bg-slate-700"
          @click.stop="emit('avatar-click', player)"
        >
          <UIcon
            :name="
              store.isPlayerPicked(player.player_id)
                ? 'i-ph-minus-bold'
                : 'i-ph-plus-bold'
            "
            class="w-4 h-4 group-hover/player-cell:scale-100 scale-0 transition-transform delay-100 text-blue-800 dark:text-blue-400 group-hover/pick:scale-125"
          />
        </span>
      </UAvatar>
    </UTooltip>
    <div class="flex flex-col">
      <a :href="player.url" target="_blank" @click.stop>
        <h5
          class="font-semibold text-blue-800 dark:text-blue-400 hover:underline"
        >
          {{ player.player_name }}
        </h5>
      </a>
      <span class="text-sm text-neutral-500">{{ player.team }} | {{ player.bye_week }}</span>
    </div>
  </div>
</template>
