"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { AuthUser, LoginCredentials, SignupCredentials } from "@/types";

interface AuthResponse {
  user: AuthUser;
  message: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get<{ user: AuthUser }>("/api/auth/me");
      return response.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return api.post<AuthResponse>("/api/auth/login", credentials);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/");
      router.refresh();
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      return api.post<AuthResponse>("/api/auth/signup", credentials);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/");
      router.refresh();
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

