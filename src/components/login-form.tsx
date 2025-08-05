"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { ILoginResponse } from "@/lib/queryOptions/login-query-option";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next/client";
import { ACCESS_TOKEN_KEY, ICommonResponse } from "@/lib/constant";
import { IconInnerShadowBottomRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useAxios from "@/lib/axios/axios.config";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie(ACCESS_TOKEN_KEY) as string | null;
    if (!token) {
      return;
    }

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (token && decoded.exp && decoded.exp > currentTime) {
      router.push("/dashboard");
    }
  }, [router]);

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async ({
      phoneNumber,
      password,
    }: {
      phoneNumber: string;
      password: string;
    }) => {
      const response = await useAxios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login` || "/api/login",
        {
          phoneNumber,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    },
    onSuccess: (data: ILoginResponse) => {
      setCookie(ACCESS_TOKEN_KEY, data.data.accessToken);
      localStorage.setItem("accessToken", data.data.accessToken);
      // navigate to the home page or dashboard
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as ICommonResponse;
      toast.error(
        `Đăng nhập thất bại: ${errorResponse?.message || "Lỗi không xác định"}`,
        {
          description: "Vui lòng kiểm tra lại thông tin đăng nhập của bạn.",
        },
      );
    },
    retry: 3,
    retryDelay: 1000,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get("phoneNumber");
    const password = formData.get("password");

    if (typeof phoneNumber === "string" && typeof password === "string") {
      loginMutation.mutate({ phoneNumber, password });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="string"
                    placeholder="09612345678"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full hover:bg-gray-100 text-lg hover:text-gray-700 hover:shadow-lg transition-colors duration-100 ease-in-out"
                >
                  Đăng nhập{" "}
                  {loginMutation.isPending && (
                    <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="#" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
