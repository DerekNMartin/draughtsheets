<script setup lang="ts">
export type SelectOption = { value: string | number; label: string };

interface AppSelectProps {
  options: SelectOption[] | string[] | number[];
  label?: string;
  labelAttribute?: string;
  valueAttribute?: string;
}

const props = defineProps<AppSelectProps>();
const selected = defineModel<SelectOption | string | number>();

const computedLabel = computed(() => {
  const value = props.options.find((option) => {
    if (typeof option === 'object' && 'value' in option) {
      return option.value === selected.value;
    }
  });
  return typeof value === 'object' && 'label' in value
    ? value.label
    : selected.value;
});
</script>

<template>
  <div class="AppSelect">
    <label
      v-if="label"
      class="text-xs font-semibold light:text-slate-600 dark:text-white">
      {{ label }}
    </label>
    <USelectMenu
      v-slot="{ open }"
      v-model="selected"
      class="h-full"
      :options
      :value-attribute
      :option-attribute="labelAttribute">
      <UButton
        color="white"
        class="flex-1 justify-between h-10"
        :class="{
          'ring-2 ring-primary-500 dark:ring-primary-400': open,
        }">
        {{ computedLabel }}
        <UIcon
          name="i-heroicons-chevron-down-20-solid"
          class="w-5 h-5 transition-transform"
          :class="{ 'transform rotate-180': open }" />
      </UButton>
    </USelectMenu>
  </div>
</template>
