<script setup lang="ts">
import { googleSdkLoaded } from 'vue3-google-login';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useRouter } from 'vue-router';
import { toast } from '@/components/ui/toast';
import { useStore } from 'vuex';
import { LogIn } from 'lucide-vue-next';

const router = useRouter();
const store = useStore();

const login = () => {
  googleSdkLoaded(google => {
    google.accounts.oauth2
      .initCodeClient({
        client_id: '411359737044-tlankfahu6uh3vqqede0qd9nnqjtd01a.apps.googleusercontent.com',
        scope: 'email profile openid',
        redirect_uri: 'http://localhost:4000/auth/callback',
        callback: response => {
          if (response.code) {
            sendCodeToBackend(response.code);
          }
        },
      })
      .requestCode();
  });
};

const sendCodeToBackend = async (code: string) => {
  try {
    const headers = {
      Authorization: code,
    };
    const response = await axios.post('http://localhost:4000/auth', null, { headers });
    const userDetails = response.data;
    store.dispatch('login', { user: userDetails, token: userDetails.token });

    router.push('/home');
  } catch (error) {
    console.error('Failed to send authorization code:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to sign in with Google',
    });
  }

	
};
</script>

<template>
  <div>
    <Button @click="login">
			Login with Google
			<LogIn class="ml-2"/>
		</Button>
  </div>
</template>

<script lang="ts">
	export default {
		name : 'GoogleSignUpButton'
	}
</script>

