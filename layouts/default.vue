<script setup lang="ts">
const route = useRoute();

const isIndexRoute = computed(() => route.name === 'index');

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
  <main class="grid grid-rows-[auto,1fr,auto] gap-6 flex-col p-6 h-screen">
    <header class="flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-1">
        <UIcon name="i-ph-beer-stein-bold" class="h-6 w-6 scale-x-[-1]" />
        <h1 class="text-xl font-bold">DraughtSheets</h1>
      </router-link>
      <div class="flex gap-4 items-center">
        <router-link
          :to="isIndexRoute ? 'tiers' : '/'"
          class="text-blue-600 hover:underline"
        >
          {{ isIndexRoute ? 'Player Tiers' : 'Draft Sheets' }}
        </router-link>
        <ClientOnly>
          <UButton
            :icon="
              isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'
            "
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
          />
          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
      </div>
    </header>
    <slot />
    <footer
      class="flex justify-between p-6 pb-0 border-t border-solid border-gray-100 items-center"
    >
      <p class="text-sm">
        Crafted by
        <a
          class="text-blue-500 hover:underline"
          href="https://github.com/DerekNMartin"
        >
          Derek Martin
        </a>
      </p>
      <p class="text-sm">
        Data provided by
        <a
          class="text-blue-500 hover:underline"
          href="https://www.fantasypros.com/nfl/"
        >
          FantasyPros
        </a>
      </p>
    </footer>
  </main>
</template>
