<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <router-view />

  <Toaster
    position="top-center"
    richColors
    :toastOptions="{
      class: '!bg-white/95 !backdrop-blur-md !border !border-gray-200 !shadow-lg !rounded-full !px-6 !py-3 !text-sm !font-medium !text-gray-700',
      style: {
        gap: '12px',
        marginTop: '12px'
      }
    }"
  />
</template>

<style>
@import 'vue-sonner/style.css';
</style>