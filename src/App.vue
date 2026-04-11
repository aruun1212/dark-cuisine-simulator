<script setup lang="ts">
import AudioControl from './components/AudioControl.vue'
</script>

<template>
  <div class="max-w-md mx-auto bg-light min-h-screen">
    <AudioControl />
    <router-view />
  </div>
</template>