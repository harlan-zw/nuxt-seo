<template>
  <div>
    <div>
      <Breadcrumbs>
        <template #breadcrumb="{ to, title }">
        <NuxtLink :to="to">
          {{ title }}
        </NuxtLink>
        </template>
      </Breadcrumbs>
    </div>
    <div>
      <OgImageStatic />
      <SeoKit :site-description="'test'" />
    </div>
    <div>
      <NuxtPage />
    </div>
    <div style="width: 400px; margin-top: 50px;">
      <DebugHead />
    </div>
  </div>
</template>
