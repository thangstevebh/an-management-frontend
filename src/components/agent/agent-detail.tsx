export interface IAgent {
  _id: string;
  name: string;

  isMain: boolean;
  owner:
    | []
    | [
        {
          _id: string;
          username: string;
          phoneNumber: string;
          firstName: string | null;
          isChangedPassword: boolean;
          lastName: string | null;
          role: string;
          isDeleted: boolean;
          createdAt: Date;
          updatedAt: Date;
          deletedAt: Date | null;
        },
      ];

  isDeleted: boolean;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
}

export const AgentDetail = ({ agent }: { agent: IAgent }) => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-center mb-6">
        Thông tin đại lý
      </h1>
      <div className="flex flex-col justify-center items-center mb-4">
        <p className="text-gray-500">Vui lòng chọn đại lý để xem chi tiết.</p>
      </div>
      <div className="h-full w-full px-4 lg:px-6">
        <div className="text-white flex flex-row justify-center items-center justify-items-center text-center p-6 rounded-lg shadow-sm border gap-2 bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-md transition-shadow duration-200 ">
          <div className="w-[200px]">
            <label className="block text-sm font-medium">Tên đại lý</label>
            <div className="">
              <span className="text-[#FFDE63] text-lg font-bold text-center">
                {agent?.name}
              </span>
            </div>
          </div>

          <div className="w-[200px]">
            <label className="block text-sm font-medium">Chủ sở hữu</label>
            <div className="mt-1">
              {agent?.owner?.length > 0 ? (
                agent?.owner[0]?.firstName || agent?.owner[0]?.lastName ? (
                  <span>
                    {agent?.owner[0]?.firstName} {agent?.owner[0].lastName}
                  </span>
                ) : (
                  <span>{agent?.owner[0]?.username}</span>
                )
              ) : (
                <span>Không có chủ sở hữu</span>
              )}
            </div>
          </div>

          <div className="w-[200px]">
            <label className="block text-sm font-medium">Trạng thái</label>
            <div className="mt-1">
              {agent.isDeleted ? (
                <span className="text-red-500">Đã xóa</span>
              ) : (
                <span className="text-green-500">Hoạt động</span>
              )}
            </div>
          </div>

          <div className="w-[200px]">
            <label className="block text-sm font-medium">Ngày tạo</label>
            <div className="mt-1">
              {new Date(agent.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>

          <div className="w-[200px]">
            <label className="block text-sm font-medium">Ngày cập nhật</label>
            <div className="mt-1">
              {new Date(agent.updatedAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
