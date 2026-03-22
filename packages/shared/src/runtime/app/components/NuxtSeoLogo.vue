<template>
  <div class="flex items-center gap-1">
    <svg viewBox="0 0 64 64" class="pop-quick w-7 h-7">
      <defs>
        <linearGradient id="wmLine1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="100%" stop-color="#86efac" />
        </linearGradient>
        <linearGradient id="wmFill1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#22c55e" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path
        class="fill"
        d="M8 52 Q20 48 24 36 T40 20 T56 12 L56 56 L8 56 Z"
        fill="url(#wmFill1)"
      />
      <path
        class="line"
        d="M8 52 Q20 48 24 36 T40 20 T56 12"
        fill="none"
        stroke="url(#wmLine1)"
        stroke-width="4"
        stroke-linecap="round"
      />
      <circle class="node" cx="56" cy="12" r="6" fill="url(#wmLine1)" />
    </svg>
    <span class="-ml-1 dark:text-white text-black text-lg font-bold tracking-tight slide-right">
      Nuxt<span class="ml-1 text-green-400">SEO</span>
    </span>
  </div>
</template>

<style scoped>
@keyframes drawLine {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}
@keyframes revealFill {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0% 0 0); }
}
@keyframes popNode {
  0%, 70% { opacity: 0; transform: scale(0); }
  85% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes slideRight {
  from {
    transform: scale(0.6) translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.pop-quick .line {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: drawLine 0.8s ease-out forwards;
}
.pop-quick .fill {
  clip-path: inset(0 100% 0 0);
  animation: revealFill 0.4s ease-out forwards;
}
.pop-quick .node {
  opacity: 0;
  transform-origin: 56px 12px;
  animation: popNode 0.6s ease-out forwards;
}
.slide-right {
  animation: slideRight 400ms cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}
</style>
