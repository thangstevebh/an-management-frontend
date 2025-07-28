import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "../constant";

export async function getSessionToken() {
  if (typeof window === "undefined") {
    try {
      const cookieStore = await cookies();
      return cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
    } catch {
      return null;
    }
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getDecodedSession(): Promise<{
  _id: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  agentId?: string;
  exp?: number;
  iat?: number;
  [key: string]: any; // Allow additional properties
} | null> {
  const token = await getSessionToken();
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
}

export async function isAuthenticated() {
  const token = await getSessionToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp && decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  console.log("Session cleared.");
}

export async function updateSession(token: string) {
  const cookieStore = await cookies();
  if (token) {
    cookieStore.set(ACCESS_TOKEN_KEY, token);
    const decodedPayload = jwtDecode(token);
    return decodedPayload;
  } else {
    cookieStore.delete(ACCESS_TOKEN_KEY);
    console.log("Session cleared.");
    return null;
  }
}
