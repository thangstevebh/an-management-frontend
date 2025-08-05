"use client";

import { Button } from "@/components/ui/button";
import { ButtonBack } from "@/components/ui/button-back";
import { ValidatedInput } from "@/components/ui/input-validate";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import useAxios from "@/lib/axios/axios.config";
import { ACCESS_TOKEN_KEY, ICommonResponse } from "@/lib/constant";
import { ILoginResponse } from "@/lib/queryOptions/login-query-option";
import { changePasswordSchema } from "@/lib/validation/change-password-schema";
import { IconInnerShadowBottomRight } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { setCookie } from "cookies-next/client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useUser();

  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [agentRole, setAgentRole] = useState<"member" | "manager">("member");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const changePasswordMutation = useMutation({
    mutationKey: ["change-password", user?._id, wasSubmitted],
    mutationFn: async (payload: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => {
      const response = await useAxios.post(
        `user/change-password`,
        {
          ...payload,
        },
        {
          headers: {
            "x-agent": (user?.agentId || "") as string,
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setWasSubmitted(false);
      if (formRef.current) {
        formRef.current.reset();
      }
      toast.success("Đổi mật khẩu thành công", {
        description: "Bạn đã đổi mật khẩu thành công.",
      });
    },
    onError: (error) => {
      toast.error("Đổi mật khẩu thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
    },
  });

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
        `auth/login`,
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const checkData = {
      oldPassword: formData.get("oldPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmNewPassword: formData.get("confirmNewPassword") as string,
    };

    /*
     * Zod validation can be added here if needed
     * */
    const validationResult = changePasswordSchema.safeParse(checkData);
    if (!validationResult.success) {
      setWasSubmitted(true);
      event.preventDefault();
      return;
    }

    const createPayload: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    } = {
      ...checkData,
    };

    await changePasswordMutation.mutateAsync({
      ...createPayload,
    });

    await loginMutation.mutateAsync({
      phoneNumber: user?.phoneNumber || "",
      password: createPayload.newPassword,
    });
  };

  return (
    <div>
      <ButtonBack />
      <div className="flex flex-col h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
        <p className="text-gray-500 text-center mt-2">
          Bạn có thể đổi mật khẩu của mình tại đây. Vui lòng nhập mật khẩu hiện
          tại và mật khẩu mới để hoàn tất quá trình đổi mật khẩu.
        </p>
        <p className="text-red-500 text-center text-sm">
          Lưu ý: Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chuỗi ký tự, chữ
          hoa, chữ thường và số. Mật khẩu không được chứa khoảng trắng.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto flex flex-col gap-3 mt-6"
      >
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="oldPassword">
            Mật khẩu hiện tại:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu hiện tại"
              wasSubmitted={wasSubmitted}
              fieldSchema={changePasswordSchema.shape["oldPassword"]}
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? (
                <EyeOffIcon className="!size-5" />
              ) : (
                <EyeIcon className="size-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="newPassword">
            Mật khẩu mới:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className=""
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              wasSubmitted={wasSubmitted}
              fieldSchema={changePasswordSchema.shape["newPassword"]}
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOffIcon className="!size-5" />
              ) : (
                <EyeIcon className="!size-5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-2">
          <Label className="" htmlFor="confirmNewPassword">
            Xác nhận mật khẩu mới:
          </Label>
          <div className="relative w-full">
            <ValidatedInput
              className="pr-10"
              name="confirmNewPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              wasSubmitted={wasSubmitted}
              fieldSchema={changePasswordSchema.shape["confirmNewPassword"]}
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="!size-5" />
              ) : (
                <EyeIcon className="!size-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-4">
          <Button
            type="submit"
            className="w-full max-w-xs"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <>
                Đang thay đổi...
                <IconInnerShadowBottomRight className="animate-spin h-8 w-8 text-blue-500 !size-6" />
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
