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
  <main class="grid grid-rows-[auto,1fr,auto] gap-6 flex-col p-6 min-h-screen">
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
      class="flex sm:flex-row flex-col pt-6 border-t border-solid border-gray-100 sm:items-center justify-between gap-4"
    >
      <a
        href="https://www.buymeacoffee.com/derekmartin"
        target="_blank"
        class="p-2 bg-yellow-400 rounded-md w-fit font-bold text-slate-800 hover:bg-yellow-300 transition-colors group wiggle-link flex gap-1 items-center"
      >
        <span class="wiggle block">🍺</span>
        <span class="text-xs ml-1 mt-0.5">CHEERS!</span>
      </a>
      <p class="text-sm">
        Crafted by
        <a
          class="text-blue-500 hover:underline"
          href="https://github.com/DerekNMartin"
        >
          Derek Martin
        </a>
      </p>
      <p class="text-sm sm:text-end">
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

<style>
.wiggle-link:hover .wiggle {
  animation-play-state: running;
}
.wiggle {
  animation: wiggle 400ms linear infinite alternate;
  animation-play-state: paused;
}
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
}
</style>
