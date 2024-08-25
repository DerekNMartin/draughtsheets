<script setup lang="ts">
import useSlideover from '@/composables/useSlideover';

const { toggleSlideover } = useSlideover;

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});
</script>

<template>
  <main class="flex gap-6 flex-col p-6">
    <section class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <UIcon name="i-ph-beer-stein-bold" class="h-6 w-6 scale-x-[-1]" />
        <h1 class="text-xl font-bold">DraughtSheets</h1>
      </div>
      <div class="flex gap-2">
        <ClientOnly>
          <UButton
            :icon="
              isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
            "
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark" />
          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
        <UButton color="gray" aria-label="Theme" @click="toggleSlideover">
          My Team
        </UButton>
      </div>
    </section>
    <slot />
  </main>
</template>
