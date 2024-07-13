<script setup lang="ts">
	import Toaster from '@/components/ui/toast/Toaster.vue'
	import BestNavbar from './components/BestNavbar.vue' 
</script>

<template>
<BestNavbar/>
<br>
<router-view/>
<Toaster/>
</template>
