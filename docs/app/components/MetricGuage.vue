<script lang="ts" setup>
const props = defineProps<{
  score?: number
  stripped?: boolean
  label?: string
}>()

const { score, label } = toRefs(props)

const arc = ref(null)

const guageModifiers = computed(() => {
  let result = 'not-applicable'
  if (score.value >= 0.9)
    result = 'pass'
  else if (score.value >= 0.5)
    result = 'average'
  else if (score.value > 0)
    result = 'fail'
  return [
    `guage__wrapper--${result}`,
  ]
})

const guageArcStyle = computed(() => {
  // r = 56
  const r = 65
  // stroke-width = 8
  const n = 2 * Math.PI * r
  const rotationOffset = 0.25 * 8 / n

  let o = score.value * n - r / 2
  if (score.value === 1)
    o = n

  return {
    opacity: score.value === 0 ? '0' : 1,
    transform: `rotate(${360 * rotationOffset - 90}deg)`,
    strokeDasharray: `${Math.max(o, 0)}, ${n}`,
  }
})
</script>

<template>
  <div class="guage__wrapper guage__wrapper--huge" :class="guageModifiers">
    <div
      class="guage__svg-wrapper relative"
    >
      <svg class="guage" viewBox="0 0 120 120">
        <circle
          class="guage-base"
          r="56"
          cx="60"
          cy="60"
          stroke-width="8"
        />
        <circle
          v-if="score !== null"
          ref="arc"
          class="guage-arc"
          r="56"
          cx="60"
          cy="60"
          stroke-width="8"
          :style="guageArcStyle"
        />
      </svg>
      <div
        class="font-5xl font-bold left-[50%] top-[50%] transform -translate-y-[50%] -translate-x-[50%] absolute text-mono font-mono"
      >
        {{ score === null ? '?' : Math.round(score * 100) }}
      </div>
    </div>
    <div class="text-sm mt-2">
      {{ label }}
    </div>
  </div>
</template>

<style>
.guage__wrapper {
  --color-amber-50: #fff8e1;
  --color-blue-200: #90caf9;
  --color-blue-900: #0d47a1;
  --color-blue-A700: #2962ff;
  --color-cyan-500: #00bcd4;
  --color-neutral-100: #f5f5f5;
  --color-neutral-300: #cfcfcf;
  --color-neutral-200: #e0e0e0;
  --color-neutral-400: #bdbdbd;
  --color-neutral-50: #fafafa;
  --color-neutral-500: #9e9e9e;
  --color-neutral-600: #757575;
  --color-neutral-700: #616161;
  --color-neutral-800: #424242;
  --color-neutral-900: #212121;
  --color-gray: #000000;
  --color-green-700: #018642;
  --color-green: #0cce6b;
  --color-lime-400: #d3e156;
  --color-orange-50: #fff3e0;
  --color-orange-700: #d04900;
  --color-orange: #ffa400;
  --color-red-700: #eb0f00;
  --color-red: #ff4e42;
  --color-teal-600: #00897b;
  --color-white: #ffffff;
  --color-average-secondary: var(--color-orange-700);
  --color-average: var(--color-orange);
  --color-fail-secondary: var(--color-red-700);
  --color-fail: var(--color-red);
  --color-hover: var(--color-neutral-50);
  --color-informative: var(--color-blue-900);
  --color-pass-secondary: var(--color-green-700);
  --color-pass: var(--color-green);
  --color-not-applicable: var(--color-neutral-600);
}
.guage__wrapper--pass {
  color: var(--color-pass);
}
.guage__wrapper--average {
  color: var(--color-average);
}
.guage__wrapper--fail {
  color: var(--color-fail);
}
.guage__wrapper--not-applicable {
  color: var(--color-not-applicable);
}

.guage__wrapper--huge {
  --gauge-circle-size: 120px;
}
.guage__wrapper {
  fill: currentColor;
  stroke: currentColor;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-decoration: none;
  padding: var(--score-container-padding);
  --transition-length: 1s;
  contain: content;
  will-change: opacity;
}
.guage__svg-wrapper {
  position: relative;
  height: var(--gauge-circle-size);
}
.guage {
  stroke-linecap: round;
  width: var(--gauge-circle-size);
  height: var(--gauge-circle-size);
}
.guage-base {
  opacity: 0.1;
}
.guage-arc {
  fill: none;
  transform-origin: 50% 50%;
  animation: load-gauge var(--transition-length) ease forwards;
  animation-delay: 250ms;
}
</style>
