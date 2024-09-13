<script setup lang="ts">
import type {
  EChartsOption,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemReturn,
} from 'echarts';

import colors from 'tailwindcss/colors';

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
  const encode = params.encode;
  const ecr = Number(api.value(encode.x[0]));
  const avg = Number(api.value(encode.x[1]));
  const std = Number(api.value(encode.x[2]));
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
  const style = api.style({
    stroke: api.visual('color'),
    lineWidth: 3,
    opacity: 0.3,
  });
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
      textContent: {
        type: 'text',
        invisible: true,
      },
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
      textContent: {
        type: 'text',
        invisible: true,
      },
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

const dimensions = [{ name: 'name', type: 'ordinal' }, 'rank', 'avg', 'std'];

const colours = computed(() => {
  return [
    colors.red[500],
    colors.orange[500],
    colors.amber[500],
    colors.yellow[500],
    colors.green[500],
    colors.emerald[500],
    colors.teal[500],
    colors.cyan[500],
    colors.blue[500],
    colors.purple[500],
    colors.fuchsia[500],
    colors.pink[500],
    colors.rose[500],
  ];
});

const option = computed(() => {
  return {
    tooltip: {},
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'weakFilter',
      },
      {
        id: 'dataZoomY',
        type: 'inside',
        yAxisIndex: [0],
      },
    ],
    xAxis: {
      type: 'value',
      name: 'Average Expert Rank',
      nameLocation: 'middle',
      nameGap: 30,
      boundaryGap: [0, 0.02],
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
      nameGap: 30,
      inverse: true,
      boundaryGap: [0, 0.01],
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
      top: 10,
      bottom: 45,
      right: 10,
      left: 45,
    },
    series: [
      {
        type: 'scatter',
        name: 'ECR',
        data: chartData.value,
        dimensions: dimensions,
        encode: {
          x: 'avg',
          y: 'rank',
          tooltip: ['rank'],
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
          x: ['rank', 'avg', 'std'],
          label: 'name',
        },
        tooltip: {
          show: false,
        },
        label: {
          show: true,
          position: 'right',
        },
      },
    ],
  } as EChartsOption;
});

const echartsInstance = ref();

window.addEventListener('resize', () => {
  echartsInstance.value?.resize();
});
</script>

<template>
  <v-chart ref="echartsInstance" class="h-[500px]" :option="option" />
</template>
