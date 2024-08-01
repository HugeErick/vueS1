<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { useRouter } from 'vue-router';
import { toast } from '@/components/ui/toast';
import { LogOut } from 'lucide-vue-next';
import axios from 'axios';
const store = useStore();
const user = computed(() => store.getters.getUser);
const router = useRouter();

const logOut = async () => {
	//empty store  
	try {
		store.dispatch('logout');
	
		const response = await axios.get('http://localhost:4000/api/logout', { withCredentials : true });
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
  <div class="fixed top-0 inset-x-0 dark:bg-black bg-zinc-50 light:text-black dark:text-white border-b border-zinc-600 border-opacity-60 z-[10] h-14">
    <div class="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Documentation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbList>
						<div @click="logOut" class="hover:cursor-pointer">
							<LogOut
								:size="16"
							/>
						</div>
						
          </BreadcrumbList>
        </BreadcrumbList>
      </Breadcrumb>
      <Avatar v-if="user">
        <AvatarImage :src="user.picture" alt="profile" />
        <AvatarFallback>00</AvatarFallback>
      </Avatar>
    </div>
  </div>
</template>

