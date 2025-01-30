<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import type { CommentFeedbackSchemaOutput, ThumbsFeedbackResponse } from '~~/types/schemas'
import { useTimeoutFn } from '@vueuse/core'
import { CommentFeedbackSchema } from '~~/types/schemas'

defineProps<{
  editLink: string
}>()

const thumbSubmissionStatus = ref<false | 'loading' | 'submitted'>(false)
const commentSubmissionStatus = ref<false | 'loading' | 'submitted'>(false)

const toast = useToast()
const thumbsResponse = ref<ThumbsFeedbackResponse>()

const state = reactive<Partial<CommentFeedbackSchemaOutput>>({
  comment: undefined,
})

function thumbsNextStep(val: ThumbsFeedbackResponse) {
  useTimeoutFn(() => {
    thumbSubmissionStatus.value = 'submitted'
    thumbsResponse.value = val
  }, 300)
}

function thumbs(thumbs: 'up' | 'down') {
  thumbSubmissionStatus.value = 'loading'
  $fetch<ThumbsFeedbackResponse>('/api/feedback-thumbs', {
    method: 'POST',
    body: { thumbs },
  })
    .then(thumbsNextStep)
    .catch((error) => {
      thumbSubmissionStatus.value = false
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    })
}

async function onSubmit(event: FormSubmitEvent<CommentFeedbackSchemaOutput>) {
  commentSubmissionStatus.value = 'loading'
  $fetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(event.data),
  })
    .then(() => {
      toast.add({ title: 'Success', description: 'Your feedback has been submitted, thanks!', color: 'success' })
    })
    .catch((error) => {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    })
    .finally(() => {
      commentSubmissionStatus.value = 'submitted'
    })
}
</script>

<template>
  <div>
    <div class="mb-5 text-sm font-semibold dark:text-neutral-300">
      Did this page help you?
    </div>
    <div class="flex items-center gap-3">
      <template v-if="thumbSubmissionStatus === 'loading'">
        <UIcon name="i-carbon-in-progress" class="w-6 h-6 animate-spin" />
      </template>
      <template v-else-if="thumbSubmissionStatus === 'submitted'">
        <div v-if="thumbsResponse.thumbs === 'up'" class="flex items-center gap-3">
          <UIcon name="i-carbon-thumbs-up" class="w-6 h-6" />
          <span v-if="thumbsResponse.stats.up > 0">{{ thumbsResponse.stats.up }} {{ thumbsResponse.stats.up > 1 ? 'people agree' : 'person agrees' }}</span>
        </div>
        <div v-else class="flex items-center gap-3">
          <UIcon name="i-carbon-thumbs-down" class="w-6 h-6" />
          <span v-if="thumbsResponse.stats.down > 0">{{ thumbsResponse.stats.down }} {{ thumbsResponse.stats.down > 1 ? 'people agree' : 'person agrees' }}</span>
        </div>
      </template>
      <template v-else>
        <UTooltip text="Looks good!">
          <UButton type="button" class="cursor-pointer hover:bg-green-500/10 bg-neutral-500/10 text-neutral-600 dark:text-white" size="lg" @click="thumbs('up')">
            <UIcon name="i-carbon-thumbs-up" class="w-6 h-6" />
          </UButton>
        </UTooltip>
        <UTooltip text="It needs some work.">
          <UButton type="button" class="cursor-pointer hover:bg-red-500/10 bg-neutral-500/10 text-neutral-600  dark:text-white" size="lg" color="neutral" @click="thumbs('down')">
            <UIcon name="i-carbon-thumbs-down" class="w-6 h-6" />
          </UButton>
        </UTooltip>
      </template>
    </div>
    <UCard v-if="thumbSubmissionStatus === 'submitted' && commentSubmissionStatus !== 'submitted'" class="mt-7">
      <template #header>
        <div class="flex items-center justify-between">
          Thank you for your feedback!
          <div>
            <UButton variant="ghost" color="neutral" @click="commentSubmissionStatus = 'submitted'">
              <UIcon name="i-carbon-close" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </template>
      <div class="mb-3">
        Help us improve this page. You can <NuxtLink :to="editLink" target="_blank" class="underline">
          edit this page
        </NuxtLink> on GitHub or provide anonymous feedback below. Be nice :)
      </div>
      <UForm :schema="CommentFeedbackSchema" :state="state" class="space-y-4" :validate-on="['change']" @submit="onSubmit">
        <UFormField label="Comments" name="comment" class="mb-3">
          <UTextarea v-model="state.comment" type="textarea" class="w-full" />
        </UFormField>
        <UButton type="submit" size="sm" color="secondary" :loading="commentSubmissionStatus === 'loading'">
          Submit
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
