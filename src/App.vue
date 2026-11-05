<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import OxyKitNav from '@/shell/OxyKitNav.vue'
import { modules } from '@/modules'

const MailAccountNav = defineAsyncComponent(
  () => import('@mail/shared/components/layout/AppNavbar.vue'),
)

const route = useRoute()
const studio = computed(() => route.meta.studio === true)
</script>

<template>
  <OxyKitNav>
    <MailAccountNav v-if="modules.mail" />
  </OxyKitNav>
  <div :class="{ 'studio-page': studio }">
    <router-view />
  </div>
</template>
