<script setup lang="ts">
const uiElements = [
  {
    label: 'Breadcrumbs',
  },
  {
    label: 'Review Snippet',
  },
  {
    label: 'FAQ',
  },
  {
    label: 'Carousel',
  },
  {
    label: 'Image',
  },
  {
    label: 'Video',
  }
]
</script>

<template>
  <div>
    <Gradient class="absolute w-full left-0 top-0 z-[-1]" />
    <section class="py-5 sm:py-10 xl:py-20">
      <h2 class="mb-10 text-3xl font-title">
        UI Elements
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ShowcaseCard v-for="(module, key) in uiElements" v-bind="module" :key="key" class="group">
          <template v-if="module.icon">
            <Icon :name="module.icon" size="150" :class="module.label === 'Robots' ? ['transition group-hover:opacity-0'] : []" />
          </template>
        </ShowcaseCard>
      </div>
    </section>
  </div>
</template>
