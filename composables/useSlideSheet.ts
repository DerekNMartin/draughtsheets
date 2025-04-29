const isSlideSheetOpen = ref(false);

function toggleSlideSheet() {
  isSlideSheetOpen.value = !isSlideSheetOpen.value;
}

export default { isSlideSheetOpen, toggleSlideSheet };
