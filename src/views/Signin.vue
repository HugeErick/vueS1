<script setup lang="ts">
	import * as z from 'zod'
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { Button } from '@/components/ui/button'
	import {
	  FormControl,
	  FormDescription,
	  FormField,
	  FormItem,
	  FormLabel,
	  FormMessage,
	} from '@/components/ui/form'
	import { Input } from '@/components/ui/input'
	import { toast } from '@/components/ui/toast'
	import { AutoForm } from '@/components/ui/auto-form'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import axios from 'axios'

	const schema = toTypedSchema(z
  .object({
		username : z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, "invalid username format"),
		password: z.string().min(6).max(20)
		.regex(/[A-Z]/, "must contain at least one uppercase letter")
    .regex(/[a-z]/, "must contain at least one lowercase letter")
    .regex(/[0-9]/, "must contain at least one number"),
    confirm: z.string(),
  })
  .refine(data => data.password === data.confirm, {
    message: 'Passwords must match.',
		path: ['confirm'],
  }))

const { handleSubmit } = useForm({
	validationSchema: schema,
})

const router = useRouter()
const loading = ref(false)

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true
    const response = await axios.post('http://localhost:4000/api/caccount', {
      username: values.username,
      password: values.password,
    })
    if (response.status === 201) {
      toast({
        title: 'Account created successfully!',
        description: 'Redirecting to login...',
      })
      router.push('/login')
		} 
	} catch (error) {
		toast({
			variant: 'destructive',
			title: 'Error',
			description: error.response?.data?.error || 'An error occurred',
		})
  } finally {
    loading.value = false
  }
})
</script>

<template>
	<div class="flex justify-center mt-12 py-6">
		<form class="w-1/2 flex flex-col border border-gray-300 rounded-md p-5 gap-5"
					@submit="onSubmit">
      <h2 class="ml-2 text-xl font-bold text-gray-900">Sign up</h2>
			<FormField name="username" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Username" v-bind="componentField"/>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
			<FormField name="password" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="Password" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
			<FormField name="confirm" v-slot="{ componentField }">
        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="Confirm Password" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    	<Button type="submit" class="min-w-14 max-w-1/5 mt-1">
    	  Submit
			</Button>
		</form>
	</div>
</template>
