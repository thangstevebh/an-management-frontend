import axios from "axios";
import { getCookie } from "cookies-next/client";
import { ACCESS_TOKEN_KEY } from "@/lib/constant";

export const useAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL + "/api",
  timeout: 10000, // Request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

useAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Ensure we are in a browser environment
      const accessToken = getCookie(ACCESS_TOKEN_KEY); // Get token from cookie

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default useAxios;
