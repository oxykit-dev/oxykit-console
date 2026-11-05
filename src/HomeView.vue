<script setup lang="ts">
import { moduleNav } from '@/modules'
</script>

<template>
  <main class="studio">
    <header class="hero">
      <div>
        <p class="brand">OxyKit</p>
        <h1>Console</h1>
        <p class="lede">Open a module that is enabled for this site.</p>
      </div>
    </header>
    <nav class="row" aria-label="Enabled modules">
      <router-link v-for="link in moduleNav" :key="link.id" class="btn" :to="link.to">
        {{ link.label }}
      </router-link>
    </nav>
  </main>
</template>
