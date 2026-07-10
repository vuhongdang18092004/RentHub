import { ReactNode } from "react";

export interface ActivityItem {
  id: string | number;
  type: string;
  description: string;
  user: string;
  date: string;
  status?: string;
  statusColor?: string;
  action?: ReactNode;
}

interface RecentActivityTableProps {
  title: string;
  data: ActivityItem[];
  className?: string;
}

export function RecentActivityTable({ title, data, className = "" }: RecentActivityTableProps) {
  return (
    <div className={`bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-secondary flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-tertiary text-secondary font-semibold border-b border-secondary">
            <tr>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Hoạt động</th>
              <th className="px-6 py-3">Người dùng</th>
              <th className="px-6 py-3">Thời gian</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-secondary">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-tertiary/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-primary">{item.type}</span>
                  </td>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-tertiary">{item.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-tertiary">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.statusColor || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {item.action || (
                      <button className="text-brand-600 hover:text-brand-700 font-medium">Chi tiết</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
