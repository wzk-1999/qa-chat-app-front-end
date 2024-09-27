// src/router/Router.ts
import { createRouter, createWebHistory } from "vue-router";
import ChatWindow from "../components/ChatWindow.vue"; // Your current chat component
import Login from "../components/Login.vue"; // The new login component
import Home from "../components/Home.vue";

const routes = [
  { path: "/", name: "ChatWindow", component: ChatWindow },
  { path: "/login", name: "Login", component: Login },
  { path: "/home", name: "Home", component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
