<script lang="ts" setup>
const props = defineProps<{
  to?: string
  label: string
  description: string
  repo?: string
  tag?: { to: string; label: string }
}>()

const NuxtLink = resolveComponent('NuxtLink')
const linkAttrs = computed(() => {
  const attrs: Record<string, string> = {}
  if (props.to)
    attrs.to = props.to
  return attrs
})
</script>

<template>
  <div class="showcase-card relative h-full">
    <component :is="to ? NuxtLink : 'div'" v-bind="linkAttrs" class="h-full">
      <div class="group relative border hover:border-blue-400 transition rounded-xl overflow-hidden h-full">
        <div
          class="h-48 relative flex items-center justify-center bg-no-repeat bg-cover border-b-2 border-gray-100/30 dark:border-gray-900/10"
          style="background-image: url('/grid.png')"
        >
          <div
            class="blur-overlay w-full h-full absolute pointer-events-none"
          />
          <div class="z-10 text-blue-200 group-hover:text-[1.25rem] w-full h-full flex items-center justify-center group-hover:text-blue-500 transition-all relative">
            <slot />
          </div>
          <slot name="teleport" />
        </div>

        <div class="p-4">
          <h3 class="font-semibold">
            {{ label }}
          </h3>
          <p class="text-sm mt-1 text-gray-400">
            {{ description }}
          </p>

          <div v-if="repo" class="flex text-gray-500 items-center justify-between mt-5">
            <NuxtLink :to="`https://github.com/${repo}`" class="hover:opacity-70 transition text-sm">
              {{ repo }}
            </NuxtLink>
            <LegoGithubStar v-slot="{ stars }" :repo="repo" class="items-center inline-flex justify-center px-1 ">
              <Icon name="uil:star" class="text-sm text-blue-300 group-hover:op75" />
              <div class="px-1 text-sm">
                {{ stars }}
              </div>
            </LegoGithubStar>
          </div>
          <div v-else class="text-sm flex text-gray-500 items-center justify-between mt-5">
            Not Published
          </div>

          <UButton v-if="tag" :to="tag.to" :padded="false" size="xs" class="group z-20 absolute top-4 right-4">
            <UBadge size="xs" class="hover:shadow transition">
              {{ tag.label }}
            </UBadge>
          </UButton>
          <UBadge v-else color="gray" size="xs" class="z-20 absolute top-4 right-4">
            Coming soon
          </UBadge>
        </div>
      </div>
    </component>
  </div>
</template>
