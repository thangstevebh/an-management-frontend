import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Thông tin người dùng</h1>
      <p className="text-gray-600">
        Đang trong giai đoạn phát triển. Bạn có thể thay đổi mật khẩu
      </p>
      <Link
        href="/account/change-password"
        className="text-blue-600 hover:underline"
      >
        Đổi mật khẩu
      </Link>
    </div>
  );
}
