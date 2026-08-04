<script setup lang="ts">
function handleFooterLink(event: MouseEvent) {
  const { href, innerText } = event?.target as HTMLLinkElement;
  useTrackEvent('footer_link_clicked', { href, innerText });
}
</script>

<template>
  <footer
    class="flex sm:flex-row flex-col pt-6 border-t border-solid border-gray-100 sm:items-center justify-between gap-4"
  >
    <a
      href="https://www.buymeacoffee.com/derekmartin"
      target="_blank"
      class="p-2 bg-yellow-400 rounded-md w-fit font-bold text-slate-800 hover:bg-yellow-300 transition-colors group wiggle-link flex gap-1 items-center"
      @click="handleFooterLink"
    >
      <span class="wiggle block">🍺</span>
      <span class="text-xs ml-1 mt-0.5">Buy me a beer!</span>
    </a>
    <p class="text-sm">
      Crafted by
      <a
        class="text-blue-500 hover:underline"
        href="https://github.com/DerekNMartin"
        @click="handleFooterLink"
      >
        Derek Martin
      </a>
    </p>
    <p class="text-sm sm:text-end">
      Data provided by
      <a
        class="text-blue-500 hover:underline"
        href="https://www.fantasypros.com/nfl/"
        @click="handleFooterLink"
      >
        FantasyPros
      </a>
    </p>
  </footer>
</template>
