<script setup lang="ts">
defineProps<{ teamOptions: string[] }>();
const searchValue = defineModel<string>('search');
const teamSelected = defineModel<string>('team');
</script>

<template>
  <UCard
    :ui="{
      body: {
        base: 'grid sm:grid-cols-[2fr,1fr] gap-4 items-end',
      },
    }">
    <div>
      <label class="text-xs font-semibold light:text-slate-600 dark:text-white">
        Search
      </label>
      <UInput
        v-model="searchValue"
        placeholder="Search player..."
        icon="i-heroicons-magnifying-glass-20-solid"
        size="lg" />
    </div>
    <AppSelect v-model="teamSelected" :options="teamOptions" label="Team" />
  </UCard>
</template>
