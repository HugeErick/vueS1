<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import axios from 'axios';
import GoogleSignUpButton from '../components/GoogleSignUpButton.vue'

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

const username = ref('');
const password = ref('');

const formSchema = toTypedSchema(z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(6).max(20),
}));

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const router = useRouter();
const loading = ref(false);

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true;
    const response = await axios.post('http://localhost:4000/api/login', {
      username: values.username,
      password: values.password,
		}, {withCredentials: true});
    if (response.status === 200) {
      toast({
        title: 'Login successful!',
				description: `Welcome ${values.username}`,
      });
    const role = response.data.role;
      if (role === 'admin') {
        router.push('/jav');
      } else {
        router.push('/home');
      }}
  } catch (error:any) {
    toast({
			variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.error || 'An error occurred',
    });
  } finally {
    loading.value = false;
  }
});

const isFormValid = computed(() => {
  const isUsernameValid = username.value.length >= 3 && username.value.length <= 20;
  const isPasswordValid = password.value.length >= 6 && password.value.length <= 20;
  return isUsernameValid && isPasswordValid;
});

onMounted(() => {
  axios.get('http://localhost:4000/api/protected', { withCredentials: true })
    .then(response => {
      if (response.status === 200) {
        const role = response.data.role;
        if (role === 'admin') {
          router.push('/jav');
        } else {
          router.push('/home');
        }
      }
    })
    .catch(error => {
      console.log('User not logged in', error);
    });
});


</script>

<template>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-300 rounded-md container-lg">
    <div class="flex flex-col justify-center items-center p-2">
      <form class="max-w-full space-y-6 p-2" @submit.prevent="onSubmit">
        <FormField v-slot="{ componentField }" name="username">
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="username"
                v-model="username"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="password"
                v-model="password"
                v-bind="componentField"
              />
            </FormControl>
          </FormItem>
        </FormField>
        <div class="flex items-start justify-center flex-col gap-4">
          <a href="/signin" class="text-sm hover:underline text-cyan-600 font-bold">Sign in</a>
					<div class="flex mx-auto items-center justify-center">
						<GoogleSignUpButton/>
					</div>
          <Button type="submit" :disabled="!isFormValid || loading">
            Submit
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

