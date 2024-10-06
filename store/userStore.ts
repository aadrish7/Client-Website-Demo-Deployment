import { create } from 'zustand'
import { persist } from 'zustand/middleware'

//store to handle the user state like login, logout, user role, user email, surveyId, companyId, and companyName
interface UserState {
  isLoggedIn: boolean;
  userRole: string | null | undefined;
  userEmail: string | null | undefined;
  surveyId: string | null | undefined;
  companyId: string | null | undefined; // Add companyId property
  companyName: string | null | undefined; // Add companyName property
  setLoginState: (email: string, role: string) => void;
  setLogoutState: () => void;
  setSurveyId: (id: string) => void;
  setCompanyId: (id: string) => void; // Setter function for companyId
  setCompanyName: (name: string) => void; // Setter function for companyName
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userRole: null,
      userEmail: null,
      surveyId: null,
      companyId: null, // Initialize companyId as null
      companyName: null, // Initialize companyName as null
      setLoginState: (email: string, role: string) => set({
        isLoggedIn: true,
        userEmail: email,
        userRole: role,
      }),
      setLogoutState: () => set({
        isLoggedIn: false,
        userEmail: null,
        userRole: null,
        surveyId: null,
        companyId: null, // Reset companyId on logout
        companyName: null, // Reset companyName on logout
      }),
      setSurveyId: (id: string) => set({
        surveyId: id,
      }),
      setCompanyId: (id: string) => set({
        companyId: id, // Set companyId
      }),
      setCompanyName: (name: string) => set({
        companyName: name, // Set companyName
      }),
    }),
    {
      name: 'user-store', // Persist the store in local storage
    }
  )
);

export default useUserStore;
