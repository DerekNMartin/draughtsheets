const isSlideoverOpen = ref(false);

function toggleSlideover() {
  isSlideoverOpen.value = !isSlideoverOpen.value;
}

export default { isSlideoverOpen, toggleSlideover };
