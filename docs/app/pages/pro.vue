<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { ProEmailSchemaOutput, ProWaitlistFeedbackSchemaOutput } from '~~/types/schemas'
import {
  ProEmailSchema,

  ProWaitlistFeedbackSchema,

} from '~~/types/schemas'
import { reviews } from '~/composables/data'
import { proAd } from '~/utils/ads'

const faq = [
  {
    label: 'When will Nuxt SEO Pro be available?',
    content: 'Nuxt SEO Pro will be available in 2025 in Q1 and will likely be introduced with the Redirects and Google Search Console modules. Other modules are scheduled to be available in 2025 Q2.',
  },
  {
    label: 'Can I get a refund if I change my mind?',
    content: 'You can request a refund at any point up to a month after the Nuxt SEO Pro official release scheduled for Q1 2025.',
  },
  {
    label: 'What is a project?',
    content: 'A project is considered to be one Git repository or a single production site. Staging and tests sites don\'t count towards being a project.',
  },
  {
    label: 'What if the modules are delayed or change in scope?',
    content: 'Updates will be given over email, you are free to request a refund at any time.',
  },
  {
    label: 'Do you offer technical support?',
    content: 'Yes, anyone purchasing a license will have Discord support, you are also free to email me at harlan@harlanzw.com.',
  },
]

const magicRedirects = `
Setting simple redirects in Nuxt is easy. Your choices are either to use \`routeRules\` or server middleware.

::code-group

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig{
  routeRules: {
    '/foo': { redirect: { to: 'bar', statusCode: 301 } },
  },
})
\`\`\`

\`\`\`ts [serverMiddleware.ts]
export default defineEventHandler(e => {
  if (e.path.startsWith('/foo')) {
    sendRedirect(e, '/bar', 301)
  }
})
\`\`\`

::

However, redirects get complicated:

- Potential negative SEO when you forget to set them.
- Limited advanced pattern matching for static environments.
- Annoying DX with full Nuxt reload when you modify redirects
- Finding 404s to add redirects for

The Redirects module will solve these problems and more by providing a zero-config solution that feels like magic. It is scheduled for Q1 2025.
`

const gsc = `
Google Search Console has valuable data about your site and its organic growth.

While this data is accessible
through the Google Search Console website, it can be difficult to drill down into what you want.

For example, if you wanted to check the top keywords for a specific page and see how they are trending, you would need
to manually figure it out by comparing data yourself.

In my work through [Request Indexing](https://requestindexing.com) I have a deep knowledge of the Google Search Console API and how to use it to
get the most out of your data that can help you inform choices that will grow your organic traffic.

The module will allow you to open the Nuxt DevTools and see exactly which keywords are generating traffic to your pages and how
they're trending and which pages may be competing on keywords.

You'll own the data and be able to make informed decisions on how to grow your organic traffic.
`

const linkChecker = `
Google loves it when you have a good internal linking structure. It helps them understand your site better and can help you rank higher.

However, it can be difficult to always remember to link to the right pages, especially as your site grows.

This add-on is an extension to the Link Checker module that will give you suggestions on internal links to implement right in your DevTools
and when prerendering.
`

const seoAnalyze = `
It's easy to forget to add SEO tags to your pages, or to add them incorrectly. This can lead to poor search engine rankings and less traffic to your site.

The SEO Analyze module will inspect your pages in real-time and build-time to validate that all tags are set up correctly.

It will also provide suggestions on how to improve your SEO tags to help you rank higher in search engines.
`

const daysUntilQ1 = computed(() => {
  // we want the middle of q1, so probably middle of feb
  const now = new Date()
  const newYear = new Date(now.getFullYear() + 1, 1, 15)
  return Math.floor((newYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
})

const waitlistFeedbackStatus = ref<'loading' | 'submitted'>()
const waitlistFeedbackState = reactive<ProWaitlistFeedbackSchemaOutput>({
  comment: '',
})

const waitlistStatus = ref<'loading' | 'submitted'>()
const waitlistState = reactive<ProEmailSchemaOutput>({
  email: '',
})
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<ProEmailSchemaOutput>) {
  proAd.value = false
  waitlistStatus.value = 'loading'
  $fetch('/api/pro-waitlist', {
    method: 'POST',
    body: JSON.stringify(event.data),
  })
    .then(() => {
      toast.add({ title: 'Success', description: 'You\'ve signed up, thanks!', color: 'success' })
    })
    .catch((error) => {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    })
    .finally(() => {
      waitlistStatus.value = 'submitted'
    })
}

const [DefineSectionTemplate, ReuseSectionTemplate] = createReusableTemplate()

function onSubmitProWaitlistFeedback(event: FormSubmitEvent<ProWaitlistFeedbackSchemaOutput>) {
  waitlistFeedbackStatus.value = 'loading'
  $fetch('/api/pro-waitlist-feedback', {
    method: 'POST',
    body: JSON.stringify(event.data),
  })
    .then(() => {
      toast.add({ title: 'Success', description: 'Thanks!', color: 'success' })
    })
    .catch((error) => {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    })
    .finally(() => {
      waitlistFeedbackStatus.value = 'submitted'
    })
}
</script>

<template>
  <div>
    <DefineSectionTemplate v-slot="{ $slots, value }">
      <section class="px-10 max-w-6xl mx-auto">
        <div class="flex flex-col">
          <div class="max-w-xl mx-auto">
            <div class="sticky top-[100px] pt-5">
              <component :is="$slots.default" />
            </div>
          </div>
          <div class="px-5">
            <UAccordion :items="[{ label: 'Learn More', slot: 'mdc' }]" :ui="{ label: 'font-bold' }">
              <template #mdc>
                <div class="max-w-2xl">
                  <MDC :value="value" />
                </div>
              </template>
            </UAccordion>
          </div>
        </div>
      </section>
    </DefineSectionTemplate>
    <div class="gradient" />
    <div class="px-10 max-w-4xl mx-auto mb-10">
      <div class="my-10 max-w-xl text-balance">
        <h1 class="mb-3 text-5xl font-bold">
          Nuxt SEO <span class="text-green-500">Pro</span>
        </h1>
        <p class="leading-relaxed text-lg">
          You've mastered your core technical SEO, now it's time to nurture your content and let your site grow using Nuxt SEO Pro.
        </p>
      </div>
    </div>
    <div class="bg-green-100/50 dark:bg-black/50 py-10 mb-10">
      <div class="px-10 max-w-4xl mx-auto">
        <div class="max-w-xl prose prose-gray relative">
          <div class="mb-7">
            <h2 class="font-semibold text-2xl mb-3 flex items-center gap-2">
              Introduction
            </h2>
            <p class="dark:text-neutral-300 mb-3">
              Hi there, I'm looking to push the Nuxt SEO ecosystem even further, but I'll need your help!
            </p>
            <p class="dark:text-neutral-300 mb-3">
              Introducing Nuxt SEO Pro: a collection of new modules and learning resources to help you further grow your sites organic traffic
              through technical SEO.
            </p>
            <p class="mb-3">
              By supporting me, you support all of my <NuxtLink to="https://harlanzw.com/projects" class="underline">
                open-source work
              </NuxtLink> within the Nuxt ecosystem.
            </p>
            <div>
              <div class="flex items-center gap-2">
                <img src="https://avatars.githubusercontent.com/u/5326365?v=4" alt="Harlan" class="w-8 h-8 rounded-full inline mr-1">
                <div>
                  Harlan
                  <div class="text-sm dark:text-neutral-400 text-neutral-600">
                    Nuxt Core Maintainer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="px-10 max-w-4xl mx-auto mb-5">
      <h2 class="font-semibold text-2xl mb-2 flex items-center gap-2">
        <UIcon name="i-carbon-3rd-party-connected" class="text-blue-300" /> New Modules
      </h2>
      <p class="dark:text-neutral-300">
        Four new modules to help you nurture your organic SEO growth.
      </p>
    </section>
    <div class="max-w-2xl lg:max-w-6xl space-y-5 mb-5 px-10 mx-auto lg:grid grid-cols-2">
      <ReuseSectionTemplate :value="magicRedirects">
        <ModuleCardMagicRedirects />
      </ReuseSectionTemplate>
      <ReuseSectionTemplate :value="gsc">
        <ModuleCardGsc />
      </ReuseSectionTemplate>
      <ReuseSectionTemplate :value="linkChecker">
        <ModuleCardInternalLinks />
      </ReuseSectionTemplate>
      <ReuseSectionTemplate :value="seoAnalyze">
        <ModuleCardSEOValidate />
      </ReuseSectionTemplate>
    </div>
    <section class="px-10 max-w-4xl mx-auto mb-12">
      <div class="mb-7 max-w-xl">
        <h2 class="text-3xl font-bold mb-2">
          Join the waitlist
        </h2>
      </div>
      <div class="lg:flex gap-10 w-full">
        <div>
          <p class="mb-5 max-w-xl text-lg text-[--ui-text-muted]">
            Keep up-to-date with the development of Nuxt SEO Pro by joining the waitlist and receive an exlusive discount on launch in Q1 2025.
          </p>
        </div>
        <div class="mb-5 ">
          Release estimated in<br>
          <UIcon name="i-carbon-calendar" class="-mt-2 text-blue-300" />
          ~{{ daysUntilQ1 }} days
        </div>
      </div>

      <USeparator class="my-3" />
      <div class="lg:grid grid-cols-2 gap-5 space-y-5 lg:space-y-0">
        <div class="flex flex-col items-center justify-center">
          <div class="relative max-w-sm mx-auto ring-green-500 ring  rounded-2xl  p-5 space-y-4 text-left">
            <UBadge variant="soft" color="warning" size="lg" class="absolute font-bold top-5 right-5">
              50% off!
            </UBadge>
            <h3 class="font-bold text-2xl">
              Waitlist Plan.
            </h3>
            <ul class="text-sm space-y-2 list-disc ml-5">
              <li>Up to 5 projects, $39 for each extra project.</li>
              <li>Lifetime updates, access and support.</li>
              <li>Access to the GitHub repos</li>
            </ul>

            <div class="flex flex-row items-center gap-x-1.5">
              <div class="line-through text-2xl">
                $249
              </div>
              <p class="text-neutral-900 dark:text-white text-2xl sm:text-4xl font-semibold">
                $119
              </p>
              <div class="text-xs">
                <p class="text-neutral-600 dark:text-neutral-300 font-semibold">
                  one-time payment
                </p>
                <p class="text-neutral-400 dark:tex-neutral-500">
                  plus local taxes
                </p>
              </div>
            </div>
            <div class="font-bold">
              Save $130
            </div>
            <div class="italic text-sm text-(--ui-text-muted)">
              First release scheduled for Q1 2025.
            </div>
          </div>
        </div>
        <div class="max-w-lg mx-auto bg-neutral-200/30 dark:bg-neutral-900 dark:text-neutral-200 p-10 rounded-2xl py-[70px] flex flex-col items-center justify-center">
          <template v-if="waitlistStatus !== 'submitted'">
            <div class="mb-7">
              <div class="text-xl mb-2 font-semibold">
                Connect your email
              </div>
              <div>
                <p class="text-sm">
                  Receive development updates and an exclusive launch discount of 50% off, saving $130.
                </p>
              </div>
            </div>
            <UForm :schema="ProEmailSchema" :state="waitlistState" class="flex gap-2" :validate-on="['change']" @submit="onSubmit">
              <UFormField name="email">
                <UInput v-model="waitlistState.email" size="xl" type="email" placeholder="Your email" />
              </UFormField>
              <div>
                <UButton type="submit" color="secondary" size="xl" :loading="waitlistStatus === 'loading'">
                  Submit
                </UButton>
              </div>
            </UForm>
          </template>
          <div v-else-if="waitlistFeedbackStatus !== 'submitted'">
            <div class="mb-3 text-lg font-semibold">
              Thanks for signing up!
            </div>
            <div class="mb-3">
              Help me out by letting me know modules interest you and what SEO struggles you have.
            </div>
            <UForm :schema="ProWaitlistFeedbackSchema" :state="waitlistFeedbackState" class="space-y-4" :validate-on="['change']" @submit="onSubmitProWaitlistFeedback">
              <UFormField label="Comments" name="comment" class="mb-3">
                <UTextarea v-model="waitlistFeedbackState.comment" type="textarea" class="w-full" />
              </UFormField>
              <UButton type="submit" size="sm" color="secondary" :loading="waitlistFeedbackStatus === 'loading'">
                Submit
              </UButton>
            </UForm>
          </div>
          <div v-else>
            Thanks for your help!
          </div>
        </div>
      </div>
      <div class="mt-10 justify-center flex-col dark:text-neutral-300/75 flex items-center gap-1">
        <UAvatarGroup size="xl" class="mb-3">
          <UAvatar src="https://cdn.discordapp.com/avatars/212548363529355264/a23dd75d7ffadac117115cb745edb25a.webp?size=240" />
          <UAvatar src="https://pbs.twimg.com/profile_images/1374040164180299791/ACw4G3nZ_400x400.jpg" />
          <UAvatar src="https://pbs.twimg.com/profile_images/1832800489580224512/uqwwtRlK_400x400.jpg" />
          <UAvatar text="+60" class="text-white text-xs font-bold" />
        </UAvatarGroup>
        <div class="text-lg text-center max-w-xs">
          Join the 93 Nuxters who have already signed up.
        </div>
      </div>
      <div class="max-w-lg mx-auto mt-10">
        <UAccordion :items="faq" />
      </div>
    </section>

    <section>
      <div class="mb-10">
        <UContainer>
          <div
            class="relative flex h-[500px] w-full space-y-5 flex-col items-center justify-center overflow-hidden rounded-lg bg-background mb-12"
          >
            <Marquee pause-on-hover class="[--duration:20s]">
              <ReviewCard
                v-for="review in reviews.slice(0, Math.round((reviews.length / 2)))"
                :key="review.username"
                :img="review.img"
                :name="review.name"
                :username="review.username"
                :body="review.body"
              />
            </Marquee>

            <Marquee reverse pause-on-hover class="[--duration:20s]">
              <ReviewCard
                v-for="review in reviews.slice(Math.round((reviews.length / 2)) - 1)"
                :key="review.username"
                :img="review.img"
                :name="review.name"
                :username="review.username"
                :body="review.body"
              />
            </Marquee>

            <div
              class="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-neutral-900"
            />

            <div
              class="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-neutral-900"
            />
          </div>
        </UContainer>
      </div>
    </section>
  </div>
</template>

<style>
</style>
