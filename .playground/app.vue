<template>
  <div>
    <Breadcrumbs style="display: flex; list-style: none; margin: 0; padding: 0;">
      <template #breadcrumb="{ to, title, last, first }">
        <InternalLink v-if="first" :to="to" style="margin-right: 10px;">
          Go Home
        </InternalLink>
        <InternalLink v-else-if="!last" :to="to" style="margin-right: 10px;">
          {{ title }}
        </InternalLink>
        <span v-else>
          {{ title }}
        </span>
      </template>
    </Breadcrumbs>
    <SeoKit>
      <NuxtPage />
    </SeoKit>
    <div style="width: 400px; margin-top: 50px;">
      <DebugHead />
    </div>
  </div>
</template>
