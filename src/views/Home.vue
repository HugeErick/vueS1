<script setup lang="ts">
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { onMounted, ref } from 'vue';
import BestNavbar from '../components/BestNavbar.vue' 
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const selectedFile = ref<File | null>(null);
const videos = ref<Array<{ id: number, path: string }>>([]);
const videoIds = ref<Array<number>>([]); // Array to store video IDs

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
  }
};


const fetchVideos = async () => {
  try {
    const response = await axios.get('http://localhost:4000/vid/list', { withCredentials: true });
		 // Check if response.data is an array or an object
    if (Array.isArray(response.data)) {
      videos.value = response.data;
      videoIds.value = response.data.map(video => video.id); // Store video IDs separately
    } else if (typeof response.data === 'object' && response.data.id && response.data.path) {
      // If response.data is a single video object, convert it to an array with one element
      videos.value = [response.data];
      videoIds.value = [response.data.id];
    } else {
      console.error('Invalid response format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
};

const openVideoInNewTab = async (videoId: number) => {
	try {
		const response = await axios.post('http://localhost:4000/vid/getname', { videoId }, {withCredentials: true });
		const videoFilename = response.data.videoFilename;

	 // Make the axios get request to serve the file
    const videoUrl = `http://localhost:4000/vid/${videoFilename}?videoId=${videoId}`;
    window.open(videoUrl, '_blank');
  } catch (error) {
    console.error('Error fetching video:', error);
  }
};

onMounted(async () => {
	axios.get('http://localhost:4000/api/renewsession', {withCredentials : true})
		.then(response =>  {
			if (response.status === 200) {
				console.log('Cookie renewed!');
			}
		}) 
		.catch(error => {
			console.error('Cookie renewed failed!', error);
		});

		fetchVideos();
 });

</script>

<template>
	<BestNavbar/>
	<div class="mt-14 mx-4">
		<div class="flex flex-col items-center rounded-md border border-gray-500">
			<div class="my-4 mx-2 flex flex-row flex-nowrap">
				<div
					v-for="(video, index) in videos"
					:key="video.id"
					class="m-2"
					@click="() => openVideoInNewTab(videoIds[index])"
					>
						<video width="200" controls>
							<source :src="`http://localhost:4000/uploads/${video.path}`" type="video/mp4">
							Your browser does not support the video tag.
						</video>
        </div>
			</div>
		</div>
	</div>
</template>

