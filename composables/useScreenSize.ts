export const smWidth = 640;
export const mdWidth = 768;
export const lgWidth = 1024;
export const xlWidth = 1280;
export const xxlWidth = 1536;

export function useScreenSize() {
  const windowWidth = ref(window.innerWidth);
  const windowHeight = ref(window.innerHeight);

  const isSmScreen = computed(() => windowWidth.value <= smWidth);
  const isMdScreen = computed(() => windowWidth.value <= mdWidth);
  const isLgScreen = computed(() => windowWidth.value <= lgWidth);
  const isXlScreen = computed(() => windowWidth.value <= xlWidth);
  const isXxlScreen = computed(() => windowWidth.value <= xxlWidth);

  function setWindowSize() {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  }

  onMounted(() => window.addEventListener('resize', setWindowSize));
  onUnmounted(() => window.removeEventListener('resize', setWindowSize));

  return {
    windowWidth,
    windowHeight,
    isSmScreen,
    isMdScreen,
    isLgScreen,
    isXlScreen,
    isXxlScreen,
  };
}
