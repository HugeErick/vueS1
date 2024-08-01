<script setup lang="ts"> 
	import { computed } from 'vue';
	import BestNavbar from '../components/BestNavbar.vue';
	import { Button } from '@/components/ui/button';
	import axios from 'axios';
	import { useRouter } from 'vue-router';
	import {useStore} from 'vuex'
	import { LogOut } from 'lucide-vue-next';
	import { toast } from '@/components/ui/toast';
	const store = useStore();
	const user = computed(() => store.getters.getUser);
	const router = useRouter();

	const logOut = async () => {
		try {
			store.dispatch('logout');
			const response =
			await axios.get('http://localhost:4000/api/logout', { withCredentials : true });
			if (response.status === 200) {
				toast({
					title : 'Log out successfully'
				});
				router.push('/login');
			}
		} catch (err) {
			toast({
				variant : 'destructive',
				title : 'Something went wrong'
			});
		}
	}
</script>

<template>
	<BestNavbar/>
	<div class="mt-20 flex flex-col gap-2 p-2">
		<h2 class="text-4xl font-bold">
			Settings
		</h2>
		<Button @click="logOut" class="w-1/4 m-2">
			Log out
		</Button>
	</div>
</template>
