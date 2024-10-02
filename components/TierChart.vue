<script setup lang="ts">
import type {
  EChartsOption,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemReturn,
} from 'echarts';

import colors from 'tailwindcss/colors';

import { useScreenSize } from '@/composables/useScreenSize';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  GridComponent,
  TooltipComponent,
  DataZoomInsideComponent,
} from 'echarts/components';
import { ScatterChart, CustomChart } from 'echarts/charts';
import VChart from 'vue-echarts';

use([
  GridComponent,
  CanvasRenderer,
  ScatterChart,
  CustomChart,
  TooltipComponent,
  DataZoomInsideComponent,
]);

const props = defineProps<{ data?: (string | number)[][] }>();

const { isSmScreen } = useScreenSize();

function renderItem(
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI
) {
  const group: CustomSeriesRenderItemReturn = {
    type: 'group',
    children: [],
  };
  const baseDimIdx = 1;
  const otherDimIdx = 1 - baseDimIdx;
  const name = api.value(0) as string;
  const ecr = Number(api.value(1));
  const avg = Number(api.value(2));
  const std = Number(api.value(3));
  const minValue = avg - std / 2;
  const maxValue = avg + std / 2;
  const baseValue = ecr;
  const param = [];
  param[baseDimIdx] = baseValue;
  param[otherDimIdx] = maxValue;
  const highPoint = api.coord(param);
  param[otherDimIdx] = minValue;
  const lowPoint = api.coord(param);
  const halfWidth = 2;
  const style = {
    stroke: api.visual('color'),
    lineWidth: 3,
    opacity: 0.3,
  };
  group.children.push(
    {
      type: 'line',
      transition: ['shape'],
      shape: makeShape(
        highPoint[baseDimIdx] - halfWidth,
        highPoint[otherDimIdx],
        highPoint[baseDimIdx] + halfWidth,
        highPoint[otherDimIdx]
      ),
      style: style,
    },
    {
      type: 'line',
      transition: ['shape'],
      shape: makeShape(
        highPoint[baseDimIdx],
        highPoint[otherDimIdx],
        lowPoint[baseDimIdx],
        lowPoint[otherDimIdx]
      ),
      style: style,
    },
    {
      type: 'line',
      transition: ['shape'],
      shape: makeShape(
        lowPoint[baseDimIdx] - halfWidth,
        lowPoint[otherDimIdx],
        lowPoint[baseDimIdx] + halfWidth,
        lowPoint[otherDimIdx]
      ),
      style: style,
    },
    {
      type: 'text',
      x: highPoint[0] + 6,
      y: highPoint[1] - 6,
      style: { text: name, fill: api.visual('color') as string },
    }
  );
  function makeShape(
    base1: number,
    value1: number,
    base2: number,
    value2: number
  ) {
    const shape: Record<string, number> = {};
    shape.y1 = base1;
    shape.x1 = value1;
    shape.y2 = base2;
    shape.x2 = value2;
    return shape;
  }
  return group;
}

const chartData = computed(() => {
  return props.data?.map((item) => ({
    value: item,
    itemStyle: { color: colours.value[item[4] as number] },
  }));
});

const dimensions = [
  { name: 'name', type: 'ordinal' },
  { name: 'rank', displayName: 'Rank', type: 'number' },
  'avg',
  'std',
  'tier',
  { name: 'grade', displayName: 'Start Grade', type: 'ordinal' },
];

const colours = computed(() => {
  return [
    colors.red[500],
    colors.orange[500],
    colors.amber[500],
    colors.yellow[500],
    colors.lime[500],
    colors.green[500],
    colors.emerald[500],
    colors.teal[500],
    colors.cyan[500],
    colors.blue[500],
    colors.indigo[500],
    colors.purple[500],
    colors.fuchsia[500],
    colors.pink[500],
    colors.rose[500],
  ];
});

const option = computed(() => {
  const boundaryGapMax = isSmScreen.value ? '50%' : '10%';
  return {
    tooltip: {},
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'inside',
        xAxisIndex: [0],
        minSpan: 100,
      },
      {
        id: 'dataZoomY',
        type: 'inside',
        yAxisIndex: [0],
        minSpan: 40,
      },
    ],
    xAxis: {
      type: 'value',
      name: 'Average Expert Rank',
      nameLocation: 'middle',
      nameGap: 25,
      boundaryGap: ['0', boundaryGapMax],
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        align: 'center',
      },
    },
    yAxis: {
      type: 'value',
      name: 'Expert Consensus Rank',
      nameLocation: 'middle',
      nameGap: 20,
      inverse: true,
      boundaryGap: ['0', '1%'],
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        align: 'center',
      },
    },
    grid: {
      containLabel: true,
      top: 10,
      bottom: 20,
      right: 10,
      left: 10,
    },
    series: [
      {
        type: 'scatter',
        name: 'ECR',
        data: chartData.value,
        dimensions: dimensions,
        symbolSize: 7,
        encode: {
          x: 'avg',
          y: 'rank',
          tooltip: ['rank', 'grade'],
          itemName: 0,
        },
        itemStyle: {
          color: (params) => {
            const colourIndex = Array.isArray(params?.data)
              ? (params.data[4] as number) ?? 0
              : 0;
            return colours.value[colourIndex];
          },
        },
      },
      {
        type: 'custom',
        name: 'Avg. Rank',
        data: chartData.value,
        renderItem: renderItem,
        dimensions: dimensions,
        encode: {
          x: ['avg'],
          y: ['avg'],
          tooltip: ['rank', 'grade'],
          itemName: 0,
        },
        tooltip: {
          show: true,
        },
      },
    ],
  } as EChartsOption;
});

const echartsInstance = ref();
window.addEventListener('resize', () => {
  echartsInstance.value?.resize();
});

defineExpose({ chartColours: colours });
</script>

<template>
  <v-chart ref="echartsInstance" class="h-[750px]" :option="option" />
</template>
