<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <LegoTweet
    v-if="id"
    v-slot="{ url }"
    :tweet-id="id"
    class="tweet max-w-[550px] mx-auto my-15 dark:bg-black bg-white p-4 rounded-xl border not-prose dark:border-gray-700"
  >
    <div class="flex justify-between">
      <LegoTweetUser v-slot="{ user }">
        <div class="flex items-center">
          <div>
            <img
              loading="lazy"
              width="48"
              height="48"
              :style="{
                'border-radius':
                  user.profile_image_shape === 'Square' ? '5px' : '99999px',
              }"
              :src="user.profile_image_url_https"
              :alt="user.name"
            >
            <Icon
              v-if="user.verified || user.is_blue_verified"
              name="material-symbols:verified-rounded"
            />
          </div>
          <div class="ml-3">
            <div class="font-semibold leading-5">
              {{ user.name }}
            </div>
            <div class="text-gray-400">
              @{{ user.screen_name }}
            </div>
          </div>
        </div>
      </LegoTweetUser>

      <LegoTweetLink :href="url" class="unstyled">
        <Icon name="uil:twitter" class="text-4xl text-blue-300" />
      </LegoTweetLink>
    </div>
    <LegoTweetText
      class="mt-4 text-base md:text-lg"
      link-class="text-blue-500 hover:underline"
    />

    <LegoTweetMedia
      class="mt-2 rounded-xl overflow-hidden border max-h-[290px]"
    />
    <LegoTweetSummaryCard
      v-slot="{ title, description, domain }"
      class="mt-2 border rounded-xl overflow-hidden bg-white hover:bg-gray-100 transition"
    >
      <div class="px-4 py-2 h-full">
        <p class="text-sm text-gray-400">
          {{ domain }}
        </p>
        <p>{{ title }}</p>
        <p class="text-sm text-gray-400 unstyled">
          {{ description }}
        </p>
      </div>
    </LegoTweetSummaryCard>

    <div class="mt-2 text-gray-400 flex justify-between">
      <LegoTweetCreatedAt class="unstyled" />
    </div>

    <div class="my-2 h-[1px] w-full bg-gray-200 dark:bg-gray-700" />

    <LegoTweetAction class="text-gray-500 flex space-x-4">
      <LegoTweetActionLove
        v-slot="{ favorite_count }"
        class="group flex items-center font-semibold text-sm space-x-1 unstyled"
      >
        <LegoTweetActionLoveIcon
          class="text-pink-600 group-hover:bg-pink-100 p-1.5 rounded-full w-8 h-8"
        />
        <span class="group-hover:text-pink-600 group-hover:underline">
          {{ favorite_count }}
        </span>
      </LegoTweetActionLove>

      <LegoTweetActionReply
        class="group flex items-center font-semibold text-sm space-x-1 unstyled"
      >
        <LegoTweetActionReplyIcon
          class="text-blue-400 group-hover:bg-blue-100 p-1.5 rounded-full w-8 h-8"
        />
        <span class="group-hover:text-blue-400 group-hover:underline">
          Reply
        </span>
      </LegoTweetActionReply>
      <LegoTweetActionCopy
        v-slot="{ copied }"
        class="group flex items-center unstyled font-semibold text-sm space-x-1"
      >
        <LegoTweetActionCopyIcon
          class="group-hover:bg-green-100 group-hover:text-green-500 p-1.5 rounded-full w-8 h-8"
        />

        <span class="group-hover:text-green-400 group-hover:underline">
          {{ copied ? "Copied!" : "Copy link" }}
        </span>
      </LegoTweetActionCopy>
    </LegoTweetAction>

    <LegoTweetReplies
      class="py-2 px-4 mt-2 flex unstyled justify-center text-sm font-medium text-blue-500 dark:border-gray-700 dark:bg-black bg-white hover:bg-blue-50 transition rounded-3xl border"
    />
  </LegoTweet>
</template>

<style>
.tweet img {
  margin: 0 !important;
}
</style>
