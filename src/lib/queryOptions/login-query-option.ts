export interface LoginParams {
  phoneNumber: string;
  password: string;
}

export interface ILoginResponse {
  code: number;
  status: string;
  error: null | string;
  message: string;
  data: {
    accessToken: string;
  };
}

export function loginOptions({ phoneNumber, password }: LoginParams) {
  return {
    queryKey: ["login", phoneNumber],
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`,
    method: "POST" as const,
    body: { phoneNumber, password },
    headers: {
      "Content-Type": "application/json",
    },
  };
}
