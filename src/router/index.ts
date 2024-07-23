import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "../views/Login.vue";
import Signin from "../views/Signin.vue";
import Home from "../views/Home.vue";
import Jav from "../views/Jav.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/signin",
    component: Signin,
  },
  {
    path: "/login",
    component: Login,
  },
	{
		path: "/jav",
		component: Jav,
	},
  {
    path: "/", // Catch all unmatched routes
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

export default router;

