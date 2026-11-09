import { ref, computed } from 'vue'

export interface AdminUser {
  id: string
  username: string
  name: string
  role: 'superadmin' | 'admin'
}

export const useAdminAuth = () => {
  const user = useState<AdminUser | null>('admin_user', () => null)
  const isLoaded = useState<boolean>('admin_auth_loaded', () => false)
  const isLoading = ref(false)

  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAuthenticated = computed(() => Boolean(user.value))

  const fetchUser = async () => {
    isLoading.value = true
    try {
      const res = await $fetch<{ authenticated: boolean; user: AdminUser | null }>('/api/auth/me')
      user.value = res.user
      isLoaded.value = true
      return res.user
    } catch {
      user.value = null
      isLoaded.value = true
      return null
    } finally {
      isLoading.value = false
    }
  }

  const login = async (username: string, password: string) => {
    isLoading.value = true
    try {
      const res = await $fetch<{ success: boolean; user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      })
      if (res && res.user) {
        user.value = res.user
        isLoaded.value = true
        return { success: true, user: res.user }
      }
      return { success: false, message: 'Gagal login.' }
    } catch (err: any) {
      return {
        success: false,
        message: err.data?.statusMessage || 'Kredensial login tidak cocok.',
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    user.value = null
    const router = useRouter()
    router.push('/admin/login')
  }

  return {
    user,
    isLoaded,
    isLoading,
    isSuperAdmin,
    isAuthenticated,
    fetchUser,
    login,
    logout,
  }
}
