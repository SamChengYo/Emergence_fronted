export default defineNuxtRouteMiddleware((to, from) => {
    if (!localStorage.getItem('token') && to.path !== '/login') {
      return navigateTo('/login');
    }
  });
  