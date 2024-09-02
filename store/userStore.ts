import { create } from 'zustand'
import { persist } from 'zustand/middleware'

//store to handle the user state like login, logout, user role and user email
interface UserState {
  isLoggedIn: boolean
  userRole: string | null | undefined
  userEmail: string | null | undefined
  setLoginState: (email: string, role: string) => void
  setLogoutState: () => void
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userRole: null,
      userEmail: null,
      setLoginState: (email: string, role: string) => set({
        isLoggedIn: true,
        userEmail: email,
        userRole: role,
      }),
      setLogoutState: () => set({
        isLoggedIn: false,
        userEmail: null,
        userRole: null,
      }),
    }),
    {
      name: 'user-store',
    }
  )
)

export default useUserStore