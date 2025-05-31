import { useEffect, createContext, useState } from "react";
import type { ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase.config";
import { apiConfig } from "../config/api.config";
import type { UserData, AuthContextType } from "../types/auth.types";

const defaultContextValue: AuthContextType = {
  userData: null,
  isLoading: false,
  error: null,
  setError: () => {},
  login: async () => {},
  logout: async () => {},
  getIdToken: async () => {
    throw new Error("Auth context not initialized");
  },
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthContextType["error"] | null>(null);
  const handleTokenAuth = async (user: FirebaseUser) => {
    setIsLoading(true);
    setError(null);
    const idToken = await user.getIdToken(true);
    try {
      const response = await apiConfig.post(
        "/api/login",
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.status === 200) {
        setUserData(response.data);
      } else {
        console.error("Error verifying user:", response);
      }
    } catch (err: any) {
      setError({ message: err.message });
      setUserData(null);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await handleTokenAuth(currentUser);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    //TO-DO: add option to enter name
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await handleTokenAuth(userCredential.user);
    } catch (err: any) {
      setError({ message: err.message });
      console.error("Error logging in:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const getIdToken = async () => {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      return idToken;
    }
    throw new Error("No authenticated user");
  };
  const contextValue: AuthContextType = {
    userData,
    isLoading,
    error,
    setError,
    login,
    logout,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
