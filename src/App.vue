<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue";
</script>

<template>
  <div class="overflow-x-hidden">
    <router-view />
    <Toaster />
  </div>
</template>
