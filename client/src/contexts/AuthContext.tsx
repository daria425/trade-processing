import { useEffect, createContext, useState } from "react";
import type { ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
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
  signup: async () => {},
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
        "/api/trader/login",
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
      if (currentUser && !userData) {
        // Only call handleTokenAuth if we don't already have user data
        await handleTokenAuth(currentUser);
      } else if (!currentUser) {
        setUserData(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [userData]);

  const login = async (email: string, password: string) => {
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

  const signup = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Create user in Firebase Authentication
      console.log("Signing up with:", {
        email,
        username,
        password,
      });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Get the ID token
      const idToken = await userCredential.user.getIdToken(true);

      // 3. Register user in your backend
      const response = await apiConfig.post(
        "/api/trader/signup",
        { name: username }, // Pass name to backend
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.status === 201) {
        // Successfully registered
        setUserData(response.data);
      } else {
        console.error("Error registering user:", response);
        setError({ message: "Failed to register user" });
        // Optionally delete the Firebase user if backend registration fails
        await userCredential.user.delete();
      }
    } catch (err: any) {
      setError({ message: err.message });
      setUserData(null);
      console.error("Error signing up:", err);
    } finally {
      setIsLoading(false);
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
    signup,
    logout,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
