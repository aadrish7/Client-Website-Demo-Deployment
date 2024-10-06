import { create } from 'zustand'
import { persist } from 'zustand/middleware'

//store to handle the user state like login, logout, user role, user email, and surveyId
interface UserState {
  isLoggedIn: boolean
  userRole: string | null | undefined
  userEmail: string | null | undefined
  surveyId: string | null | undefined // Add surveyId property
  setLoginState: (email: string, role: string) => void
  setLogoutState: () => void
  setSurveyId: (id: string) => void // Setter function for surveyId
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userRole: null,
      userEmail: null,
      surveyId: null, // Initialize surveyId as null
      setLoginState: (email: string, role: string) => set({
        isLoggedIn: true,
        userEmail: email,
        userRole: role,
      }),
      setLogoutState: () => set({
        isLoggedIn: false,
        userEmail: null,
        userRole: null,
        surveyId: null, // Reset surveyId on logout
      }),
      setSurveyId: (id: string) => set({
        surveyId: id, // Set surveyId
      }),
    }),
    {
      name: 'user-store', // Persist the store in local storage
    }
  )
)

export default useUserStore
