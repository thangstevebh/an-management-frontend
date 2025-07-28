"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next/client";
import { ACCESS_TOKEN_KEY } from "@/lib/constant";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/providers/user-provider";

interface User {
  _id: string;
  username: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber: string;
  agentId?: string | null;
  agentRole?: string | null;
  exp?: number;
  iat?: number;
  [key: string]: any; // Allow additional properties
}

type ClientUser = Omit<User, "exp" | "iat">;

interface UseUserReturn {
  user: ClientUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => void;
}

export const useUser = (): UseUserReturn => {
  const router = useRouter();

  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeUser } = useUserStore((state) => state);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getCookie(ACCESS_TOKEN_KEY) as string | null;
      if (!token) {
        throw new Error("No access token found");
      }
      const user = jwtDecode(token);

      setUser(user);
      // storeUser(user); // Store user in the global state
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const userId = useMemo(() => user?._id, [user?._id]);
  const userRole = useMemo(() => user?.role, [user?.role]);
  const isAdmin = useMemo(() => userRole === "admin", [userRole]);
  const agentId = useMemo(() => user?.agentId, [user?.agentId]);
  const agentRole = useMemo(() => user?.agentRole, [user?.agentRole]);

  const memoizedStoreUser = useCallback(
    (userData: typeof user) => {
      if (userData) {
        storeUser(userData);
      }
    },
    [storeUser],
  );

  useEffect(() => {
    if (userId && user) {
      memoizedStoreUser(user);
    }
  }, [userId, memoizedStoreUser]);

  const logout = () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    setUser(null);
    setError(null);
    router.push("/login");
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Now fetchUser has stable reference

  return { user, isAdmin, loading, error, refetch: fetchUser, logout };
};
