import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest, setAccessToken, getAccessToken } from "@/utils/apiRequests";
import { User } from "@/models/User";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user on mount if token exists
  useEffect(() => {
    // We don't store token in localStorage anymore, but if we refresh the page,
    // the apiRequests interceptor will try to refresh the token on first 401.
    // However, we want to know *immediately* if we are logged in.
    // Strategy: Try to fetch /auth/me. If 401, the interceptor will try refresh.
    // If refresh works, /auth/me succeeds -> we are logged in.
    // If refresh fails, /auth/me fails -> we are logged out.

    const initAuth = async () => {
      try {
        // Just try fetching profile. Interceptor handles token refresh.
        const profile = await apiRequest<User>("/auth/me");
        setUser(profile);
      } catch (error) {
        // Use apiRequest error handling? 
        // If 401 and refresh failed, we are not logged in.
        // We silent catch here to just leave user as null.
        console.log("Auth init failed (user not logged in)");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUserProfile = async () => {
    try {
      const profile = await apiRequest<User>("/auth/me");
      console.log(profile);
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  };

  const signIn = async (credentials: any) => {
    // 1. Call Login API
    // The API returns { access_token: "...", token_type: "bearer" }
    // It also sets the HttpOnly cookie.

    // We need to send FormData for OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const data = await apiRequest<{ access_token: string }>(
      "/auth/login",
      "POST",
      formData
    );

    // 2. Set Token in Memory
    setAccessToken(data.access_token);

    // 3. Fetch User Profile
    await refreshUserProfile();

    toast({
      title: "Login realizado com sucesso",
      description: "Bem-vindo de volta!",
    });
  };

  const signUp = async (data: any) => {
    await apiRequest(
      "/auth/register",
      "POST",
      data
    );

    // Automatically login after signup?
    // Or redirect to login? 
    // Usually redirect to login is safer/simpler flow for now.
    toast({
      title: "Conta criada com sucesso",
      description: "Faça login para continuar.",
    });
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", "POST");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      // Optional: Force reload or rely on router redirect
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      logout,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
