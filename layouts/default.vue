<script setup lang="ts"></script>

<template>
  <main class="grid grid-rows-[auto,1fr,auto] gap-6 flex-col p-6 min-h-screen">
    <MainHeader />
    <slot />
    <MainFooter />
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
