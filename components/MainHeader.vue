<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});

/** Mapping of a tab index, to the corresponding route name */
const tabMapping = ['index', 'tiers'];
const tabItems = [{ label: 'Draft Sheets' }, { label: 'Player Tiers' }];
const activeTab = computed({
  get() {
    const index = tabMapping.findIndex((item) => item === route.name);
    return index === -1 ? 0 : index;
  },
  set(tabValue) {
    router.replace({ name: tabMapping[tabValue] });
  },
});
</script>

<template>
  <header class="flex items-center justify-between sm:flex-row flex-col gap-4">
    <router-link to="/" class="flex items-center gap-1">
      <UIcon name="i-ph-beer-stein-bold" class="h-6 w-6 scale-x-[-1]" />
      <h1 class="text-xl font-bold">DraughtSheets</h1>
    </router-link>
    <div class="flex gap-4 items-center justify-end w-full">
      <UTabs v-model="activeTab" :content="false" :items="tabItems" class="sm:flex-none flex-1" />
      <ClientOnly>
        <UButton
          :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
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
</template>
