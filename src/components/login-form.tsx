"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import {
  ILoginResponse,
  loginOptions,
} from "@/lib/queryOptions/login-query-option";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next/client";
import { ACCESS_TOKEN_KEY } from "@/lib/constant";
import { IconInnerShadowBottomRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [clickButton, setClickButton] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    // Reset the button state when the component mounts
    setClickButton(true);
    setDisableButton(true);

    const token = getCookie(ACCESS_TOKEN_KEY) as string | null;
    if (!token) {
      setClickButton(false);
      setDisableButton(false);
      return;
    }

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (token && decoded.exp && decoded.exp > currentTime) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleClick = () => {
    setClickButton(true);
  };

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async ({
      phoneNumber,
      password,
    }: {
      phoneNumber: string;
      password: string;
    }) => {
      setDisableButton(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login` || "/api/login",
        {
          method: "POST" as const,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, password }),
        },
      );
      if (!response.ok) throw new Error("Login failed");
      return response.json();
    },
    onSuccess: (data: ILoginResponse) => {
      setCookie(ACCESS_TOKEN_KEY, data.data.accessToken);
      localStorage.setItem("accessToken", data.data.accessToken);
      // navigate to the home page or dashboard
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get("phoneNumber");
    const password = formData.get("password");

    if (typeof phoneNumber === "string" && typeof password === "string") {
      loginMutation.mutate({ phoneNumber, password });
    } else {
      console.error("Invalid form data");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500" />
      <div>
        <div className="flex justify-center items-center">
          <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full animate-shimmer"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/4 animate-shimmer rounded"></div>
            <div className="h-3 w-1/3 animate-shimmer rounded"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-shimmer rounded"></div>
          <div className="h-4 w-full animate-shimmer rounded"></div>
          <div className="h-4 w-3/4 animate-shimmer rounded"></div>
        </div>
      </div>

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
                      Forgot your password?
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
                  onClick={handleClick}
                  disabled={disableButton}
                  className="w-full hover:bg-gray-100 text-lg hover:text-gray-700 hover:shadow-lg transition-colors duration-100 ease-in-out"
                >
                  Đăng nhập{" "}
                  {clickButton && (
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
