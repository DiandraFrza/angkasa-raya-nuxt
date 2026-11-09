export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) {
    return
  }

  const { user, isLoaded, fetchUser } = useAdminAuth()

  // Ensure user state is loaded from session
  if (!isLoaded.value) {
    await fetchUser()
  }

  // If user is already logged in and navigates to /admin/login
  if (to.path === '/admin/login') {
    if (user.value) {
      return navigateTo('/admin')
    }
    return
  }

  // If user is NOT logged in and attempts to access any /admin page
  if (!user.value) {
    return navigateTo({
      path: '/admin/login',
      query: { redirect: to.fullPath !== '/admin' ? to.fullPath : undefined },
    })
  }
})
