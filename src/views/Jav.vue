<script setup lang="ts">
import axios from "axios";
import { Button } from "@/components/ui/button";
import { onMounted, ref } from "vue";
import BestNavbar from "../components/BestNavbar.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useRouter } from "vue-router";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const selectedFile = ref<File | null>(null);
const selectedNormalFile = ref<File | null>(null);
const videos = ref<Array<{ id: number; path: string }>>([]);
const videoIds = ref<Array<number>>([]);
const isDisabled = ref(true);
const isDialogOpen = ref(false);
const files = ref<Array<{ id: number; path: string; filename: string }>>([]);
const left = "left" as const;

const formSchema = toTypedSchema(
  z.object({
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(6).max(20),
  })
);

const renewSession = async () => {
  const user = store.getters.getUser;
  if (user) {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/fixtokens?username=${user.name}`,
        { withCredentials: true }
      );
      if (response.status === 200) console.log("Token fix");
    } catch (error) {
      console.error("Token fixing failed!", error);
      router.push("/login");
    }
  } else {
    console.log("vuex getter null");
  }

  try {
    const response = await axios.get("http://localhost:4000/api/renewsession", {
      withCredentials: true,
    });
    if (response.status === 200) {
      console.log("Cookie renewed!");
    } else if (response.status === 401) {
      router.push("/login");
    }
  } catch (error) {
    console.error("Cookie renewal failed!", error);
    router.push("/login");
  }
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
  }
};

const handleNormalFileChange = (event: Event) => {
  // New handler for normal files
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedNormalFile.value = input.files[0];
  }
};

const uploadVideo = async () => {
  if (!selectedFile.value) {
    console.error("No file selected");
    return;
  }

  const formData = new FormData();
  formData.append("video", selectedFile.value);

  try {
    const response = await axios.post(
      "http://localhost:4000/vid/uploadvideo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    if (response.status === 201) {
      toast({
        title: "video uploaded successfully",
      });
      console.log("Video uploaded successfully:", response.data);
      fetchVideos();
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error has ocurred";
    toast({
      variant: "destructive",
      title: "Error uploading video",
      description: errorMessage,
    });
    console.error("Error uploading video:", error);
  }
};

const fetchVideos = async () => {
  try {
    const response = await axios.get("http://localhost:4000/vid/list", {
      withCredentials: true,
    });
    // Check if response.data is an array or an object
    if (Array.isArray(response.data)) {
      videos.value = response.data;
      videoIds.value = response.data.map((video) => video.id); // Store video IDs separately
    } else if (
      typeof response.data === "object" &&
      response.data.id &&
      response.data.path
    ) {
      // If response.data is a single video object, convert it to an array with one element
      videos.value = [response.data];
      videoIds.value = [response.data.id];
    } else {
      console.error("Invalid response format:", response.data);
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

const openVideoInNewTab = async (videoId: number) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/vid/getname",
      { videoId },
      { withCredentials: true }
    );
    const videoFilename = response.data.videoFilename;

    // Make the axios get request to serve the file
    const videoUrl = `http://localhost:4000/vid/${videoFilename}?videoId=${videoId}`;
    window.open(videoUrl, "_blank");
  } catch (error) {
    console.error("Error fetching video:", error);
  }
};

const addAdmin = async (event: Event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    formSchema.parse({ username, password });

    const response = await axios.post("http://localhost:4000/api/jair/add", {
      username,
      password,
    });

    if (response.status === 200) {
      toast({
        title: "Admin added successfully",
      });
      console.log("Admin added successfully:", response.data);

      isDialogOpen.value = false;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join(", ");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage,
      });
      console.error("Validation Error:", errorMessage);
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "An error has occurred";
      toast({
        variant: "destructive",
        title: "Error adding admin",
        description: errorMessage,
      });
      console.error("Error adding admin:", error);
    }
  }
};

const maybeNextTime = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/notToday", {
      withCredentials: true,
    });
    if (response.status !== 200) {
      toast({
        variant: "destructive",
        title: "Unautorized",
      });
      router.push("/home");
    } else {
      toast({
        title: "Success",
        description: response.data.message,
      });
    }
  } catch (err) {
    console.error("cya", err);
    router.push("/home");
    toast({
      variant: "destructive",
      title: "Unautorized",
    });
  }
};

const uploadFile = async () => {
  if (!selectedNormalFile.value) {
    console.error("No file selected");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedNormalFile.value);

  try {
    const response = await axios.post(
      "http://localhost:4000/api/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      toast({
        title: "File uploaded successfully",
      });
      console.log("File uploaded successfully:", response.data);
      fetchFiles();
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error has occurred";
    toast({
      variant: "destructive",
      title: "Error uploading file",
      description: errorMessage,
    });
    console.error("Error uploading file:", error);
  }
};

const fetchFiles = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/files/list", {
      withCredentials: true,
    });
    // Check if response.data is an array or an object
    if (Array.isArray(response.data)) {
      files.value = response.data;
    } else if (
      typeof response.data === "object" &&
      response.data.id &&
      response.data.path
    ) {
      // If response.data is a single file object, convert it to an array with one element
      files.value = [response.data];
    } else {
      console.error("Invalid response format:", response.data);
    }
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

onMounted(async () => {
  maybeNextTime();
  renewSession();
  fetchVideos();
  fetchFiles();
  setTimeout(() => {
    isDisabled.value = false;
  }, 3000);
});
</script>

<template>
  <BestNavbar />
  <div class="mt-20 mx-4">
    <div class="flex m-2">
      <div class="p-1">
        <Sheet>
          <SheetTrigger>
            <Button :disabled="isDisabled"> Add course </Button>
          </SheetTrigger>
          <SheetContent :side="left">
            <SheetHeader>
              <SheetTitle>Add course</SheetTitle>
              <SheetDescription> Add videos to your course </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose as-child>
                <Button type="submit"> Save changes </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div class="p-1">
        <Drawer>
          <DrawerTrigger>
            <Button :disabled="isDisabled"> Add video </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Upload video</DrawerTitle>
              <DrawerDescription
                >This action cannot be undone for now</DrawerDescription
              >
            </DrawerHeader>
            <DrawerFooter>
              <Label for="video">Video</Label>
              <Input
                id="video"
                type="file"
                @change="handleFileChange"
                accept="video/mp4"
              />
              <Button @click="uploadVideo"> Submit </Button>
              <DrawerClose>
                <Button variant="outline"> Cancel </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div class="p-1">
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger as-child>
            <Button :disabled="isDisabled"> Add admin </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add administrator</DialogTitle>
              <DialogDescription>
                Add somebody that can add videos, files and courses
              </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="addAdmin">
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="username" class="text-right"> username </Label>
                  <Input id="username" name="username" class="col-span-3" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="password" class="text-right"> password </Label>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    class="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit"> Submit changes </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div class="p-1">
        <Drawer>
          <DrawerTrigger>
            <Button :disabled="isDisabled"> Add file</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Upload file</DrawerTitle>
              <DrawerDescription
                >This action cannot be undone for now</DrawerDescription
              >
            </DrawerHeader>
            <DrawerFooter>
              <Label for="file">File</Label>
              <Input id="file" type="file" @change="handleNormalFileChange" />
              <Button @click="uploadFile"> Submit </Button>
              <DrawerClose>
                <Button variant="outline"> Cancel </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  </div>
  <h2 class="text-2xl font-bold m-4">All courses</h2>
  <div class="flex flex-col m-2 rounded-md border border-gray-500"></div>

  <h2 class="text-2xl font-bold m-4">All videos</h2>
  <div class="flex flex-col m-2 rounded-md border border-gray-500">
    <div class="flex w-full m-3 pr-4">
      <div class="my-4 mx-2 flex flex-row flex-nowrap">
        <div
          v-for="(video, index) in videos"
          :key="video.id"
          class="m-2"
          @click="() => openVideoInNewTab(videoIds[index])"
        >
          <video width="200" controls>
            <source
              :src="`http://localhost:4000/uploads/${video.path}`"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>
  <h2 class="text-2xl font-bold m-4">All files</h2>
  <div class="flex flex-col m-2 rounded-md border border-gray-500">
    <div class="flex items-center justify-center w-auto m-2">
      <div class="my-4 mx-2 flex flex-col flex-nowrap">
        <div v-for="file in files" :key="file.id" class="m-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="w-full">
                {{ file.filename }}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <span>Download</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
</template>
