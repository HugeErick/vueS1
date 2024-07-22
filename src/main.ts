import { createApp } from 'vue'
import './assets/index.css'
//@ts-ignore
import App from './App.vue'
import router from "./router"

createApp(App).use(router).mount('#app')
